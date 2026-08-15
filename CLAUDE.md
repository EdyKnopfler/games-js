# games-js

Jogo de nave (space shooter) em JavaScript puro, rodando em um único
`<canvas>`. A sintaxe era originalmente pré-ES6 (funções construtoras +
`prototype`, `var`) e foi modernizada para ES6+ (`class`, `const`/`let`,
modo estrito); segue sem módulos — `<script>` clássico, ordem manual das
tags em [index.html](index.html).

## Estrutura

- `index.html` — bootstrap: carrega assets, monta os objetos do jogo e
  controla o fluxo (menu → jogo → pausa → game over).
- `framework/` — motor genérico (`animacao.js`, `colisor.js`, `teclado.js`,
  `spritesheet.js`): game loop, colisão, input, animação por spritesheet.
- `jogo/` — entidades específicas do jogo (`nave.js`, `ovni.js`, `tiro.js`,
  `explosao.js`, `fundo.js`, `painel.js`).
- `img/`, `snd/` — assets.

## Documentação técnica

Ver [docs/](docs/):

- [docs/convencoes.md](docs/convencoes.md) — convenções de escrita para
  código e docs deste projeto. **Seguir ao comentar código ou editar docs.**
- [docs/decisoes-de-projeto.md](docs/decisoes-de-projeto.md) — por que o
  código é como é (contexto, arquitetura, padrões usados).
- [docs/framework.md](docs/framework.md) — as peças genéricas reutilizáveis
  (loop, colisão, input, spritesheet).
- [docs/jogo.md](docs/jogo.md) — as entidades e o fluxo específico deste jogo.
- [docs/TODO.md](docs/TODO.md) — débitos técnicos conhecidos, priorizados,
  para o rework. **Colisão ineficiente é a prioridade nº 1.**
- [docs/colisao-avancada.md](docs/colisao-avancada.md) — exercício de
  modelagem para colisões cujo resultado depende de qual retângulo se
  tocou (tag nos retângulos, hitbox condicional por estado).
