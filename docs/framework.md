# Framework (motor genérico)

Peças reutilizáveis, sem conhecimento do jogo específico. Em teoria dá para
tirar essas 4 e montar outro jogo 2D em cima delas. A documentação de cada
método (parâmetros, comportamento) está em JSDoc no próprio código — aqui
fica só o panorama de como as peças se encaixam.

Referência rápida: [animacao.js](../framework/animacao.js) ·
[colisor.js](../framework/colisor.js) · [teclado.js](../framework/teclado.js) ·
[spritesheet.js](../framework/spritesheet.js) ·
[carregador-assets.js](../framework/carregador-assets.js).

## Como as peças se encaixam

`Animacao` — game loop (`requestAnimationFrame`), "hub" central:
- Tudo que roda a cada frame (sprite desenhável ou lógica sem desenho) se
  registra nela (`novoSprite` / `novoProcessamento`)
- Cada registrado ganha referência de volta (`this.animacao`) para poder se
  auto-excluir depois
- A cada tick, roda nessa ordem: atualizar → desenhar → processar → aplicar
  exclusões
  - é por isso que `Colisor` entra como *processamento* (roda depois de
    todo mundo já ter se movido no frame), não como sprite

`Colisor` — mesmo padrão de registro/auto-referência (`novoSprite` →
`this.colisor`):
- Delega a checagem em si para cada sprite (`retangulosColisao()` /
  `colidiuCom()`) — agnóstico sobre o que é nave, ovni ou tiro
- Regras que não pertencem a nenhuma entidade específica (ex.: pontuação)
  entram via o callback `aoColidir`, setado por `Partida`
- **É o componente com o problema de performance mais sério do projeto** —
  ver [TODO.md](TODO.md#1-colisão-ineficiente-prioridade-alta)

Em ambos (`Animacao` e `Colisor`), exclusão de sprites é **diferida**:
- `excluirSprite` só marca para remoção
- a remoção real só acontece ao final do frame — evita mutar o array que
  está sendo iterado no meio do loop

`Teclado` — independente das outras duas:
- Só traduz eventos DOM em dois modos de leitura (estado contínuo vs.
  disparo único)
- Consumido por `Nave` e por `Partida` ([jogo.md](jogo.md))
- `remover()` desfaz os listeners (`keydown`/`keyup`) registrados no
  construtor — necessário porque `Partida` cria um `Teclado` novo a cada
  rodada; sem remover os listeners da rodada anterior, eles se empilhariam
  em `document` para sempre

`Spritesheet` — também independente, não conhece `Animacao` nem `Colisor`:
- Instanciado dentro de cada entidade que precisa de animação por quadros
  (`Nave`, `Explosao`, `Painel`)
- Chamado manualmente no `desenhar()` delas

`CarregadorAssets` — independente das outras peças, sem noção de
`Animacao`/`Colisor`/canvas:
- Recebe um mapa `{chave: nomeArquivo}` de imagens, dispara o carregamento
  em paralelo e devolve, na hora, um mapa `{chave: Image}` — cada `Image` é
  preenchida de forma assíncrona conforme carrega
- Reporta progresso/erro/conclusão via callbacks (`aoProgredir`, `aoFalhar`,
  `aoCompletar`) — não desenha nada; quem decide como mostrar uma tela de
  carregamento é `Menu` ([jogo.md](jogo.md))
- Usado só para imagens hoje; carregamento de música (`JogoNave`) é simples
  o bastante para não precisar dele
