/* ─────────────────────────────────────────
   chat.js — ALHYDRA AI Assistant (Gemini)
   Floating FAB panel + full-page AI Chat.
   Always uses Gemini API — no demo mode.
───────────────────────────────────────── */
'use strict';

ALHYDRA.chat = (() => {
  let isOpen      = false;
  let messages    = [];
  let isTyping    = false;
  let fullPageMode = false;   // true when on #view-ai-assistant

  const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  const SYSTEM_PROMPT = `You are ALHYDRA AI, an intelligent assistant for the ALHYDRA (Algae-Hydroponic Dual-Renewable Apparatus) smart agriculture monitoring system — a hybrid multi-tower cultivation platform integrating microalgae, hydroponics, and renewable energy (solar + wind).

When the user asks about sensor data, I will provide the current readings in the message. Analyze the values and give actionable, concise advice.

Guidelines:
- Be concise but informative (max 3 paragraphs)
- Use **bold** for key terms and values
- Use bullet points (•) for lists
- Provide specific, actionable recommendations
- Be friendly and professional
- When sensor data is available, always reference the actual values

The app's pages: Dashboard, Monitoring, Control Panel, Microalgae (culture/batch management,
growth tracking, harvest prediction), Analytics, Energy Optimization (dynamic management +
automatic backup system, battery SOC), Environmental Impact (CO₂ avoided/captured, water saved,
tree-equivalents), AI Insights (ML health score, forecasting, anomaly detection, explainable AI),
Encyclopedia, and Settings.`;

  // ── API key (config.js > localStorage) ──
  function getApiKey() {
    return (window.ALHYDRA_CONFIG && window.ALHYDRA_CONFIG.GEMINI_API_KEY) ||
           localStorage.getItem('alhydra_gemini_key') || '';
  }

  // ── Sensor context ─────────────────────
  function getSensorData() {
    const data = {};
    ['ph','light','turbidity','temp_ambient','humidity','temp_water','water_level','current_gen','current_cons'].forEach(k => {
      const el = document.getElementById('val-' + k);
      if (el && el.textContent !== '—') { const n = parseFloat(el.textContent); if (!isNaN(n)) data[k] = n; }
    });
    const r1 = document.getElementById('dash-relay1');
    const r2 = document.getElementById('dash-relay2');
    if (r1) data.pump1 = r1.checked;
    if (r2) data.pump2 = r2.checked;
    data.thresholds = window.ALHYDRA_THRESHOLDS || {};
    return data;
  }

  function buildSensorContext(data) {
    if (!data || Object.keys(data).filter(k => k !== 'thresholds').length === 0)
      return 'No live sensor data available right now.';
    const V = 220, lines = [];
    if (data.ph           !== undefined) lines.push(`pH: ${data.ph.toFixed(2)}`);
    if (data.turbidity    !== undefined) lines.push(`Turbidity: ${data.turbidity.toFixed(1)} NTU`);
    if (data.temp_water   !== undefined) lines.push(`Water Temp: ${data.temp_water.toFixed(1)} °C`);
    if (data.temp_ambient !== undefined) lines.push(`Ambient Temp: ${data.temp_ambient.toFixed(1)} °C`);
    if (data.humidity     !== undefined) lines.push(`Humidity: ${data.humidity.toFixed(1)} %`);
    if (data.light        !== undefined) lines.push(`Light: ${data.light.toFixed(0)} lux`);
    if (data.water_level  !== undefined) lines.push(`Water Level: ${data.water_level.toFixed(0)} %`);
    if (data.current_gen  !== undefined) lines.push(`Generation: ${data.current_gen.toFixed(2)} A (${(data.current_gen*V).toFixed(1)} W)`);
    if (data.current_cons !== undefined) lines.push(`Consumption: ${data.current_cons.toFixed(2)} A (${(data.current_cons*V).toFixed(1)} W)`);
    if (data.pump1        !== undefined) lines.push(`Pump 1: ${data.pump1 ? 'ON' : 'OFF'}`);
    if (data.pump2        !== undefined) lines.push(`Pump 2: ${data.pump2 ? 'ON' : 'OFF'}`);
    const e = ALHYDRA.energy?.getState?.();
    if (e) lines.push(`Energy mode: ${e.mode}, battery ${e.soc}%, net ${e.balanceW} W`);
    const b = ALHYDRA.algae?.getBiomassEstimate?.();
    if (b && b.byCulture.length) lines.push(`Algae biomass ≈ ${b.kg.toFixed(2)} kg`);
    return lines.join('\n');
  }

  // ── Markdown-lite render ───────────────
  function renderText(t) {
    return t.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
            .replace(/\*([^*]+?)\*/g,'<em>$1</em>')
            .replace(/\n/g,'<br>');
  }

  // ── Get the active message container ───
  function getMsgContainer() {
    if (fullPageMode) return document.getElementById('ai-chat-messages');
    return document.getElementById('chat-messages');
  }

  // ── Append message bubble ──────────────
  function appendMessage(role, text, typing = false) {
    const list = getMsgContainer();
    if (!list) return;
    const el = document.createElement('div');
    el.className = `chat-msg ${role}`;
    if (typing) {
      el.id = 'chat-typing';
      el.innerHTML = `<div class="chat-bubble"><span class="typing-dots"><span></span><span></span><span></span></span></div>`;
    } else {
      const ts = new Date().toLocaleTimeString('en-US',{hour12:false,hour:'2-digit',minute:'2-digit'});
      el.innerHTML = `<div class="chat-bubble">${renderText(text)}</div><div class="chat-time">${ts}</div>`;
    }
    list.appendChild(el);
    list.scrollTop = list.scrollHeight;
    return el;
  }

  // ── Get the active input element ───────
  function getInput() {
    if (fullPageMode) return document.getElementById('ai-chat-input');
    return document.getElementById('chat-input');
  }

  // ── Call Gemini ────────────────────────
  async function callGemini(userMsg) {
    const key = getApiKey();
    if (!key) throw new Error('Gemini API key not configured. Add it in config.js or Settings.');

    const ctx = buildSensorContext(getSensorData());
    const resp = await fetch(`${GEMINI_URL}?key=${key}`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        system_instruction: { parts: [{ text: `${SYSTEM_PROMPT}\n\nCURRENT SENSOR DATA:\n${ctx}` }] },
        contents: [
          ...messages.slice(-12).map(m => ({ role: m.role, parts: [{ text: m.content }] })),
          { role: 'user', parts: [{ text: userMsg }] }
        ],
        generationConfig: { maxOutputTokens: 800, temperature: 0.7 }
      })
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err?.error?.message || `HTTP ${resp.status}`);
    }
    const data = await resp.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received.';
  }

  // ── Send message ───────────────────────
  async function sendMessage(text) {
    text = (text || '').trim();
    if (!text || isTyping) return;

    const inp = getInput();
    if (inp) { inp.value = ''; inp.style.height = 'auto'; }

    appendMessage('user', text);
    messages.push({ role: 'user', content: text });

    document.getElementById('chat-quick-prompts')?.classList.add('hidden');
    document.getElementById('ai-page-qp')?.classList.add('hidden');

    isTyping = true;
    appendMessage('assistant', '', true);

    try {
      const reply = await callGemini(text);
      document.getElementById('chat-typing')?.remove();
      appendMessage('assistant', reply);
      messages.push({ role: 'model', content: reply });
    } catch (err) {
      document.getElementById('chat-typing')?.remove();
      appendMessage('assistant', `⚠️ *${err.message}*`);
    } finally {
      isTyping = false;
    }
  }

  // ── Welcome message ────────────────────
  function appendWelcome() {
    appendMessage('assistant', `Hello! I'm **ALHYDRA AI Assistant** ✅ Powered by Gemini.\n\nAsk me about pH, water quality, energy balance, pump status, or anything about your system.`);
  }

  // ── FAB panel toggle ───────────────────
  function togglePanel() {
    isOpen = !isOpen;
    document.getElementById('chat-panel')?.classList.toggle('open', isOpen);
    document.getElementById('chat-fab')?.classList.toggle('active', isOpen);
    if (isOpen) document.getElementById('chat-input')?.focus();
  }

  // ── Clear history ──────────────────────
  function clearHistory() {
    messages = [];
    const c = getMsgContainer();
    if (c) c.innerHTML = '';
    appendWelcome();
    if (fullPageMode) {
      document.getElementById('ai-page-qp')?.classList.remove('hidden');
    } else {
      document.getElementById('chat-quick-prompts')?.classList.remove('hidden');
    }
  }

  // ── Wire input events (reusable) ───────
  function wireInput(inp, sendBtn) {
    if (!inp) return;
    inp.addEventListener('input', () => {
      inp.style.height = 'auto';
      inp.style.height = Math.min(inp.scrollHeight, 100) + 'px';
    });
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(inp.value);
      }
    });
    if (sendBtn) sendBtn.addEventListener('click', () => sendMessage(inp.value));
  }

  // ══════════════════════════════════════
  //  FULL-PAGE MODE (AI Chat page)
  // ══════════════════════════════════════
  let fpWired = false;  // prevent duplicate listeners

  function openFullPage() {
    fullPageMode = true;
    document.getElementById('chat-fab')?.classList.add('hidden');
    document.getElementById('chat-panel')?.classList.remove('open');

    const msgEl   = document.getElementById('ai-chat-messages');
    const inp     = document.getElementById('ai-chat-input');
    const sendBtn = document.getElementById('ai-chat-send-btn');

    if (!msgEl) return;

    // Enable scroll inside messages (CSS hides the scrollbar visually)
    msgEl.style.overflowY = 'auto';

    // Show welcome on first open
    if (msgEl.children.length === 0) {
      messages = [];
      appendWelcome();
    }

    // Wire events only once
    if (!fpWired) {
      wireInput(inp, sendBtn);
      document.getElementById('ai-page-clear-btn')?.addEventListener('click', clearHistory);
      document.querySelectorAll('.aic-qp').forEach(b =>
        b.addEventListener('click', () => sendMessage(b.dataset.prompt || b.textContent.trim()))
      );
      fpWired = true;
    }

    inp?.focus();
  }

  function closeFullPage() {
    fullPageMode = false;
    document.getElementById('chat-fab')?.classList.remove('hidden');
  }

  // ══════════════════════════════════════
  //  INIT (FAB panel)
  // ══════════════════════════════════════
  function init() {
    document.getElementById('chat-fab')?.addEventListener('click', e => {
      e.stopPropagation();
      togglePanel();
    });

    document.addEventListener('click', e => {
      const panel = document.getElementById('chat-panel');
      const fab   = document.getElementById('chat-fab');
      if (isOpen && panel && !panel.contains(e.target) && !fab?.contains(e.target)) {
        isOpen = false;
        panel.classList.remove('open');
        fab?.classList.remove('active');
      }
    });

    wireInput(document.getElementById('chat-input'), document.getElementById('chat-send-btn'));
    document.getElementById('chat-clear-btn')?.addEventListener('click', clearHistory);
    document.querySelectorAll('.chat-qp-btn').forEach(b =>
      b.addEventListener('click', () => sendMessage(b.dataset.prompt || b.textContent.trim()))
    );

    appendWelcome();
  }

  return { init, togglePanel, sendMessage, clearHistory, openFullPage, closeFullPage };
})();
