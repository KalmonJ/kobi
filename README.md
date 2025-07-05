### Repositório

Estou usando um monorepo com os seguintes apps:

- api (Nestjs)
- web (Nextjs)

Na api há 3 modulos:

- crypto (pasta):
  - Responsável pela cryptografia das mensagens enviadas pelo frontend

- messages (pasta):

  message.controller.ts (arquivo):
  - Responsável por receber as mensagens vindas do frontend e encaminhar parao service

  message.service.ts (arquivo):
  - Responsável por persistir as mensagens no banco de dados e encaminhar para a fila (Rabbitmq)
  - handlers (pasta):
    classify-message-handler.ts (arquivo) - Consumidor da fila e classificação do conteúdo da mensagem de acordo com o funil - A classificação da mensagem está sendo feita pelo Gemini do google, porem poderia
    ser outros modelos.

- rabbitmq:
  - Servico que cria um proxy do cliente e enviar mensagem para a fila.

Acredito que muito do que foi feito aqui poderia ser melhor se eu tivesse um pouco mais de tempo.

### Setup do projeto

- Adicionar .env file com a variaveis de ambiente do exemplo .env.example
- GOOGLE_API_KEY (Opcional) integração com Gemini para classificação real
- Fallback classificação fake.

- Após adicionar as envs:

rodar:

```
 docker compose up -d
```

- Ou rodar a api diretamente com os seus respectivos comandos dev
