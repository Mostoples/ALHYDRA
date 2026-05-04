/* ─────────────────────────────────────────
   auth.js — Login, Register, Sign-out
───────────────────────────────────────── */
'use strict';

ALHYDRA.auth = (() => {

  function setLoading(btnId, loaderId, loading) {
    const btn    = document.getElementById(btnId);
    const loader = document.getElementById(loaderId);
    if (!btn) return;
    btn.disabled = loading;
    btn.querySelector('.btn-text')?.classList.toggle('hidden', loading);
    loader?.classList.toggle('hidden', !loading);
  }

  function showError(elId, msg) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 6000);
  }

  // ── Tab switching ──────────────────────
  function initTabs() {
    document.querySelectorAll('.auth-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        document.querySelectorAll('.auth-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        document.querySelectorAll('.auth-form').forEach(f => {
          f.classList.remove('active');
          f.classList.add('hidden');
        });

        const target = tab === 'login' ? 'login-form' : 'register-form';
        const form   = document.getElementById(target);
        form?.classList.remove('hidden');
        form?.classList.add('active');

        // Clear errors
        document.getElementById('login-error')?.classList.add('hidden');
        document.getElementById('register-error')?.classList.add('hidden');
      });
    });
  }

  // ── Login ──────────────────────────────
  function initLogin() {
    document.getElementById('login-form')?.addEventListener('submit', async e => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const pw    = document.getElementById('login-password').value;
      if (!email || !pw) return;

      setLoading('login-btn', 'login-btn-loader', true);
      try {
        await window.auth.signInWithEmailAndPassword(email, pw);
        ALHYDRA.app.toast('Welcome back!', 'success');
      } catch(err) {
        setLoading('login-btn', 'login-btn-loader', false);
        showError('login-error', friendlyError(err.code));
      }
    });
  }

  // ── Register ───────────────────────────
  function initRegister() {
    document.getElementById('register-form')?.addEventListener('submit', async e => {
      e.preventDefault();
      const name  = document.getElementById('reg-name').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const pw    = document.getElementById('reg-password').value;
      if (!name || !email || !pw) return;

      setLoading('register-btn', 'register-btn-loader', true);
      try {
        const cred = await window.auth.createUserWithEmailAndPassword(email, pw);
        await cred.user.updateProfile({ displayName: name });
        // Save to Firestore
        await window.db.collection('users').doc(cred.user.uid).set({
          name, email,
          role: 'operator',
          created_at: firebase.firestore.FieldValue.serverTimestamp()
        });
        ALHYDRA.app.toast('Account created! Welcome.', 'success');
      } catch(err) {
        setLoading('register-btn', 'register-btn-loader', false);
        showError('register-error', friendlyError(err.code));
      }
    });
  }

  // ── Sign-out ───────────────────────────
  async function signOut() {
    try {
      await window.auth.signOut();
      ALHYDRA.app.toast('Signed out.', 'info');
    } catch(err) {
      ALHYDRA.app.toast('Sign-out error: ' + err.message, 'error');
    }
  }

  // ── Friendly error messages ────────────
  function friendlyError(code) {
    const map = {
      'auth/invalid-email':           'Invalid email address.',
      'auth/user-not-found':          'No account found with this email.',
      'auth/wrong-password':          'Incorrect password.',
      'auth/email-already-in-use':    'This email is already registered.',
      'auth/weak-password':           'Password must be at least 6 characters.',
      'auth/too-many-requests':       'Too many attempts. Please try again later.',
      'auth/network-request-failed':  'Network error. Check your connection.',
      'auth/invalid-credential':      'Invalid credentials. Check your email and password.',
    };
    return map[code] || 'Authentication error. Try again.';
  }

  function init() {
    initTabs();
    initLogin();
    initRegister();
  }

  return { init, signOut };
})();

// Init auth on DOMContentLoaded (before Firebase auth state)
document.addEventListener('DOMContentLoaded', () => ALHYDRA.auth.init());
