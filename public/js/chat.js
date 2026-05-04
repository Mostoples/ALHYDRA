/* ─────────────────────────────────────────
   chat.js — ALHYDRA AI Assistant (Gemini)
   Floating FAB + slide-up panel
   Demo mode when no API key is configured.
───────────────────────────────────────── */
'use strict';

ALHYDRA.chat = (() => {
  // ── State ──────────────────────────────
  let isOpen   = false;
  let messages = [];      // { role: 'user'|'model', content: string }
  let isTyping = false;

  const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  // ── System prompt ──────────────────────
  const SYSTEM_PROMPT = `You are ALHYDRA AI, an intelligent assistant for the ALHYDRA (Algae-Hydroponic Dual-Renewable Apparatus) smart agriculture monitoring system — a hybrid multi-tower cultivation platform integrating microalgae, hydroponics, and renewable energy (solar + wind).

When the user asks about sensor data, I will provide the current readings in the message. Analyze the values and give actionable, concise advice.

Guidelines:
- Be concise but informative (max 3 paragraphs)
- Use **bold** for key terms and values
- Use bullet points (•) for lists
- Provide specific, actionable recommendations
- Be friendly and professional
- When sensor data is available, always reference the actual values`;

  // ── Get API key ────────────────────────
  function getApiKey() {
    return localStorage.getItem('alhydra_gemini_key') || '';
  }

  // ── Read current sensor values from DOM ──
  function getSensorData() {
    const data = {};
    ['ph', 'light', 'turbidity', 'temp_ambient', 'humidity', 'temp_water', 'current_gen', 'current_cons'].forEach(k => {
      const el = document.getElementById('val-' + k);
      if (el && el.textContent !== '—') {
        const n = parseFloat(el.textContent);
        if (!isNaN(n)) data[k] = n;
      }
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
      return 'No live sensor data available (Demo Mode not active or no ESP32 connected).';
    const voltage = 220;
    const lines = [];
    if (data.ph             !== undefined) lines.push(`pH: ${data.ph.toFixed(2)} (optimal: ${data.thresholds.ph?.min}–${data.thresholds.ph?.max})`);
    if (data.turbidity      !== undefined) lines.push(`Turbidity: ${data.turbidity.toFixed(1)} NTU (optimal: <${data.thresholds.turbidity?.max ?? 50})`);
    if (data.temp_water     !== undefined) lines.push(`Water Temp: ${data.temp_water.toFixed(1)} °C`);
    if (data.temp_ambient   !== undefined) lines.push(`Ambient Temp: ${data.temp_ambient.toFixed(1)} °C`);
    if (data.humidity       !== undefined) lines.push(`Humidity: ${data.humidity.toFixed(1)} %`);
    if (data.light          !== undefined) lines.push(`Light Intensity: ${data.light.toFixed(0)} lux`);
    if (data.current_gen    !== undefined) lines.push(`Generation Current: ${data.current_gen.toFixed(2)} A (${(data.current_gen * voltage).toFixed(1)} W)`);
    if (data.current_cons   !== undefined) lines.push(`Consumption Current: ${data.current_cons.toFixed(2)} A (${(data.current_cons * voltage).toFixed(1)} W)`);
    if (data.pump1          !== undefined) lines.push(`Pump 1: ${data.pump1 ? 'ON' : 'OFF'}`);
    if (data.pump2          !== undefined) lines.push(`Pump 2: ${data.pump2 ? 'ON' : 'OFF'}`);
    return lines.join('\n');
  }

  // ── Status emoji helper ────────────────
  function statusEmoji(val, key) {
    const t = window.ALHYDRA_THRESHOLDS?.[key] || {};
    if (t.min !== undefined && val < t.min) return '🔴';
    if (t.max !== undefined && val > t.max) return '🔴';
    const range = (t.max ?? val * 2) - (t.min ?? 0);
    if (t.min !== undefined && val < t.min + range * 0.15) return '🟡';
    if (t.max !== undefined && val > t.max - range * 0.15) return '🟡';
    return '🟢';
  }

  // ── Demo mode responses ────────────────
  function demoResponse(msg) {
    const data   = getSensorData();
    const lower  = msg.toLowerCase();
    const hasSensors = Object.keys(data).filter(k => k !== 'thresholds').length > 2;
    const noData = () => "I don't have live sensor data right now. Enable **Demo Mode** on the dashboard or connect your ESP32 to receive real-time readings.";

    if (/ph|acid|alkalin/.test(lower)) {
      if (!hasSensors || data.ph === undefined) return noData();
      const t = data.thresholds?.ph || { min: 6, max: 9 };
      const state = data.ph < t.min ? 'too acidic' : data.ph > t.max ? 'too alkaline' : 'within optimal range';
      const fix   = data.ph < t.min ? 'Add a pH-up solution to raise the level.' : data.ph > t.max ? 'Add a pH-down solution.' : 'No immediate adjustment needed.';
      return `**pH Level: ${data.ph.toFixed(2)}** ${statusEmoji(data.ph,'ph')}\n\nThe water pH is currently **${state}** (target: ${t.min}–${t.max} pH). ${fix}\n\n• Microalgae (*Chlorella*, *Spirulina*) prefer 7.0–8.5\n• Hydroponic plants perform best at 5.5–6.8\n• Monitor pH twice daily when in active growth phase`;
    }
    if (/turb|water quality|ntu|clean|dirty/.test(lower)) {
      if (!hasSensors) return noData();
      const items = [];
      if (data.turbidity !== undefined) {
        const t = data.thresholds?.turbidity || { max: 50 };
        const s = data.turbidity > t.max ? '🔴 HIGH — cloudy' : data.turbidity > t.max * 0.6 ? '🟡 MODERATE' : '🟢 CLEAR';
        items.push(`• **Turbidity:** ${data.turbidity.toFixed(1)} NTU — ${s}`);
      }
      if (data.ph         !== undefined) items.push(`• **pH:** ${data.ph.toFixed(2)} ${statusEmoji(data.ph,'ph')}`);
      if (data.temp_water !== undefined) items.push(`• **Water Temp:** ${data.temp_water.toFixed(1)} °C ${statusEmoji(data.temp_water,'temp_water')}`);
      if (!items.length) return noData();
      const advice = data.turbidity > 40 ? '\n\n⚠️ High turbidity detected. Check filters and consider a 20–30% water change.' : '\n\n✅ Water conditions look suitable for plant and algae growth.';
      return `**Water Quality Summary:**\n\n${items.join('\n')}${advice}`;
    }
    if (/energy|power|watt|solar|wind|generat|consum|electric/.test(lower)) {
      if (!hasSensors || (data.current_gen === undefined && data.current_cons === undefined)) return noData();
      const V = 220;
      const gen  = data.current_gen  !== undefined ? (data.current_gen  * V).toFixed(1) : '—';
      const cons = data.current_cons !== undefined ? (data.current_cons * V).toFixed(1) : '—';
      const bal  = data.current_gen !== undefined && data.current_cons !== undefined
        ? ((data.current_gen - data.current_cons) * V).toFixed(1) : '—';
      const balInfo = bal !== '—' ? (parseFloat(bal) >= 0 ? '✅ Energy positive! Surplus can charge batteries.' : '⚠️ Energy deficit — system draws more than it generates.') : '';
      return `**Energy Balance:**\n\n• 🌞 **Generated:** ${gen} W\n• ⚡ **Consumed:** ${cons} W\n• 📊 **Net Balance:** ${bal} W\n\n${balInfo}\n\nEnsure pumps run during peak solar hours (09:00–15:00) to maximize renewable energy utilization.`;
    }
    if (/pump|relay|irrigat|valve/.test(lower)) {
      return `**Pump Status:**\n\n• 💧 **Pump 1:** ${data.pump1 ? '🟢 RUNNING' : '⭕ STOPPED'}\n• 💧 **Pump 2:** ${data.pump2 ? '🟢 RUNNING' : '⭕ STOPPED'}\n\nControl pumps from the **Control Panel** view. For NFT hydroponics, continuous pumping (24/7) is standard. For deep-water systems, intermittent cycles (15 min ON / 45 min OFF) reduce energy consumption.`;
    }
    if (/light|lux|bright|dark|photo/.test(lower)) {
      if (!hasSensors || data.light === undefined) return noData();
      const t = data.thresholds?.light || { min: 200, max: 10000 };
      const zone = data.light < 100 ? 'very dark' : data.light < t.min ? 'low light' : data.light > t.max ? 'very high intensity' : 'optimal';
      return `**Light Intensity: ${data.light.toFixed(0)} lux** ${statusEmoji(data.light,'light')}\n\nConditions: **${zone}** (target: ${t.min}–${t.max} lux)\n\n• Microalgae PAR requirement: 100–400 µmol/m²/s\n• Leafy vegetables: 15,000–30,000 lux for rapid growth\n• Supplement with LED grow lights when <500 lux`;
    }
    if (/temp|hot|cold|warm/.test(lower)) {
      if (!hasSensors) return noData();
      const items = [];
      if (data.temp_ambient !== undefined) items.push(`• **Ambient:** ${data.temp_ambient.toFixed(1)} °C ${statusEmoji(data.temp_ambient,'temp_ambient')}`);
      if (data.temp_water   !== undefined) items.push(`• **Water:** ${data.temp_water.toFixed(1)} °C ${statusEmoji(data.temp_water,'temp_water')}`);
      if (!items.length) return noData();
      return `**Temperature Status:**\n\n${items.join('\n')}\n\n• Microalgae optimal: 20–28 °C\n• Hydroponic roots: 18–22 °C prevents pathogen growth\n• Ambient >35 °C inhibits algae — ensure ventilation`;
    }
    if (/humid/.test(lower)) {
      if (!hasSensors || data.humidity === undefined) return noData();
      const t = data.thresholds?.humidity || { min: 40, max: 90 };
      const s = data.humidity < t.min ? 'too dry' : data.humidity > t.max ? 'too humid' : 'optimal';
      const advice = data.humidity > 80 ? 'High humidity raises fungal disease risk — improve ventilation.' : data.humidity < 50 ? 'Low humidity stresses plants — consider misting or increasing airflow.' : 'Humidity is in the ideal zone.';
      return `**Humidity: ${data.humidity.toFixed(1)} %** ${statusEmoji(data.humidity,'humidity')}\n\nStatus: **${s}** (target: ${t.min}–${t.max}%)\n\n${advice}`;
    }
    if (/overview|summary|system|status|report|everything|all/.test(lower)) {
      if (!hasSensors) return noData();
      const items = [];
      if (data.ph             !== undefined) items.push(`• pH ${data.ph.toFixed(2)} ${statusEmoji(data.ph,'ph')}`);
      if (data.turbidity      !== undefined) items.push(`• Turbidity ${data.turbidity.toFixed(1)} NTU ${statusEmoji(data.turbidity,'turbidity')}`);
      if (data.temp_water     !== undefined) items.push(`• Water Temp ${data.temp_water.toFixed(1)} °C ${statusEmoji(data.temp_water,'temp_water')}`);
      if (data.temp_ambient   !== undefined) items.push(`• Ambient ${data.temp_ambient.toFixed(1)} °C ${statusEmoji(data.temp_ambient,'temp_ambient')}`);
      if (data.humidity       !== undefined) items.push(`• Humidity ${data.humidity.toFixed(1)} % ${statusEmoji(data.humidity,'humidity')}`);
      if (data.light          !== undefined) items.push(`• Light ${data.light.toFixed(0)} lux ${statusEmoji(data.light,'light')}`);
      const energyLine = data.current_gen !== undefined && data.current_cons !== undefined
        ? `\n• ⚡ Energy: ${(data.current_gen*220).toFixed(0)}W gen / ${(data.current_cons*220).toFixed(0)}W cons` : '';
      return `**ALHYDRA System Overview:**\n\n${items.join('\n')}${energyLine}\n\n**Pumps:** P1 ${data.pump1 ? '🟢 ON' : '⭕ OFF'} | P2 ${data.pump2 ? '🟢 ON' : '⭕ OFF'}`;
    }
    if (/recommend|suggest|optim|improve|tip|advice|what should/.test(lower)) {
      if (!hasSensors) return noData();
      const recs = [];
      if (data.ph !== undefined) {
        const t = data.thresholds?.ph || { min: 6, max: 9 };
        if (data.ph < t.min) recs.push(`🔧 **pH too low (${data.ph.toFixed(2)}):** Add pH-up solution gradually.`);
        else if (data.ph > t.max) recs.push(`🔧 **pH too high (${data.ph.toFixed(2)}):** Add pH-down solution.`);
      }
      if (data.turbidity !== undefined && data.turbidity > (data.thresholds?.turbidity?.max ?? 50) * 0.8)
        recs.push(`🔧 **Turbidity rising (${data.turbidity.toFixed(1)} NTU):** Clean filters or partial water change.`);
      if (data.current_gen !== undefined && data.current_cons !== undefined && data.current_gen < data.current_cons)
        recs.push(`🔧 **Energy deficit:** Reduce pump runtime during low solar hours or add capacity.`);
      return recs.length
        ? `**Recommendations:**\n\n${recs.join('\n\n')}`
        : `✅ **All parameters look good!**\n\n• Monitor pH daily (optimal: 6.5–7.5)\n• Clean turbidity sensor weekly\n• Run pumps during peak solar hours\n• Log daily biomass estimates for algae growth tracking`;
    }
    if (/algae|microalgae|chlorella|spirulina|biomass/.test(lower)) {
      return `**Microalgae Tips for ALHYDRA:**\n\n• **pH:** 7.0–8.5 (slightly alkaline)\n• **Temp:** 20–28 °C\n• **CO₂:** 0.5–5% v/v supplementation boosts growth 3–5×\n• **Light:** 100–400 µmol photons/m²/s, 16:8 photoperiod\n• **Nutrients:** Needs N, P, K, micronutrients (Bold's Basal Medium)\n• **Mixing:** Maintain flow to prevent sedimentation\n\nTurbidity sensor can estimate biomass density — higher NTU = more cells.`;
    }
    if (/hydropon|nft|dwc|nutrient film|deep water/.test(lower)) {
      return `**Hydroponic Tips for ALHYDRA:**\n\n• **NFT:** Thin nutrient film over roots — ideal for leafy greens (lettuce, spinach, basil)\n• **EC (Electrical Conductivity):** 1.5–2.5 mS/cm for most crops\n• **pH:** 5.5–6.5 (slightly acidic for best nutrient uptake)\n• **Water Temp:** 18–22 °C (prevents *Pythium* root rot)\n• **Pump:** Continuous for NFT; 15 min ON / 45 min OFF for drip\n\nIntegration with algae creates mutual benefit — algae O₂ enriches nutrient solution while plants absorb CO₂.`;
    }
    return `I'm **ALHYDRA AI Assistant**. I can help with:\n\n• 📊 **Sensor analysis** (pH, turbidity, temperature, humidity, light)\n• ⚡ **Energy management** (generation vs consumption)\n• 💧 **Irrigation control** guidance\n• 🌿 **Microalgae & hydroponics** optimization\n• 🔧 **System recommendations**\n\nTry: *"Give me a system overview"* or *"What's the pH status?"*`;
  }

  // ── Render markdown-lite ───────────────
  function renderText(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  // ── Append a message bubble ────────────
  function appendMessage(role, text, typing = false) {
    const list = document.getElementById('chat-messages');
    if (!list) return;

    const el  = document.createElement('div');
    el.className = `chat-msg ${role}`;

    if (typing) {
      el.id = 'chat-typing';
      el.innerHTML = `<div class="chat-bubble"><span class="typing-dots"><span></span><span></span><span></span></span></div>`;
    } else {
      const ts = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      el.innerHTML = `<div class="chat-bubble">${renderText(text)}</div><div class="chat-time">${ts}</div>`;
    }

    list.appendChild(el);
    list.scrollTop = list.scrollHeight;
    return el;
  }

  // ── Call Gemini API ────────────────────
  async function callGemini(userMsg) {
    const key = getApiKey();
    if (!key) return null;   // fall through to demo mode

    const sensorCtx = buildSensorContext(getSensorData());
    const systemFull = `${SYSTEM_PROMPT}\n\nCURRENT SENSOR DATA:\n${sensorCtx}`;

    const contents = [
      ...messages.slice(-12).map(m => ({ role: m.role, parts: [{ text: m.content }] })),
      { role: 'user', parts: [{ text: userMsg }] }
    ];

    const resp = await fetch(`${GEMINI_URL}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemFull }] },
        contents,
        generationConfig: { maxOutputTokens: 600, temperature: 0.7 }
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

    appendMessage('user', text);
    messages.push({ role: 'user', content: text });

    const inp = document.getElementById('chat-input');
    if (inp) { inp.value = ''; inp.style.height = 'auto'; }

    const qp = document.getElementById('chat-quick-prompts');
    qp?.classList.add('hidden');

    isTyping = true;
    appendMessage('assistant', '', true);

    try {
      let reply;
      const key = getApiKey();

      if (key) {
        reply = await callGemini(text);
      } else {
        await new Promise(r => setTimeout(r, 700 + Math.random() * 700));
        reply = demoResponse(text);
      }

      document.getElementById('chat-typing')?.remove();
      appendMessage('assistant', reply);
      messages.push({ role: 'model', content: reply });

    } catch (err) {
      document.getElementById('chat-typing')?.remove();
      const fallback = demoResponse(text);
      appendMessage('assistant', `⚠️ Gemini API error: *${err.message}*\n\n${fallback}`);
    } finally {
      isTyping = false;
    }
  }

  // ── Toggle panel open/close ────────────
  function togglePanel() {
    isOpen = !isOpen;
    document.getElementById('chat-panel')?.classList.toggle('open', isOpen);
    document.getElementById('chat-fab')?.classList.toggle('active', isOpen);
    if (isOpen) document.getElementById('chat-input')?.focus();
  }

  // ── Clear history ──────────────────────
  function clearHistory() {
    messages = [];
    const list = document.getElementById('chat-messages');
    if (list) list.innerHTML = '';
    appendWelcome();
    document.getElementById('chat-quick-prompts')?.classList.remove('hidden');
  }

  function appendWelcome() {
    const hasKey  = !!getApiKey();
    const modeTag = hasKey ? '✅ Gemini AI connected' : '💡 Demo Mode — add Gemini API key in Settings for full AI';
    appendMessage('assistant', `Hello! I'm **ALHYDRA AI Assistant**. ${modeTag}.\n\nAsk me about pH, water quality, energy balance, or pump status.`);
  }

  // ── Init ───────────────────────────────
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

    // Auto-grow textarea
    const inp = document.getElementById('chat-input');
    inp?.addEventListener('input', () => {
      inp.style.height = 'auto';
      inp.style.height = Math.min(inp.scrollHeight, 100) + 'px';
    });
    inp?.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(inp.value);
      }
    });

    document.getElementById('chat-send-btn')?.addEventListener('click', () => sendMessage(inp?.value));
    document.getElementById('chat-clear-btn')?.addEventListener('click', clearHistory);

    document.querySelectorAll('.chat-qp-btn').forEach(btn => {
      btn.addEventListener('click', () => sendMessage(btn.dataset.prompt || btn.textContent.trim()));
    });

    appendWelcome();
  }

  return { init, togglePanel, sendMessage, clearHistory };
})();
