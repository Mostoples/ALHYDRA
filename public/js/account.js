/* ─────────────────────────────────────────
   account.js — Data export (JSON + CSV) and
   GDPR-style account deletion.
───────────────────────────────────────── */
'use strict';

window.ALHYDRA = window.ALHYDRA || {};

ALHYDRA.account = (() => {

  function lang() { return ALHYDRA.i18n?.current?.() || 'en'; }
  const M = {
    exporting: { en: 'Preparing your data…', id: 'Menyiapkan data Anda…' },
    exported:  { en: 'Data exported', id: 'Data diekspor' },
    noHistory: { en: 'No sensor history to export', id: 'Tidak ada riwayat sensor untuk diekspor' },
    confirmDel:{ en: 'Type DELETE to permanently remove your account and data.', id: 'Ketik DELETE untuk menghapus akun & data Anda secara permanen.' },
    deleted:   { en: 'Account deleted. Goodbye!', id: 'Akun dihapus. Sampai jumpa!' },
    reauth:    { en: 'Please sign out and sign in again, then retry deletion.', id: 'Silakan keluar lalu masuk lagi, kemudian ulangi penghapusan.' },
  };
  function L(k) { return (M[k] || {})[lang()] || (M[k] || {}).en || k; }

  function download(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click();
    setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 1000);
  }

  async function collectAll() {
    const u = window.auth?.currentUser; if (!u) return null;
    const out = { exported_at: new Date().toISOString(), account: { uid: u.uid, email: u.email, displayName: u.displayName } };
    const grab = async (coll, where) => {
      try {
        let q = window.db.collection(coll);
        if (where) q = q.where(where[0], '==', where[1]);
        const s = await q.limit(500).get(); const arr = [];
        s.forEach(d => arr.push({ id: d.id, ...d.data() }));
        return arr;
      } catch (e) { return []; }
    };
    out.profile = (await grab('users')).find(x => x.id === u.uid) || {};
    out.cultures = await grab('algae_cultures');
    out.tasks = await grab('tasks', ['uid', u.uid]);
    out.notes = await grab('notes', ['uid', u.uid]);
    out.harvest_log = await grab('harvest_log', ['uid', u.uid]);
    out.maintenance = await grab('maintenance', ['uid', u.uid]);
    out.automation_rules = await grab('automation_rules', ['uid', u.uid]);
    out.activity_logs = await grab('activity_logs', ['uid', u.uid]);
    return out;
  }

  async function exportJson() {
    ALHYDRA.app.toast(L('exporting'), 'info', 1500);
    const data = await collectAll();
    if (!data) return;
    download(`alhydra-data-${Date.now()}.json`, JSON.stringify(data, null, 2), 'application/json');
    ALHYDRA.app.toast(L('exported'), 'success');
    ALHYDRA.audit?.log('data_export', { format: 'json' });
  }

  async function exportCsv() {
    ALHYDRA.app.toast(L('exporting'), 'info', 1500);
    let rows = [];
    try {
      const s = await window.db.collection('sensor_history').orderBy('timestamp', 'desc').limit(1000).get();
      s.forEach(d => rows.push(d.data()));
    } catch (e) {}
    if (!rows.length) { ALHYDRA.app.toast(L('noHistory'), 'warning'); return; }
    rows.reverse();
    const cols = ['timestamp', 'ph', 'light', 'turbidity', 'temp_ambient', 'humidity', 'temp_water', 'water_level', 'current_gen', 'current_cons', 'voltage'];
    const head = cols.join(',');
    const body = rows.map(r => cols.map(c => {
      let v = r[c];
      if (c === 'timestamp' && v?.toDate) v = v.toDate().toISOString();
      return v === undefined || v === null ? '' : String(v).replace(/,/g, ';');
    }).join(',')).join('\n');
    download(`alhydra-sensors-${Date.now()}.csv`, head + '\n' + body, 'text/csv');
    ALHYDRA.app.toast(L('exported'), 'success');
    ALHYDRA.audit?.log('data_export', { format: 'csv', rows: rows.length });
  }

  async function deleteAccount() {
    const u = window.auth?.currentUser; if (!u) return;
    const ans = prompt(L('confirmDel'));
    if (ans !== 'DELETE') return;
    try {
      // best-effort delete owned docs
      const delColl = async (coll, where) => {
        try {
          let q = window.db.collection(coll);
          if (where) q = q.where(where[0], '==', where[1]);
          const s = await q.limit(400).get();
          const batch = window.db.batch();
          s.forEach(d => batch.delete(d.ref));
          await batch.commit();
        } catch (e) {}
      };
      await delColl('tasks', ['uid', u.uid]);
      await delColl('notes', ['uid', u.uid]);
      await delColl('harvest_log', ['uid', u.uid]);
      await delColl('maintenance', ['uid', u.uid]);
      await delColl('automation_rules', ['uid', u.uid]);
      await delColl('activity_logs', ['uid', u.uid]);
      await window.db.collection('users').doc(u.uid).delete().catch(() => {});
      await u.delete();
      try { localStorage.clear(); } catch (e) {}
      ALHYDRA.app.toast(L('deleted'), 'success');
    } catch (e) {
      if (e.code === 'auth/requires-recent-login') ALHYDRA.app.toast(L('reauth'), 'warning', 6000);
      else ALHYDRA.app.toast('Delete failed: ' + e.message, 'error');
    }
  }

  function init() {}
  return { init, exportJson, exportCsv, deleteAccount };
})();
