'use strict';
require('dotenv').config();

const express = require('express');
const { handleIncomingMessage } = require('./agent');

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// ── Validação de acesso ───────────────────────────────────────
const ALLOWED_PHONES = process.env.ALLOWED_PHONES
  ? process.env.ALLOWED_PHONES.split(',').map(p => p.trim()).filter(Boolean)
  : [];

function isAllowed(phone) {
  if (ALLOWED_PHONES.length === 0) return true;
  return ALLOWED_PHONES.includes(phone);
}

// ── Webhook do Twilio ─────────────────────────────────────────
app.post('/webhook/whatsapp', async (req, res) => {
  // Responde imediatamente ao Twilio (exige resposta em < 15s)
  res.status(200).send('');

  const from    = req.body.From   || '';   // "whatsapp:+5541..."
  const body    = (req.body.Body  || '').trim();
  const profile = req.body.ProfileName || 'Vendedor';

  if (!from || !body) return;

  if (!isAllowed(from)) {
    console.warn(`[BLOQUEADO] Número não autorizado: ${from}`);
    return;
  }

  console.log(`[MSG] ${from} (${profile}): ${body}`);

  try {
    await handleIncomingMessage({ from, body, profile });
  } catch (err) {
    console.error(`[ERRO] Falha ao processar mensagem de ${from}:`, err.message);
  }
});

// ── Health check ──────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'pesados-whatsapp-agent', ts: new Date().toISOString() });
});

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Agente Pesados rodando na porta ${PORT}`);
  console.log(`   Webhook: POST /webhook/whatsapp`);
  console.log(`   Health:  GET  /health`);
});
