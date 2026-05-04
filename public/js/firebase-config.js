/* ─────────────────────────────────────────
   Firebase client config
   NOTE: This is the PUBLIC web config — safe to include here.
   NEVER put the service-account private key in client code.
───────────────────────────────────────── */
const firebaseConfig = {
  apiKey:            "AIzaSyCbiZ-2GRyFabEBr2hJNLkBLpsYqDNuErs",
  authDomain:        "alhydra-id.firebaseapp.com",
  projectId:         "alhydra-id",
  storageBucket:     "alhydra-id.firebasestorage.app",
  messagingSenderId: "1012214883931",
  appId:             "1:1012214883931:web:3123064072c417dfbe817e"
};

firebase.initializeApp(firebaseConfig);

// Global DB and Auth references used by every module
window.db   = firebase.firestore();
window.auth = firebase.auth();

// Enable offline persistence (optional — helps when reconnecting)
window.db.enablePersistence({ synchronizeTabs: true }).catch(() => {});
