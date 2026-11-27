# Requisitos — Me Leva

Guia para registrar e manter os requisitos do Me Leva:

- **Requisito funcional (RF):** o que o app **faz** — ações, telas e resultados observáveis
  para quem usa.
- **Requisito não funcional (RNF):** **como** o app precisa se comportar — desempenho,
  segurança, privacidade, usabilidade, acessibilidade, compatibilidade etc.

> O projeto é um **protótipo navegável**: as regras de negócio rodam no navegador, com
> dados de exemplo salvos no `localStorage` e sem backend. Quando uma parte depende de
> servidor (e-mail, SMS, pagamento, clima real), o status é `Implementado (simulado)` ou
> `Aprovado`, com a explicação no próprio requisito.
>
> Documento original do grupo: [documento-de-requisitos-mvp.pdf](documento-de-requisitos-mvp.pdf).
> Regras de negócio: [REGRAS-DE-NEGOCIO.md](REGRAS-DE-NEGOCIO.md).

## 1. Estrutura

```text
docs/requisitos/
├── README.md               este guia + índice
├── funcionais/
│   ├── _TEMPLATE.md        template de RF
│   └── RF-NNN.md           criado ao registrar um requisito funcional
└── nao-funcionais/
    ├── _TEMPLATE.md        template de RNF
    └── RNF-NNN.md          criado ao registrar um requisito não funcional
```

- **Um requisito por arquivo.** O nome do arquivo é o próprio ID: `RF-001.md`,
  `RNF-014.md`.
- `_TEMPLATE.md` é só modelo: **nunca** registre um requisito editando o template.
- O índice deste documento é a **fonte da verdade** da lista de requisitos.

## 2. Convenção de IDs

| Tipo | Prefixo | Formato | Exemplo |
| --- | --- | --- | --- |
| Funcional | `RF` | `RF-NNN` | `RF-001` |
| Não funcional | `RNF` | `RNF-NNN` | `RNF-001` |

- Numeração sequencial de **três dígitos**, por tipo.
- **Não reaproveite** o número de um requisito descartado: ele permanece no índice com o
  status `Descartado`, para preservar o histórico.
- O ID aparece no nome do arquivo, no título e nas referências cruzadas.
- RFs e RNFs se referenciam pelo ID (campos `RNFs relacionados` / `RFs relacionados`).

## 3. Status

| Status | Significado |
| --- | --- |
| `Proposto` | Escrito e aguardando validação; ainda não faz parte do escopo aprovado. |
| `Aprovado` | Validado para entrar no escopo. |
| `Em implementação` | Sendo construído nas telas/código. |
| `Implementado` | Entregue e verificável na versão indicada no requisito. |
| `Implementado (simulado)` | Funciona no protótipo, mas a parte de servidor é simulada. |
| `Descartado` | Saiu do escopo; o número não é reaproveitado. |

O caminho normal é `Proposto → Aprovado → Em implementação → Implementado`. Um requisito
pode ir para `Descartado` a partir de qualquer status.

## 4. Prioridade (MoSCoW adaptado)

| Prioridade | Significado |
| --- | --- |
| `Essencial` | Sem ele o MVP não cumpre o objetivo. |
| `Importante` | Relevante, mas o MVP funciona sem. |
| `Desejável` | Melhoria futura; pode esperar. |

## 5. Como adicionar um requisito

1. **Decida o tipo.** Descreve uma ação/resultado de quem usa? **RF**. Descreve uma
   qualidade mensurável de como o sistema se comporta? **RNF**.
2. **Copie o template** correspondente para a pasta do tipo.
3. **Renomeie** para o próximo ID livre (`RF-00N.md` / `RNF-00N.md`), sem reaproveitar
   números.
4. **Preencha** todos os campos, trocando os `«...»` e apagando as instruções em citação e
   os exemplos em comentário.
5. **Atualize o índice** na seção 7 ou 8 deste arquivo.
6. Se o requisito já foi entregue, **registre no `CHANGELOG.md`** na seção do release,
   citando o ID.

### Checklist antes de salvar

- [ ] Nome do arquivo igual ao ID e ID único.
- [ ] Status e prioridade preenchidos.
- [ ] Critérios de aceite **observáveis** (dá para dizer "passou" ou "falhou").
- [ ] RFs/RNFs relacionados citados pelo ID.
- [ ] Índice deste README atualizado.

## 6. Rastreabilidade

