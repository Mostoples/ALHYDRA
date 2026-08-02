/* ─────────────────────────────────────────
   Firebase client config — project: alhydra-id
   NOTE: This is the PUBLIC web config — safe to include here.
   NEVER put the service-account private key in client code.
───────────────────────────────────────── */
const firebaseConfig = {
  apiKey:            "AIzaSyCbiZ-2GRyFabEBr2hJNLkBLpsYqDNuErs",
  authDomain:        "alhydra-id.firebaseapp.com",
  databaseURL:       "https://alhydra-id-default-rtdb.firebaseio.com",
  projectId:         "alhydra-id",
  storageBucket:     "alhydra-id.firebasestorage.app",
  messagingSenderId: "1012214883931",
  appId:             "1:1012214883931:web:3123064072c417dfbe817e"
};

firebase.initializeApp(firebaseConfig);

// Global DB and Auth references used by every module
window.auth = firebase.auth();
window.db   = firebase.firestore();

// Realtime Database — live telemetry/control from the physical ALHYDRA device
// (kontrol/sensor/status paths). Kept separate from Firestore, which stores
// app-level data (auth, audit log, calibration, chat, ...).
window.rtdb = firebase.database();
