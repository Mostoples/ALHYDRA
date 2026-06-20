/* ─────────────────────────────────────────
   Firebase client config
   NOTE: This is the PUBLIC web config — safe to include here.
   NEVER put the service-account private key in client code.
───────────────────────────────────────── */
const firebaseConfig = {
  apiKey:            "AIzaSyB3A2CkSIlAQFP0QShi1GFhT8ds3WA1bAA",
  authDomain:        "alcura-id.firebaseapp.com",
  projectId:         "alcura-id",
  storageBucket:     "alcura-id.firebasestorage.app",
  messagingSenderId: "978633752737",
  appId:             "1:978633752737:web:3b7418f607a52c711270e0"
};

firebase.initializeApp(firebaseConfig);

// Global DB and Auth references used by every module
window.auth = firebase.auth();
window.db   = firebase.firestore();

// Offline persistence (helps when reconnecting).
// The modular SDK exposes FirestoreSettings.cache / persistentLocalCache(); the
// compat build does not, so we feature-detect: use the modern API if present,
// otherwise fall back to the legacy method (logs a harmless deprecation notice).
(() => {
  const fs = firebase.firestore;
  if (typeof fs.persistentLocalCache === 'function') {
    window.db.settings({
      cache: fs.persistentLocalCache({ tabManager: fs.persistentMultipleTabManager() })
    });
  } else {
    window.db.enablePersistence({ synchronizeTabs: true }).catch(() => {});
  }
})();
