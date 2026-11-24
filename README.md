# Me Leva

**Me Leva** é um app para encontrar gente e atividades esportivas perto de você, em
Teresópolis (RJ): corrida, trilha, pedal, futebol, yoga e mais, de graça e no seu nível.
Projeto da matéria de MVP da FESO.

Este repositório é o **MVP front-end navegável**: todas as telas do protótipo funcionam com
dados de demonstração salvos no próprio navegador. Não há backend.

## Integrantes

| Nome | Papel |
| --- | --- |
| _a preencher_ | |
| _a preencher_ | |
| _a preencher_ | |

## Situação-problema

_A preencher pelo grupo._

## O que dá para fazer no MVP

- Entrar com a conta de demonstração (ou criar conta em 3 passos: conta, interesses, perfil).
- Explorar atividades com busca, filtros, mapa e ordenação.
- Ver detalhes, **confirmar presença**, entrar na lista de espera e cancelar.
- Conversar no chat da atividade e com pessoas conectadas.
- **Criar atividade** com prévia ao vivo, salvar rascunho, editar e cancelar.
- Ver Minhas atividades (próximas, criadas e histórico), avaliar e denunciar.
- Perfil, perfil público, favoritos, notificações e preferências.

As regras do documento de requisitos (endereço só para confirmados, lista de espera,
bloqueio de login etc.) estão em
[`docs/requisitos/REGRAS-DE-NEGOCIO.md`](docs/requisitos/REGRAS-DE-NEGOCIO.md).

## Como rodar

Precisa do [Node.js](https://nodejs.org/) 20 ou mais novo.

```bash
npm install
npm run dev      # abre em http://localhost:5173
npm test         # testes das regras de negócio
npm run build    # gera a versão final em dist/
```

**Conta de demonstração:** `mariana@meleva.app` / `MeLeva@2026` (ou o botão
"Entrar como Mariana" na tela de login).

Tudo o que você faz fica salvo no `localStorage` do navegador. Para voltar ao estado
inicial, use **Editar perfil → Restaurar demonstração**.

Roteiro de apresentação: [`test/README.md`](test/README.md).

## Stack

- **React 19** + **Vite 7**, JavaScript (`.jsx`), navegação por hash (`#/explorar`)
- CSS puro com os tokens do Figma (`src/styles.css` e `src/app.css`)
- Estado global em React Context, salvo no `localStorage`
- Testes com **Vitest**

## Estrutura

```text
src/
  App.jsx              rotas por hash
  store.jsx            estado global, toasts e modais
  screens/             uma tela por arquivo (numeradas como no Figma)
  components/          AppShell, cards, modais e formulários reutilizados
  services/rules.js    regras de negócio (funções puras)
  services/seed.js     monta os dados iniciais a partir de data/
  utils/format.js      datas, horários e textos
test/                  testes das regras + roteiro do pitch
data/                  dados de demonstração (JSON)
docs/
  requisitos/          documento de requisitos, RFs, RNFs e regras de negócio
  prototipo/           telas do Figma e prints do MVP
public/assets/         imagens (WebP)
```

## Telas

Todas as 20 telas do Figma, as variações (02b, 02c, 07b–07d, 09b, 12b, 12c) e os modais
estão implementadas e funcionam a partir de 360 px de largura. A comparação lado a lado
está em [`docs/prototipo/`](docs/prototipo/README.md).

Protótipo no Figma: [Me Leva — MVP Front-end](https://www.figma.com/design/sNDmW8GeK9fNdVHC0r0Izm/Me-Leva-%E2%80%94-MVP-Front-end)

## Decisões provisórias

O documento de requisitos deixa 5 decisões para o grupo. O MVP adota uma posição provisória
em cada uma (detalhes em [REGRAS-DE-NEGOCIO.md](docs/requisitos/REGRAS-DE-NEGOCIO.md#decisões-pendentes-do-grupo)):

- "Só para mulheres" fica só como filtro no Explorar; não dá para criar atividade com essa restrição.
- Mensagem direta só entre pessoas conectadas.
- Plano Organizador e cobrança aparecem apenas como "Em breve".

## Documentação

- [`docs/README.md`](docs/README.md): índice da documentação.
- [`CHANGELOG.md`](CHANGELOG.md): histórico de versões (DateVer `N.DD.MM.YYYY`).