Cada requisito deve apontar para onde ele vive:

- **Tela do Figma** — número e nome (ex.: `02. Login`).
- **Código** — arquivo(s) que implementam (ex.: `src/screens/Login.jsx`).
- **Versão** — DateVer da release em que foi entregue (ex.: `1.23.10.2026`).

Assim o requisito conversa com o [`CHANGELOG.md`](../../CHANGELOG.md) e com a convenção de
[`../VERSIONAMENTO.md`](../VERSIONAMENTO.md).

## 7. Índice — requisitos funcionais

| ID | Requisito | Status | Prioridade | Tela do Figma |
| --- | --- | --- | --- | --- |
| [RF-001](funcionais/RF-001.md) | Criar conta com nome, e-mail e senha, aceitando os termos de uso | Implementado | Essencial | 03. Cadastro |
| [RF-002](funcionais/RF-002.md) | Entrar com e-mail e senha ou com conta Google | Implementado (simulado) | Essencial | 02. Login |
| [RF-003](funcionais/RF-003.md) | Recuperar a senha por link enviado ao e-mail | Implementado (simulado) | Essencial | 02b. Recuperar senha |
| [RF-004](funcionais/RF-004.md) | Mostrar erro em login inválido e bloquear por 15 min após 5 tentativas | Implementado | Essencial | 02c. Login com erro |
| [RF-005](funcionais/RF-005.md) | Confirmar e-mail e celular (código por SMS) | Aprovado | Importante | sem tela |
| [RF-006](funcionais/RF-006.md) | Escolher pelo menos 3 esportes de interesse | Implementado | Essencial | 04. Interesses |
| [RF-007](funcionais/RF-007.md) | Completar perfil: foto, cidade, idade, nível, disponibilidade e bio | Implementado | Essencial | 05. Perfil inicial |
| [RF-008](funcionais/RF-008.md) | Ver e editar o próprio perfil | Implementado | Essencial | 13. Perfil, 14. Editar perfil |
| [RF-009](funcionais/RF-009.md) | Ver o perfil público de outra pessoa | Implementado | Essencial | 19. Perfil público |
| [RF-010](funcionais/RF-010.md) | Enviar e aceitar pedidos de conexão | Implementado | Importante | 06. Início, 18. Notificações, 19. Perfil público |
| [RF-011](funcionais/RF-011.md) | Início com próximas atividades, recomendadas e pessoas com interesses parecidos | Implementado | Essencial | 06. Início |
| [RF-012](funcionais/RF-012.md) | Explorar atividades em lista e em mapa | Implementado | Essencial | 07, 07b. Explorar |
| [RF-013](funcionais/RF-013.md) | Filtrar por esporte, data, horário, nível, distância e vagas abertas | Implementado | Essencial | 08. Filtros |
| [RF-014](funcionais/RF-014.md) | Favoritar atividades e ver a lista de favoritos | Implementado | Importante | 17. Favoritos |
| [RF-015](funcionais/RF-015.md) | Mostrar a previsão do tempo no card e nos detalhes da atividade | Implementado (simulado) | Importante | 06, 07, 09 |
| [RF-016](funcionais/RF-016.md) | Mostrar estados de carregando e de busca sem resultados | Implementado | Importante | 07c, 07d |
| [RF-017](funcionais/RF-017.md) | Ver detalhes: descrição, data, nível, vagas, participantes, organizador e dicas de segurança | Implementado | Essencial | 09. Detalhes |
| [RF-018](funcionais/RF-018.md) | Confirmar presença numa atividade com vaga | Implementado | Essencial | 09, 15 |
| [RF-019](funcionais/RF-019.md) | Entrar na lista de espera quando a atividade estiver lotada | Implementado | Essencial | 09b. Detalhes lotada |
| [RF-020](funcionais/RF-020.md) | Cancelar a participação, liberando a vaga para o próximo da fila | Implementado | Essencial | sem tela |
| [RF-021](funcionais/RF-021.md) | Adicionar a atividade à agenda do celular ou computador | Implementado | Importante | 15. Participação confirmada |
| [RF-022](funcionais/RF-022.md) | Criar atividade: esporte, título, data, horário, duração, ponto de encontro, nível, vagas, público, descrição e foto | Implementado | Essencial | 10. Criar atividade |
| [RF-023](funcionais/RF-023.md) | Ver a prévia do card enquanto cria | Implementado | Importante | 10. Criar atividade |
| [RF-024](funcionais/RF-024.md) | Confirmar a publicação e compartilhar por link, WhatsApp e Instagram | Implementado | Importante | 11. Atividade publicada |
| [RF-025](funcionais/RF-025.md) | Salvar rascunho e continuar editando depois | Implementado | Desejável | 10, 12b |
| [RF-026](funcionais/RF-026.md) | Chat de grupo por atividade, só para participantes confirmados | Implementado (simulado) | Essencial | 16. Mensagens |
| [RF-027](funcionais/RF-027.md) | Notificações: novos participantes, lembretes, chuva, conexões e atividades perto | Implementado (simulado) | Importante | 18. Notificações |
| [RF-028](funcionais/RF-028.md) | Convidar amigos por link | Implementado | Importante | janela Convidar |
| [RF-029](funcionais/RF-029.md) | Minhas atividades: próximas, criadas por mim e histórico | Implementado | Essencial | 12, 12b, 12c |
| [RF-030](funcionais/RF-030.md) | Avaliar a atividade depois que ela acontece | Implementado | Importante | 20. Avaliar atividade |
| [RF-031](funcionais/RF-031.md) | Denunciar uma pessoa (pelo perfil ou escolhendo no grupo), com motivo, relato e protocolo | Implementado | Essencial | janelas Denunciar |
| [RF-032](funcionais/RF-032.md) | Bloquear uma pessoa | Implementado | Essencial | janelas Denunciar, 19 |
| [RF-033](funcionais/RF-033.md) | Reportar atividade: cobrança ou divulgação sem aviso, local diferente, não aconteceu | Implementado | Essencial | janela Reportar |
| [RF-034](funcionais/RF-034.md) | Avisar um contato de confiança durante a atividade | Implementado (simulado) | Importante | 15. Participação confirmada |
| [RF-035](funcionais/RF-035.md) | Plano Organizador: publicar atividades pagas e patrocinadas, com selo | Proposto | Desejável | 10, janela Plano |
| [RF-036](funcionais/RF-036.md) | Filtro "só atividades gratuitas" | Proposto | Desejável | 08 |
| [RF-037](funcionais/RF-037.md) | Pagamento dos participantes pelo app, com reembolso | Proposto | Desejável | sem tela |
| [RF-038](funcionais/RF-038.md) | Verificação de identidade com documento e selfie (selo verificado) | Proposto | Desejável | sem tela |

