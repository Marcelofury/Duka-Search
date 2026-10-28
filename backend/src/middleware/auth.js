import admin from '../config/firebase.js';

/**
 * Verifies a Firebase ID token from the Authorization header.
 *
 * Local hackathon demos can run without tokens by leaving REQUIRE_AUTH=false.
 * Set REQUIRE_AUTH=true in production so only authenticated vendors can write.
 */
export async function requireAuth(req, res, next) {
  const isRequired = process.env.REQUIRE_AUTH === 'true';
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (!token || scheme.toLowerCase() !== 'bearer') {
    if (!isRequired) {
      req.user = null;
      return next();
    }

    return res.status(401).json({
      success: false,
      error: 'Missing or malformed Firebase ID token.',
    });
  }

  try {
    req.user = await admin.auth().verifyIdToken(token);
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired Firebase ID token.',
      details: error.message,
    });
  }
}
