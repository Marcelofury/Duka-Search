import { Firestore } from '@google-cloud/firestore';
import { readFileSync } from 'fs';
import { join } from 'path';
import { SAMPLE_DUKA_ITEMS } from './seed.js';

const PROJECT_ID = 'duka-search';

function readCliAccessToken() {
  const homeDir = process.env.HOME || process.env.USERPROFILE || '';
  const cliConfigPath = join(homeDir, '.config', 'configstore', 'firebase-tools.json');
  const raw = readFileSync(cliConfigPath, 'utf-8');
  const config = JSON.parse(raw);
  return config?.tokens?.access_token;
}

async function seedFirestore() {
  const token = readCliAccessToken();
  if (!token) {
    throw new Error('No access_token found in Firebase CLI config.');
  }

  // Create a Firestore client with the OAuth2 bearer token.
  const db = new Firestore({
    projectId: PROJECT_ID,
    credentials: {
      client_email: 'firebase-admin-sdk@duka-search.iam.gserviceaccount.com',
      private_key: '-----BEGIN PRIVATE KEY-----\nunused\n-----END PRIVATE KEY-----\n',
    },
    token: token,
  });

  console.log('🌱 Starting DukaSearch Firestore seed...');
  let success = 0;

  for (const item of SAMPLE_DUKA_ITEMS) {
    try {
      await db.collection('duka_items').doc(item.id).set({
        ...item,
        created_at: Date.now(),
      });
      success++;
    } catch (err) {
      console.warn(`Firestore seed warning for ${item.id}:`, err.message);
    }
  }

  console.log(`🎉 Firestore seed completed: ${success}/${SAMPLE_DUKA_ITEMS.length} items`);
  return success;
}

seedFirestore()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal seed error:', err);
    process.exit(1);
  });