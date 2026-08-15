# Decisões de projeto

## Contexto

- Escrito em 2014 como material de apoio de um livro sobre técnicas de
  jogos com JavaScript
  - não é sobre lógica de programação em si — leitor já sabia lógica,
    dando os primeiros passos além disso
- Época pré-ES6: sem `class`, sem `const`/`let`, sem módulos ES, sem bundler
- Objetivo: acompanhar o fluxo inteiro do jogo sem ferramentas externas —
  só abrir o HTML no navegador

Isso explica boa parte das escolhas abaixo, que hoje seriam feitas de outra
forma, mas que fizeram sentido para o propósito didático original.

**Atualização (rework):**
- Sintaxe pré-ES6 modernizada (era item 9 do antigo [TODO.md](TODO.md)):
  `var` → `const`/`let`, funções construtoras + `X.prototype = {...}` →
  `class`, `'use strict'` em todo arquivo
- Arquitetura (motor próprio, composição via injeção, ausência de módulos)
  não mudou — só a sintaxe das entidades e do motor

## Arquitetura geral: motor próprio, minimalista

Não há framework/engine externa. O projeto implementa o mínimo necessário de
um "motor" de jogo 2D:

- **Loop de jogo** ([animacao.js](../framework/animacao.js)) via `requestAnimationFrame`.
- **Colisão** ([colisor.js](../framework/colisor.js)) por retângulos (AABB), desacoplada
  dos tipos concretos de entidade.
- **Input** ([teclado.js](../framework/teclado.js)) abstraindo `keydown`/`keyup`.
- **Animação por sprite** ([spritesheet.js](../framework/spritesheet.js)) reutilizável
  entre nave, explosão e painel.

Ver [framework.md](framework.md) para o detalhamento de cada peça.

## Padrão de entidade (contrato implícito)

Toda entidade do jogo (`Nave`, `Ovni`, `Tiro`, `Explosao`, `Fundo`) segue o
mesmo contrato informal, esperado por `Animacao` e `Colisor`:

```js
{
   atualizar(),           // chamado a cada frame, antes de desenhar
   desenhar(),            // chamado a cada frame, depois de atualizar
   retangulosColisao(),   // opcional — só quem participa de colisão
   colidiuCom(outro)       // opcional — reação a colisão
}
```

Não existe interface/typing formal (não havia TypeScript nem JSDoc no
projeto original) — o contrato é respeitado por convenção. Isso é um dos
pontos abertos para o rework (ver [TODO.md](TODO.md)).

## Composição via objetos "engine" injetados

- Em vez de herança, cada entidade recebe referências diretas para os
  sistemas de que precisa (`context`, `teclado`, `imagem`, ...) no construtor
- Ganha `this.animacao`/`this.colisor` dinamicamente quando é registrada
  (`animacao.novoSprite(x)` seta `x.animacao = this`; idem em `colisor`)
- Forma simples de dependency injection sem precisar de um container

## Delta time para movimento independente de FPS

Toda movimentação usa `this.animacao.decorrido` (milissegundos desde o
último frame) para escalar velocidade, em vez de mover um valor fixo por
frame. Exemplo em [nave.js](../jogo/nave.js):

```js
const incremento = this.velocidade * this.animacao.decorrido / 1000;
```

Decisão deliberada e correta — evita jogo mais rápido/lento conforme o
hardware. Mantida no rework.

## Scroll de fundo em loop (parallax)

[fundo.js](../jogo/fundo.js) desenha a mesma imagem duas vezes, uma posição atrás
da outra, e reseta a posição de emenda quando ela ultrapassa a altura da
imagem — cria um scroll infinito sem salto visível. Técnica simples e
correta, mantida.

## Bootstrapping único em HTML

**Atualização (rework):** o "cola tudo" (carregar assets, instanciar
entidades, ligar callbacks de game over/pontuação, controlar pausa) saiu do
script inline e virou uma pequena árvore de classes — ver
[jogo.md](jogo.md#fluxo-do-jogo). O script inline em
[index.html](../index.html) ficou reduzido a instanciar `JogoNave`, ligar o
clique do link "Jogar" (`addEventListener`, com `preventDefault()` — sem
mais `href="javascript:..."`) e chamar `iniciar()`.

- A ordem das tags `<script>` continua importando (não há `import`/
  `export`) — todas as entidades, o motor e as classes de orquestração
  vivem no mesmo escopo léxico global, compartilhado entre os `<script>`
  clássicos; `jogo-nave.js` precisa vir depois de tudo que usa (framework/
  e jogo/)
- As variáveis do bootstrap são declaradas explicitamente com `const` no
  topo do script inline — já foi corrigido (era o antigo item "globais
  implícitas" do TODO.md)
- A dependência da ordem das tags em si permanece — resolvê-la exigiria
  migrar para módulos ES (ver [TODO.md](TODO.md#2-sem-módulos--build))

## Estados de nível superior como classes, não como máquina de estados formal

O fluxo (carregamento → menu → jogando → game over → menu → ...) não usa
um campo "estado atual" nem despacho polimórfico (o padrão *State* do GoF
não se encaixa bem aqui — não há um método cujo comportamento varie por
estado, cada estado já tem seus próprios nomes de método). Em vez disso,
cada estado nomeado vira uma classe dona do que só ela usa
(`Partida`/`Menu`/`GameOver`, ver [jogo.md](jogo.md#fluxo-do-jogo)) — mais
próximo de *procedures aninhadas* (no sentido Pascal) do que de uma state
machine: cada classe é um escopo isolado com suas próprias "locais",
chamada de fora e devolvendo o controle por callback ao terminar, no
mesmo idioma que `Nave.acabaramVidas`/`Explosao.fimDaExplosao`/
`Spritesheet.fimDoCiclo` já usavam.

Consequência prática, não só estética: `Partida` cria `Animacao`/`Teclado`/
`Colisor` **novos a cada rodada** (em vez de reaproveitar instâncias
criadas uma vez no bootstrap) porque só ela os usa. Isso eliminou dois
bugs que existiam quando esse estado era só disciplina manual dentro do
bootstrap: pontuação vazando entre partidas, e `Ovni`/`Tiro` mortos
ficando presos em `colisor.sprites` para sempre (testados a cada frame de
toda partida seguinte). Como cada `Partida` descarta seus próprios
`animacao`/`colisor` por inteiro ao terminar, não sobra sprite fantasma —
não é uma correção pontual, é a causa raiz que deixa de existir.

## Simplicidade sobre performance

- O código prioriza clareza pedagógica sobre eficiência
- Detecção de colisão ([colisor.js](../framework/colisor.js)) ainda é O(n²)
  no número de pares testados — aceitável para um jogo simples com poucos
  sprites em tela — mas não recalcula/realoca retângulos mais: cada
  `static RETANGULOS_COLISAO` (`nave.js`/`ovni.js`/`tiro.js`) é um
  descritor estático por classe, montado uma vez e congelado
  (`Colisor.criarRetangulos()`), com `x`/`y`/`largura`/`altura` como
  função que recebe a instância dona e calcula o valor atual — sem
  alocação por frame. Ver
  [TODO.md](TODO.md#1-colisão-ineficiente-prioridade-alta) para o que
  ainda fica em aberto (broad phase, se a contagem de sprites crescer)
