# Agente WhatsApp — Pesados Online

Assistente interno de consulta de estoque via WhatsApp para os vendedores da Pesados Online (Grupo BMC).

## O que o agente faz

- Busca máquinas por tipo, marca, modelo, ano, estado e faixa de preço
- Envia fotos e vídeos das máquinas pelo WhatsApp
- Gera PDFs comerciais prontos para compartilhar com o cliente
- Simula venda com breakdown de comissão (tipo PADRÃO / DNET)
- Simula financiamento pela Tração e envia PDF da simulação

---

## Passo a passo de configuração

### 1. Banco de dados — Supabase

1. Acesse [supabase.com](https://supabase.com) e abra seu projeto
2. Vá em **SQL Editor** → clique em **New query**
3. Cole o conteúdo do arquivo `supabase/schema.sql` e execute
4. Vá em **Project Settings → API** e copie:
   - **Project URL** → `SUPABASE_URL`
   - **service_role** (secret) → `SUPABASE_SERVICE_KEY`

### 2. API Pesados

Solicite ao time de TI da Pesados Online:
- Um e-mail e senha de **conta de serviço** (service account) para o agente
- Essas credenciais vão em `PESADOS_EMAIL` e `PESADOS_PASSWORD`

### 3. Twilio — WhatsApp

1. Acesse [console.twilio.com](https://console.twilio.com)
2. Copie **Account SID** → `TWILIO_ACCOUNT_SID`
3. Copie **Auth Token** → `TWILIO_AUTH_TOKEN`
4. Em **Messaging → Try it out → Send a WhatsApp message**, anote o número do sandbox → `TWILIO_WHATSAPP_NUMBER`  
   _(Para produção: configure um número WhatsApp Business aprovado)_
5. O webhook do Twilio deve apontar para: `https://SEU-DOMINIO.onrender.com/webhook/whatsapp`

### 4. Anthropic API

1. Acesse [console.anthropic.com](https://console.anthropic.com)
2. Crie ou copie uma API Key → `ANTHROPIC_API_KEY`

### 5. Deploy no Render

1. Faça push deste repositório para o GitHub
2. Acesse [render.com](https://render.com) → **New Web Service**
3. Conecte o repositório GitHub
4. O Render detecta o `render.yaml` automaticamente
5. Em **Environment Variables**, adicione os segredos:

| Variável | Valor |
|---|---|
| `PESADOS_EMAIL` | email da conta de serviço |
| `PESADOS_PASSWORD` | senha da conta de serviço |
| `ANTHROPIC_API_KEY` | sk-ant-... |
| `TWILIO_ACCOUNT_SID` | ACxx... |
| `TWILIO_AUTH_TOKEN` | seu auth token |
| `TWILIO_WHATSAPP_NUMBER` | whatsapp:+14155238886 |
| `SUPABASE_URL` | https://xxx.supabase.co |
| `SUPABASE_SERVICE_KEY` | eyJ... |

6. Clique em **Deploy**
7. Após o deploy, copie a URL do serviço (ex: `https://pesados-agent.onrender.com`)

### 6. Configurar webhook no Twilio

1. No console Twilio → **Messaging → Settings → WhatsApp Sandbox Settings**
2. Em **When a message comes in**, coloque:
   ```
   https://pesados-agent.onrender.com/webhook/whatsapp
   ```
3. Método: **POST**

### 7. Controle de acesso (opcional)

Para restringir o agente a números específicos, defina `ALLOWED_PHONES` no Render:
```
ALLOWED_PHONES=whatsapp:+5541999990001,whatsapp:+5541999990002
```
Deixe em branco para permitir qualquer número.

---

## Testando localmente

```bash
# Clone o repositório
git clone https://github.com/SEU-USUARIO/pesados-agent.git
cd pesados-agent

# Instale dependências
npm install

# Copie e preencha as variáveis
cp .env.example .env
# edite o .env com suas credenciais

# Rode o servidor
npm run dev
```

Para receber webhooks do Twilio localmente, use o [ngrok](https://ngrok.com):
```bash
ngrok http 3000
# Copie a URL https:// e configure no Twilio
```

---

## Estrutura do projeto

```
pesados-agent/
├── src/
│   ├── index.js          # Servidor Express + webhook Twilio
│   ├── agent.js          # Loop do agente Claude com ferramentas
│   ├── tools/
│   │   ├── pesados.js    # Cliente da API Pesados Online
│   │   └── tracao.js     # Cliente MCP Tração (financiamento)
│   ├── services/
│   │   ├── twilio.js     # Envio de mensagens WhatsApp
│   │   └── supabase.js   # Histórico de conversas
│   └── prompts/
│       └── system.js     # Prompt do sistema (PT-BR)
├── supabase/
│   └── schema.sql        # Schema do banco de dados
├── .env.example          # Variáveis necessárias
├── render.yaml           # Config de deploy no Render
└── package.json
```

---

## Exemplos de uso pelos vendedores

```
Vendedor: "Tem escavadeira Cat 320 de 2020 pra cima no Paraná?"
Agente:   [Lista as máquinas disponíveis com preço, horímetro e localização]

Vendedor: "Me manda as fotos da primeira"
Agente:   [Envia as fotos por WhatsApp]

Vendedor: "Gera um PDF pra eu mandar pro cliente"
Agente:   [Envia o PDF comercial]

Vendedor: "Como fica a simulação de venda por R$ 680 mil?"
Agente:   [Mostra comissão por perfil]

Vendedor: "Simula o financiamento com R$ 100 mil de entrada em 48x"
Agente:   [Mostra valor das parcelas e envia PDF da Tração]
```
