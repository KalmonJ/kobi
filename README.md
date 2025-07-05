## 🧩 Monorepo

Este repositório é um **monorepo** que contém os seguintes aplicativos:

- **`api`** (NestJS) — Backend da aplicação  
- **`web`** (Next.js) — Frontend da aplicação

---

## 📦 Estrutura da API

O backend é composto por três módulos principais:

### 🔐 `crypto/`

Responsável pela criptografia das mensagens enviadas pelo frontend.

---

### 💬 `messages/`

Contém a lógica de recepção, persistência e classificação das mensagens.

- **`message.controller.ts`**  
  Responsável por receber as mensagens do frontend e repassá-las para o service.

- **`message.service.ts`**  
  Responsável por:
  - Persistir as mensagens no banco de dados
  - Encaminhá-las para a fila (RabbitMQ)

- **`handlers/classify-message-handler.ts`**  
  - Consumidor da fila
  - Realiza a **classificação automática** do conteúdo da mensagem com base no funil de vendas.  
    Atualmente utiliza o **Gemini (Google)** como modelo de IA, mas pode ser facilmente substituído por outro provider.

---

### 🐇 `rabbitmq/`

Serviço que cria um proxy do cliente para enviar as mensagens para a fila do **RabbitMQ**.

---

## ⚙️ Setup do Projeto

1. **Adicione um arquivo `.env`** com as variáveis de ambiente.  
   Você pode usar o `.env.example` como base.

   - `GOOGLE_API_KEY` — (Opcional) Chave da API do Google para usar o Gemini  
   - Se não fornecer, será utilizada uma classificação **falsa de fallback**.

2. **Suba os serviços com Docker:**

   ```bash
   docker compose up -d
