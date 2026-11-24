# Dados de demonstração

Arquivos JSON lidos por [`src/services/seed.js`](../src/services/seed.js) para montar o
estado inicial do app. Na primeira visita esse estado vai para o `localStorage`
(chave `meleva:state`) e todas as ações passam a ser salvas lá.

| Arquivo | Conteúdo |
| --- | --- |
| `usuarios.json` | Mariana (`me`, a conta de demonstração) e outras 9 pessoas. |
| `atividades.json` | 13 atividades em Teresópolis. `dayOffset` é relativo a hoje (negativo = já aconteceu). |
| `conversas.json` | Mensagens dos chats de atividade e da conversa direta com o Lucas (`minutesAgo`). |
| `notificacoes.json` | Notificações iniciais, incluindo um pedido de conexão. |

Ao mudar estes arquivos, aumente `SEED_VERSION` em `seed.js` para que os navegadores
descartem o estado antigo.
