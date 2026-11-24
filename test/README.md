# Testes

```bash
npm test
```

Roda os testes de [`regras.test.js`](regras.test.js) com Vitest. Eles cobrem as regras de
negócio puras de `src/services/rules.js`: participar, lista de espera, promoção da fila ao
cancelar, endereço e chat só para confirmados, avaliação, denúncia com protocolo, validação
de atividade, senha e bloqueio de login.

## Roteiro de demonstração (pitch, cerca de 3 minutos)

Antes de começar, em **Editar perfil → Restaurar demonstração**, volte os dados ao estado inicial.

1. **Landing** → "Entrar" → **Entrar como Mariana** (conta `mariana@meleva.app` / `MeLeva@2026`).
2. **Início**: próximas atividades, pessoas parecidas e clima.
3. **Explorar**: filtre por "Corrida", mostre o mapa e a busca sem resultados.
4. Abra **Corrida no Parque**: o endereço está bloqueado (RN03). Clique **Quero participar**.
5. **Confirmada**: o endereço aparece, contato de confiança e "Adicionar ao calendário".
6. **Mensagens**: o chat da atividade já está liberado (RN05).
7. Abra **Futebol Society** (lotada): selo "Lotada" e lista de espera (RN06).
8. **Criar atividade**: preencha, veja a prévia ao vivo e publique → **Publicada**.
9. **Minhas atividades → Histórico**: avalie o **Pedal até o Soberbo** (RN12).
10. Na avaliação, **Problema com uma pessoa? Denunciar**: protocolo e aviso "Ligue 190" (RN11).
