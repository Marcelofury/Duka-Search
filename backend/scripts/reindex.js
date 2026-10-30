import { initTypesenseSchema } from '../src/config/typesense.js';
import { reindexFromFirestore } from '../src/services/reindex.js';

async function main() {
  await initTypesenseSchema();
  const result = await reindexFromFirestore({ force: true });
  console.log('Reindex result:', result);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Reindex failed:', error);
    process.exit(1);
  });
