# Me Leva

## Integrantes da equipe

| Nome | Matrícula | Papel |
| --- | --- | --- |
| _a preencher_ | | |
| _a preencher_ | | |
| _a preencher_ | | |

## Situação-problema

Muita gente quer praticar atividade física, mas desiste por não ter companhia. Quem procura
um grupo encontra tudo espalhado em grupos de WhatsApp e redes sociais, difíceis de achar
para quem é novo na atividade ou na cidade. Além disso, combinar um treino com
desconhecidos traz insegurança: não se sabe quem vai estar lá, e local e horário ficam
expostos para qualquer pessoa.

Teresópolis (RJ) tem serra, trilhas e parques, mas não tem um lugar que reúna quem quer
praticar junto. O Me Leva resolve isso conectando pessoas da cidade para praticarem
atividades físicas em grupo, no lugar, no horário e no nível certo, com segurança e de
graça.

## Descrição do MVP

O **Me Leva** conecta pessoas que querem praticar esportes em grupo em Teresópolis (RJ).
No app, a pessoa encontra atividades perto de casa (corrida, trilha, pedal, futebol, yoga e
outras), confirma presença, conversa com o grupo e cria as próprias atividades, sempre de
graça. O endereço exato e o chat ficam visíveis só para quem confirmou presença.

Este MVP é um front-end navegável feito em React. Todas as telas do protótipo funcionam
com dados de demonstração, que ficam salvos no navegador.

## Como acessar

Acesse **https://meleva.aguiartechnology.com.br/** e entre com a conta de teste:

- **E-mail:** `mariana@meleva.app`
- **Senha:** `MeLeva@2026`

Também dá para clicar em "Entrar como Mariana" na tela de login.

## Histórico do projeto

O projeto começou no repositório de um dos integrantes,
[enzoguinossi/MeLevaFeso](https://github.com/enzoguinossi/MeLevaFeso). Lá estão os
primeiros envios, de 26/09 a 03/11/2026: a estrutura em React, as telas Landing, Login,
Início e Cadastro, o armazenamento no navegador e a documentação de requisitos. Para
terminar o MVP, a equipe copiou esse trabalho para este repositório e continuou a partir
dele. Por isso o primeiro envio daqui já traz o projeto quase completo.

## Como usamos IA

Usamos ferramentas de inteligência artificial como apoio, principalmente para:

- montar e refinar as telas do protótipo no Figma;
- escrever e revisar o código das telas a partir do protótipo;
- organizar a documentação e checar contraste e acessibilidade.

As decisões do produto foram da equipe: o problema escolhido, o público, as regras de
negócio e os fluxos. Entre elas: não existir "aprovar participante", para evitar
discriminação; mostrar o endereço exato só para quem confirmou presença, inclusive quando
a atividade lota; separar a avaliação (da atividade) da denúncia (de uma pessoa, com
protocolo); permitir reportar atividades pagas ou de marca sem aviso; e deixar o Plano
Organizador como modelo de negócio futuro. Todo o conteúdo gerado foi revisado e
ajustado pela equipe.

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
