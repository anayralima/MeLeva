# Me Leva

## Integrantes da equipe

| Nome | Matrícula | Papel |
| --- | --- | --- |
| _a preencher_ | | |
| _a preencher_ | | |
| _a preencher_ | | |

## Situação-problema

_A preencher pela equipe._

## Descrição do MVP

O **Me Leva** conecta pessoas que querem praticar esportes em grupo em Teresópolis (RJ).
No app, a pessoa encontra atividades perto de casa (corrida, trilha, pedal, futebol, yoga e
outras), confirma presença, conversa com o grupo e cria as próprias atividades, sempre de
graça. O endereço exato e o chat ficam visíveis só para quem confirmou presença.

Este MVP é um front-end navegável feito em React. Todas as telas do protótipo funcionam
com dados de demonstração, que ficam salvos no navegador.

## Como executar localmente

É preciso ter o [Node.js](https://nodejs.org/) 20 ou mais recente.

```bash
npm install
npm run dev    # abre em http://localhost:5173
npm test       # roda os testes das regras de negócio
```

Para entrar, use a conta de demonstração `mariana@meleva.app` com a senha `MeLeva@2026`,
ou clique em "Entrar como Mariana" na tela de login.

## Informações adicionais

- **Organização do repositório**
  - `src/`: código-fonte.
  - `test/`: testes e roteiro de demonstração.
  - `data/`: dados de demonstração.
  - `docs/requisitos/`: lista de requisitos e regras de negócio.
  - `docs/prototipo/`: telas de prototipação do Figma.
- **Protótipo:** [Figma — Me Leva](https://www.figma.com/design/sNDmW8GeK9fNdVHC0r0Izm/Me-Leva-%E2%80%94-MVP-Front-end).
- **Sem backend:** os dados ficam no `localStorage` do navegador. Para voltar ao estado
  inicial, use "Editar perfil → Restaurar demonstração".
