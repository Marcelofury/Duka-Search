import Typesense from 'typesense';
import dotenv from 'dotenv';

dotenv.config();

export const DUKA_COLLECTION = 'duka_items';

/**
 * Typesense admin client used only by the backend data-processing layer.
 * The mobile client must use a scoped search-only key instead.
 */
export const typesenseClient = new Typesense.Client({
  nodes: [
    {
      host: process.env.TYPESENSE_HOST || 'localhost',
      port: parseInt(process.env.TYPESENSE_PORT || '8108', 10),
      protocol: process.env.TYPESENSE_PROTOCOL || 'http',
    },
  ],
  apiKey: process.env.TYPESENSE_ADMIN_API_KEY || 'xyz_admin_secret_key_dukasearch',
  connectionTimeoutSeconds: 5,
});

/**
 * Collection schema for `duka_items`.
 *
 * Typesense treats `id` as an implicit special field, so it must not be
 * declared here. Every indexed document still supplies a string `id`.
 */
export const dukaItemsSchema = {
  name: DUKA_COLLECTION,
  fields: [
    { name: 'name', type: 'string' },
    { name: 'category', type: 'string', facet: true },
    { name: 'vendor_name', type: 'string', facet: true },
    { name: 'market_location', type: 'string', facet: true },
    { name: 'price_ugx', type: 'int32', sort: true },
    { name: 'in_stock', type: 'bool', facet: true },
    { name: 'location', type: 'geopoint', optional: true },
    { name: 'description', type: 'string', optional: true },
    { name: 'created_at', type: 'int64', optional: true },
    { name: 'updated_at', type: 'int64', optional: true },
  ],
  default_sorting_field: 'price_ugx',
};

/**
 * Creates the `duka_items` collection if it does not already exist.
 */
export async function initTypesenseSchema() {
  try {
    const collections = await typesenseClient.collections().retrieve();
    const exists = collections.some(
      (collection) => collection.name === DUKA_COLLECTION,
    );

    if (!exists) {
      console.log(`Creating Typesense collection "${DUKA_COLLECTION}"...`);
      await typesenseClient.collections().create(dukaItemsSchema);
      console.log(`Typesense collection "${DUKA_COLLECTION}" is ready.`);
    } else {
      console.log(`Typesense collection "${DUKA_COLLECTION}" already exists.`);
    }
  } catch (error) {
    console.error('Unable to initialize the Typesense schema:', error.message);
    throw error;
  }
}
