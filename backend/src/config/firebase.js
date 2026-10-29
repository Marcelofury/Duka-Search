import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

function initialiseFirebase() {
  if (admin.apps.length > 0) return admin.app();

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (serviceAccountJson) {
    const serviceAccount = JSON.parse(serviceAccountJson);
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  if (serviceAccountPath) {
    // If the value looks like JSON (starts with {), parse it directly.
    // Otherwise treat it as a file path.
    let credential;
    if (serviceAccountPath.trim().startsWith('{')) {
      credential = admin.credential.cert(JSON.parse(serviceAccountPath));
    } else {
      credential = admin.credential.cert(serviceAccountPath);
    }
    return admin.initializeApp({ credential });
  }

  // Application Default Credentials are used in Cloud Run, App Engine, or
  // when GOOGLE_APPLICATION_CREDENTIALS points to a service-account file.
  return admin.initializeApp({
    projectId:
      process.env.FIREBASE_PROJECT_ID ||
      process.env.GCLOUD_PROJECT ||
      'dukasearch-production',
  });
}

try {
  initialiseFirebase();
  console.log('Firebase Admin SDK initialized.');
} catch (error) {
  console.warn('Firebase Admin initialization notice:', error.message);
}

export const db = admin.firestore();
export default admin;