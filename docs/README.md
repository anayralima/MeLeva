# Documentação — Me Leva

Índice da documentação do projeto. Os documentos ficam em `docs/`, são escritos em
português (pt-BR) e seguem os mesmos padrões de data e versão do restante do repositório.

## Índice

| Documento | O que tem |
| --- | --- |
| [`VERSIONAMENTO.md`](VERSIONAMENTO.md) | Convenção DateVer `N.DD.MM.YYYY` e changelog no formato Keep a Changelog 1.1.0 (pt-BR). |
| [`ARMAZENAMENTO.md`](ARMAZENAMENTO.md) | API da ferramenta de armazenamento do navegador, exemplos, áreas, namespace e limitações. |
| [`requisitos/README.md`](requisitos/README.md) | Guia para registrar requisitos: convenção de IDs, status, prioridade, como preencher e índice de RFs/RNFs. |
| [`requisitos/REGRAS-DE-NEGOCIO.md`](requisitos/REGRAS-DE-NEGOCIO.md) | Regras RN01–RN14, onde estão no código e as decisões provisórias do grupo. |
| [`prototipo/README.md`](prototipo/README.md) | Telas do Figma e prints do MVP, lado a lado. |
| [`requisitos/funcionais/_TEMPLATE.md`](requisitos/funcionais/_TEMPLATE.md) | Template para um **requisito funcional** (`RF-NNN`). |
| [`requisitos/nao-funcionais/_TEMPLATE.md`](requisitos/nao-funcionais/_TEMPLATE.md) | Template para um **requisito não funcional** (`RNF-NNN`). |

## Estrutura

```text
docs/
├── README.md                  este índice
├── VERSIONAMENTO.md           versionamento e changelog
├── ARMAZENAMENTO.md           ferramenta de armazenamento do navegador
├── prototipo/
│   ├── README.md              índice das telas
│   ├── figma/                 telas exportadas do Figma
│   └── mvp/                   prints do MVP (1440 e 360 px)
└── requisitos/
    ├── README.md              guia e índice de requisitos
    ├── REGRAS-DE-NEGOCIO.md   regras RN01–RN14 e decisões pendentes
    ├── documento-de-requisitos-mvp.pdf
    ├── funcionais/            RF-001 a RF-038 + template
    └── nao-funcionais/        RNF-001 a RNF-011 + template
```

## Convenções

- **Um assunto por arquivo**, com links relativos entre os documentos.
- **Datas em ISO 8601** (`AAAA-MM-DD`); versões no formato DateVer do projeto
  (`N.DD.MM.YYYY`, tag `vN.DD.MM.YYYY`).
- Arquivos que começam com `_` são **modelos**: copie, renomeie e preencha — não registre
  um requisito editando o template.
- Documento novo entra no índice acima e, quando a mudança for relevante, no
  [`CHANGELOG.md`](../CHANGELOG.md) na seção `Added`.

## Fora de `docs/`

| Documento | O que tem |
| --- | --- |
| [`README.md`](../README.md) | Integrantes, situação-problema, como rodar, conta de demonstração e estrutura. |
| [`CHANGELOG.md`](../CHANGELOG.md) | Histórico de mudanças por versão publicada. |
