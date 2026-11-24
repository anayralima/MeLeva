# Regras de negócio

Regras do documento de requisitos (seção 5) e onde cada uma está no MVP. As funções ficam em
[`src/services/rules.js`](../../src/services/rules.js) e são testadas em
[`test/regras.test.js`](../../test/regras.test.js).

| ID | Regra | Como o MVP cumpre | Onde |
| --- | --- | --- | --- |
| RN01 | Atividades entre pessoas são sempre gratuitas. | Não existe preço em nenhuma tela. Atividades pagas ou patrocinadas aparecem só como "plano Organizador (em breve)". | `CreateActivity.jsx`, modal `plano` |
| RN02 | Sem aprovação do organizador. | "Quero participar" confirma na hora quando há vaga. | `join()` |
| RN03 | Endereço exato só para confirmados. | Os demais veem "Bairro • distância" e um cadeado. | `canSeeAddress()`, `place()` |
| RN04 | Mapa aproximado para quem não confirmou. | O pin é deslocado de forma fixa para quem não confirmou. | `mapPosition()` |
| RN05 | Chat só para confirmados (não para a lista de espera). | Quem não está confirmado vê o chat bloqueado. | `canChat()` |
| RN06 | Lotada continua visível, com selo e lista de espera. | Selo "Lotada" e botão "Entrar na lista de espera". | `isFull()`, `join()` |
| RN07 | Cancelou → vaga vai ao próximo da fila. | O primeiro da fila é promovido e recebe notificação. | `leave()` |
| RN08 | Quem cancela perde endereço e chat. | O status volta a "none" e as duas permissões caem. | `leave()` |
| RN09 | Custo ou marca precisam estar na descrição. | Aviso fixo em Criar atividade pedindo para citar custo ou marca na descrição. | `CreateActivity.jsx` |
| RN10 | Avaliação é da atividade; pessoa é por denúncia. | Tela Avaliar só avalia a atividade; "Problema com uma pessoa? Denunciar" abre a denúncia separada. | `RateActivity.jsx` |
| RN11 | Denúncia anônima com protocolo. | Gera protocolo `ML-AAAAMMDD-NNNN` e mostra o aviso "Em perigo? Ligue 190". | `reportPerson()`, `protocol()` |
| RN12 | Avaliar só depois da data e só quem participou. | Botão "Avaliar" aparece apenas no histórico de quem participou. | `canRate()` |
| RN13 | Cadastro exige 3 esportes ou mais. | O passo "Interesses" só avança com 3 ou mais. | `MIN_INTERESTS` |
| RN14 | Só Teresópolis; outras cidades "em breve". | O seletor de cidade mostra as demais como "em breve". | modal `cidade` |

Outras regras do documento que o MVP também simula: bloqueio de 15 minutos após 5 senhas
erradas (`attemptLogin()`), senha com 8+ caracteres, número e símbolo (`isStrongPassword()`) e
idade mínima de 18 anos (`validateProfile()`).

## Decisões pendentes do grupo

O documento deixa 5 decisões em aberto. Para o MVP poder ser apresentado, adotamos uma
posição provisória em cada uma. Elas são fáceis de trocar.

| Decisão | O que o MVP faz hoje |
| --- | --- |
| Manter atividades "só para mulheres" e como garantir | Mantido só como filtro no Explorar (atividades de exemplo). A opção saiu de Criar atividade. |
| Aprovar o plano Organizador | Aparece apenas como "Em breve". |
| Modelo de cobrança | Fora do MVP. Nada é cobrado. |
| Preços R$ 9,90 / R$ 29,90 | Não aparecem no app. |
| Mensagem direta livre ou só entre conectados | Só entre pessoas **conectadas**. Sem conexão, o perfil mostra "Conectar". |