## 8. Índice — requisitos não funcionais

| ID | Requisito | Categoria | Status |
| --- | --- | --- | --- |
| [RNF-001](nao-funcionais/RNF-001.md) | O site funciona em celular, tablet e computador (a partir de 360 px de largura) | Responsividade | Implementado |
| [RNF-002](nao-funcionais/RNF-002.md) | As páginas principais carregam em até 3 segundos numa conexão 4G | Desempenho | Implementado |
| [RNF-003](nao-funcionais/RNF-003.md) | Confirmar presença numa atividade leva no máximo 3 cliques a partir do Início | Usabilidade | Implementado |
| [RNF-004](nao-funcionais/RNF-004.md) | Toda ação dá retorno visual: aviso de sucesso, mensagem de erro ou tela de carregamento | Usabilidade | Implementado |
| [RNF-005](nao-funcionais/RNF-005.md) | Contraste de texto e navegação por teclado seguindo as diretrizes WCAG 2.1, nível AA | Acessibilidade | Implementado |
| [RNF-006](nao-funcionais/RNF-006.md) | Imagens com texto alternativo e campos de formulário com rótulo | Acessibilidade | Implementado |
| [RNF-007](nao-funcionais/RNF-007.md) | Interface construída com componentes reutilizáveis e cores definidas como variáveis (design system) | Consistência | Implementado |
| [RNF-008](nao-funcionais/RNF-008.md) | Senhas armazenadas com criptografia; comunicação sempre por HTTPS | Segurança | Aprovado |
| [RNF-009](nao-funcionais/RNF-009.md) | Tratamento de dados conforme a LGPD | Privacidade | Implementado (parcial) |
| [RNF-010](nao-funcionais/RNF-010.md) | Interface em português do Brasil | Idioma | Implementado |
| [RNF-011](nao-funcionais/RNF-011.md) | Funciona nas versões atuais de Chrome, Safari, Edge e Firefox | Compatibilidade | Implementado |
