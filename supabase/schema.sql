-- ============================================================
-- Schema do Supabase para o Agente WhatsApp — Pesados Online
-- Execute este SQL no SQL Editor do seu projeto Supabase
-- ============================================================

-- Tabela de conversas por número de WhatsApp
CREATE TABLE IF NOT EXISTS conversations (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  phone        TEXT        UNIQUE NOT NULL,          -- "whatsapp:+5541..."
  messages     JSONB       NOT NULL DEFAULT '[]',    -- Histórico [{role, content}]
  last_machine JSONB,                                -- Última máquina discutida (contexto)
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_phone      ON conversations (phone);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations (updated_at DESC);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_conversations_updated_at ON conversations;
CREATE TRIGGER trg_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security: o service_key bypassa o RLS automaticamente
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
