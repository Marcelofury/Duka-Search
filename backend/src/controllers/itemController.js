import { db } from '../config/firebase.js';
import { typesenseClient } from '../config/typesense.js';

const COLLECTION_NAME = 'duka_items';

/**
 * POST /api/items
 * Validates input, saves to Firestore /duka_items, and pushes to Typesense index
 */
export async function createItem(req, res) {
  try {
    const {
      name,
      category,
      vendor_name,
      market_location,
      price_ugx,
      in_stock = true,
      location,
      description = '',
    } = req.body;

    // Strict Validation
    if (!name || !category || !vendor_name || !market_location || price_ugx === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, category, vendor_name, market_location, price_ugx',
      });
    }

    const priceNum = parseInt(price_ugx, 10);
    if (isNaN(priceNum) || priceNum < 0) {
      return res.status(400).json({
        success: false,
        error: 'price_ugx must be a non-negative integer',
      });
    }

    // 1. Write to Firestore (Source of Truth)
    const itemRef = db.collection(COLLECTION_NAME).doc();
    const itemId = itemRef.id;

    const firestoreData = {
      id: itemId,
      name: name.trim(),
      category: category.trim(),
      vendor_name: vendor_name.trim(),
      market_location: market_location.trim(),
      price_ugx: priceNum,
      in_stock: Boolean(in_stock),
      description: description.trim(),
      created_at: Date.now(),
    };

    if (location && Array.isArray(location) && location.length === 2) {
      firestoreData.location = [Number(location[0]), Number(location[1])];
    }

    await itemRef.set(firestoreData);

    // 2. Push to Typesense Index for <5ms client search
    const typesenseDoc = {
      id: itemId,
      name: firestoreData.name,
      category: firestoreData.category,
      vendor_name: firestoreData.vendor_name,
      market_location: firestoreData.market_location,
      price_ugx: firestoreData.price_ugx,
      in_stock: firestoreData.in_stock,
      description: firestoreData.description,
      created_at: firestoreData.created_at,
    };

    if (firestoreData.location) {
      typesenseDoc.location = firestoreData.location;
    }

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
      error: error.message || 'Internal Server Error while synchronizing item',
    });
  }
}

/**
 * DELETE /api/items/:id
 * Removes from Firestore & deletes from Typesense index
 */
export async function deleteItem(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Item ID is required in URL path',
      });
    }

    // 1. Delete from Firestore
    await db.collection(COLLECTION_NAME).doc(id).delete();

    // 2. Delete from Typesense index
    try {
      await typesenseClient.collections(COLLECTION_NAME).documents(id).delete();
    } catch (typesenseErr) {
      console.warn(`Typesense document delete warning (${id}):`, typesenseErr.message);
    }

    return res.status(200).json({
      success: true,
      message: `Item ${id} deleted from Firestore and Typesense index`,
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error deleting item',
    });
  }
}

/**
 * GET /api/items
 * Retrieve items from Firestore
 */
export async function listItems(req, res) {
  try {
    const snapshot = await db.collection(COLLECTION_NAME).limit(50).get();
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
