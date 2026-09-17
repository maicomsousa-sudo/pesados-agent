'use strict';

const Anthropic = require('@anthropic-ai/sdk');
const systemPrompt = require('./prompts/system');
const { getHistory, saveHistory } = require('./services/supabase');
const { sendText, sendMedia, sendMediaList } = require('./services/twilio');
const {
  searchMachines,
  getMachineDetails,
  getMachinePhotos,
  getMachineVideos,
  generateCommercialPdf,
  simulateSale,
} = require('./tools/pesados');
const { simulateFinancing } = require('./tools/tracao');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Definição das ferramentas para o Claude ───────────────────
const TOOLS = [
  {
    name: 'search_machines',
    description: 'Busca máquinas disponíveis no estoque da Pesados Online. Use quando o vendedor perguntar por tipo, marca, ano, estado ou modelo de máquina.',
    input_schema: {
      type: 'object',
      properties: {
        category:     { type: 'string', description: 'Tipo da máquina (ex: escavadeira, pá carregadeira, trator de esteiras, retroescavadeira, motoniveladora, rolo compactador)' },
        manufacturer: { type: 'string', description: 'Marca (ex: Caterpillar, Komatsu, John Deere, Volvo, Case, Liebherr, Hitachi) },
        model:        { type: 'string', description: 'Modelo específico (ex: 320, D6T, 966H, 620K)' },
        state:        { type: 'string', description: 'Sigla do estado (ex: PR, SP, MG, SC\\�, ', RS, GO, MT)' },
        year_min:     { type: 'integer', description: 'Ano mínimo de fabricação' },
        year_max:     { type: 'integer', description: 'Ano máximo de fabricação' },
        page:         { type: 'integer', description: 'Página de resultados (padrão 0)', default: 0 },
      },
    },
  },
];

const { simulateFinancing } = require('./tools/tracao');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });