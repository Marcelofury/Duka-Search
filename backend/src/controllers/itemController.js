import { db } from '../config/firebase.js';
import { DUKA_COLLECTION, typesenseClient } from '../config/typesense.js';

const COLLECTION_NAME = DUKA_COLLECTION;

const REQUIRED_FIELDS = [
  'name',
  'category',
  'vendor_name',
  'market_location',
  'price_ugx',
];

function validatePayload(body, { partial = false } = {}) {
  const errors = [];

  if (!partial) {
    for (const field of REQUIRED_FIELDS) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        errors.push(`Missing required field: ${field}`);
      }
    }
  }

  if (body.price_ugx !== undefined && body.price_ugx !== null) {
    const price = Number(body.price_ugx);
    if (!Number.isInteger(price) || price < 0) {
      errors.push('price_ugx must be a non-negative integer');
    }
  }

  if (body.in_stock !== undefined && typeof body.in_stock !== 'boolean') {
    // Accept common truthy/falsy representations.
    if (!['true', 'false', 0, 1].includes(body.in_stock)) {
      errors.push('in_stock must be a boolean');
    }
  }

  if (body.location !== undefined && body.location !== null) {
    if (
      !Array.isArray(body.location) ||
      body.location.length !== 2 ||
      body.location.some((value) => Number.isNaN(Number(value)))
    ) {
      errors.push('location must be a [latitude, longitude] pair');
    }
  }

  return errors;
}

function normalizePayload(body) {
  const data = {};

  if (body.name !== undefined) data.name = String(body.name).trim();
  if (body.category !== undefined) data.category = String(body.category).trim();
  if (body.vendor_name !== undefined) {
    data.vendor_name = String(body.vendor_name).trim();
  }
  if (body.market_location !== undefined) {
    data.market_location = String(body.market_location).trim();
  }
  if (body.price_ugx !== undefined && body.price_ugx !== null) {
    data.price_ugx = Number(body.price_ugx);
  }
  if (body.in_stock !== undefined) {
    data.in_stock = body.in_stock === true || body.in_stock === 'true' || body.in_stock === 1;
  }
  if (body.description !== undefined) {
    data.description = String(body.description).trim();
  }
  if (body.location !== undefined && body.location !== null) {
    data.location = [Number(body.location[0]), Number(body.location[1])];
  }
  if (body.location === null) {
    data.location = null;
  }

  return data;
}

function toTypesenseDocument(id, data) {
  const document = { id };

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) document[key] = value;
  }

  return document;
}

export async function createItem(req, res) {
  try {
    const errors = validatePayload(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const itemRef = db.collection(COLLECTION_NAME).doc();
    const itemId = itemRef.id;
    const payload = normalizePayload(req.body);

    const firestoreData = {
      id: itemId,
      ...payload,
      created_at: Date.now(),
      updated_at: Date.now(),
    };

    await itemRef.set(firestoreData);

    const typesenseDoc = toTypesenseDocument(itemId, firestoreData);
    await typesenseClient.collections(COLLECTION_NAME).documents().create(typesenseDoc);

    return res.status(201).json({
      success: true,
      message: 'Item created in Firestore and indexed in Typesense',
      data: typesenseDoc,
    });
  } catch (error) {
    console.error('Error creating item:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while synchronizing item',
    });
  }
}

export async function updateItem(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Item ID is required' });
    }

    const errors = validatePayload(req.body, { partial: true });
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const snapshot = await docRef.get();
    if (!snapshot.exists) {
      return res.status(404).json({ success: false, error: `Item ${id} not found` });
    }

    const payload = normalizePayload(req.body);
    const updateData = { ...payload, updated_at: Date.now() };

    await docRef.update(updateData);

    const merged = { ...snapshot.data(), ...updateData };
    const typesenseDoc = toTypesenseDocument(id, merged);
    await typesenseClient.collections(COLLECTION_NAME).documents(id).update(typesenseDoc);

    return res.status(200).json({
      success: true,
      message: `Item ${id} updated in Firestore and Typesense`,
      data: typesenseDoc,
    });
  } catch (error) {
    console.error('Error updating item:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while updating item',
    });
  }
}

export async function deleteItem(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Item ID is required' });
    }

    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const snapshot = await docRef.get();
    if (!snapshot.exists) {
      return res.status(404).json({ success: false, error: `Item ${id} not found` });
    }

    await docRef.delete();

    try {
      await typesenseClient.collections(COLLECTION_NAME).documents(id).delete();
    } catch (typesenseError) {
      console.warn(`Typesense delete warning (${id}):`, typesenseError.message);
    }

    return res.status(200).json({
      success: true,
      message: `Item ${id} deleted from Firestore and Typesense`,
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while deleting item',
    });
  }
}

export async function getItem(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Item ID is required' });
    }

    const snapshot = await db.collection(COLLECTION_NAME).doc(id).get();
    if (!snapshot.exists) {
      return res.status(404).json({ success: false, error: `Item ${id} not found` });
    }

    return res.status(200).json({
      success: true,
      data: snapshot.data(),
    });
  } catch (error) {
    console.error('Error fetching item:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while fetching item',
    });
  }
}

export async function listItems(req, res) {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const snapshot = await db.collection(COLLECTION_NAME).limit(limit).get();
    const items = snapshot.docs.map((doc) => doc.data());

    return res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
