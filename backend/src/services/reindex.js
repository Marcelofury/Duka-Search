import { db } from '../config/firebase.js';
import {
  DUKA_COLLECTION,
  dukaItemsSchema,
  typesenseClient,
} from '../config/typesense.js';

const PAGE_SIZE = 500;

const INDEXED_FIELDS = new Set(dukaItemsSchema.fields.map((field) => field.name));
const REQUIRED_FIELDS = [
  'name',
  'category',
  'vendor_name',
  'market_location',
  'price_ugx',
  'in_stock',
];

function normalizeValue(value) {
  if (value && typeof value.toMillis === 'function') {
    return value.toMillis();
  }
  return value;
}

function toTypesenseDocument(id, data) {
  const document = { id };

  for (const field of INDEXED_FIELDS) {
    const value = normalizeValue(data[field]);
    if (value !== undefined && value !== null) {
      document[field] = value;
    }
  }

  return document;
}

function isIndexable(document) {
  if (!REQUIRED_FIELDS.every((field) => document[field] !== undefined)) {
    return false;
  }
  if (!Number.isInteger(document.price_ugx)) return false;
  if (typeof document.in_stock !== 'boolean') return false;
  return true;
}

/**
 * Rebuilds the Typesense collection from Firestore when the local index is
 * empty (e.g. after a restart on ephemeral storage). Pass `force: true` to
 * re-upsert every document even when the index already has data.
 */
export async function reindexFromFirestore({ force = false } = {}) {
  const collections = await typesenseClient.collections().retrieve();
  const collection = collections.find((entry) => entry.name === DUKA_COLLECTION);

  if (!collection) {
    throw new Error(`Typesense collection "${DUKA_COLLECTION}" does not exist`);
  }

  const existingDocuments = Number(collection.num_documents) || 0;
  if (existingDocuments > 0 && !force) {
    console.log(
      `Typesense already has ${existingDocuments} document(s); skipping reindex.`,
    );
    return { skipped: true, indexed: 0, failed: 0, existing: existingDocuments };
  }

  console.log('Reindexing Firestore items into Typesense...');

  let lastSnapshot = null;
  let indexed = 0;
  let failed = 0;
  let skipped = 0;

  while (true) {
    let query = db
      .collection(DUKA_COLLECTION)
      .orderBy('__name__')
      .limit(PAGE_SIZE);
    if (lastSnapshot) {
      query = query.startAfter(lastSnapshot);
    }

    const snapshot = await query.get();
    if (snapshot.empty) break;

    lastSnapshot = snapshot.docs[snapshot.docs.length - 1];

    const documents = [];
    for (const doc of snapshot.docs) {
      const document = toTypesenseDocument(doc.id, doc.data());
      if (isIndexable(document)) {
        documents.push(document);
      } else {
        skipped += 1;
        console.warn(`Skipping Firestore item ${doc.id}: invalid Typesense document`);
      }
    }

    if (documents.length > 0) {
      try {
        const results = await typesenseClient
          .collections(DUKA_COLLECTION)
          .documents()
          .import(documents, { action: 'upsert' });
        const failures = results.filter((result) => !result.success);
        indexed += results.length - failures.length;
        failed += failures.length;
        for (const failure of failures) {
          console.warn(
            `Typesense import failed for item ${failure.id}: ${failure.error}`,
          );
        }
      } catch (error) {
        failed += documents.length;
        console.warn('Typesense batch import failed:', error.message);
      }
    }

    if (snapshot.size < PAGE_SIZE) break;
  }

  console.log(
    `Reindex complete: ${indexed} indexed, ${failed} failed, ${skipped} skipped.`,
  );

  return { skipped: false, indexed, failed, skipped };
}
