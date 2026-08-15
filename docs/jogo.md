# Jogo (entidades e fluxo específicos)

## Entidades

### Nave — [nave.js](../jogo/nave.js)

Controlada pelo jogador via `Teclado`. Movimento em 4 direções, limitado aos
limites do canvas (checagem manual de `x`/`y` a cada tecla, não um clamp
único). Usa `Spritesheet` (3 linhas × 2 colunas) para trocar de "pose"
conforme a direção (reta / virando esquerda / virando direita).

- `atirar()` — cria um `Tiro` e o registra em `animacao` e `colisor`; limitado
  por `cadenciaTiro` (intervalo mínimo em ms entre tiros, mesmo padrão de
  timestamp de `Spritesheet.proximoQuadro()`).
- `retangulosColisao()` — 3 retângulos aproximando o formato da nave
  (comentário no código já avisa: "estes valores vão sendo ajustados aos
  poucos" — são valores calibrados manualmente, não derivados da imagem).
- `colidiuCom(outro)` — se `outro` é `Ovni`: remove nave e ovni do jogo,
  cria duas `Explosao`, e só decide o que fazer (perder vida / reposicionar
  vs. acabar o jogo) no callback `fimDaExplosao`, para a explosão dar tempo
  de animar antes da nave reaparecer.
- `vidasExtras` — contador de vidas; `acabaramVidas` é um callback setado
  externamente (por `Partida`) para disparar o fim da partida. `perdeuVida`
  é outro callback externo, disparado em toda vida perdida (inclusive a
  última) — `Partida` o usa para acionar `CriadorInimigos.aoPerderVida()`.

### Ovni — [ovni.js](../jogo/ovni.js)

Inimigo.
- Desce em linha reta (`y += velocidade * decorrido / 1000`), autodestrói
  ao sair da tela por baixo
- Ao colidir com `Tiro`: remove os dois, cria uma `Explosao`
- Não custa vida — quem decide pontuação é `colisor.aoColidir`, setado por
  `Partida`, não o `Ovni`

### Tiro — [tiro.js](../jogo/tiro.js)

Retângulo amarelo simples (não usa sprite/imagem).
- Sobe a partir do bico da nave, autodestrói ao sair da tela por cima
- A cada disparo, clona `SOM_TIRO` (`cloneNode()`) e toca a cópia — disparos
  rápidos não cortam o som um do outro, já que cada clone é independente

### Explosao — [explosao.js](../jogo/explosao.js)

Efeito visual + sonoro (spritesheet 1×5, `SOM_EXPLOSAO`). Não participa de
colisão.
- Ao terminar o ciclo de animação (`fimDoCiclo` do `Spritesheet`):
  autorremove de `animacao`, dispara `fimDaExplosao`
- `fimDaExplosao` é o callback que `Nave.colidiuCom` usa para decidir se o
  jogo acaba ou a nave renasce

### Fundo — [fundo.js](../jogo/fundo.js)

Camada de parallax (ver técnica em
[decisoes-de-projeto.md](decisoes-de-projeto.md#scroll-de-fundo-em-loop-parallax)).
O jogo usa 3 instâncias (`espaco`, `estrelas`, `nuvens`) com velocidades
diferentes para dar sensação de profundidade.

### Painel — [painel.js](../jogo/painel.js)

HUD: desenha um ícone da nave por vida restante (reaproveitando a spritesheet
da nave, primeiro quadro, sem animar) e o texto da pontuação.

### CriadorInimigos — [criador-inimigos.js](../jogo/criador-inimigos.js)

Sistema de processamento (mesmo contrato de `Colisor`, registrado via
`animacao.novoProcessamento()`), não é uma entidade desenhável.
- Cria um `Ovni` por vez, no ritmo de `intervaloAtual()` — cai linearmente
  de `INTERVALO_CRIACAO_OVNI_INICIAL` a `INTERVALO_CRIACAO_OVNI_MINIMO` ao
  longo de `TEMPO_RAMPA_DIFICULDADE`. `tempoJogado` só avança com a
  animação ligada, então pausar não conta como progresso de dificuldade.
- Velocidade do `Ovni` sorteada dentro de uma janela rolante
  (`inicioJanelaVelocidade()`, largura `LARGURA_JANELA_VELOCIDADE` = 1/5 da
  faixa `VELOCIDADE_MIN_OVNI`–`VELOCIDADE_MAX_OVNI`) que desliza de
  `[MIN, MIN+largura]` a `[MAX-largura, MAX]` ao longo de
  `TEMPO_RAMPA_DIFICULDADE`, conforme `tempoDesdeUltimaVida`.
- `reiniciar()` zera só a contagem até o próximo ovni, não `tempoJogado` —
  evita "explodir" vários ovnis de uma vez ao retomar de uma pausa longa.
- `aoPerderVida()` (via `Nave.perdeuVida`) reage a cada vida perdida: recua
  `RECUO_JANELA_AO_PERDER_VIDA` de `tempoJogado` (recuo fixo, mas como
  `intervaloAtual()` é linear, o respiro já sai maior cedo e menor tarde,
  sem função de recuo variável) e zera `tempoDesdeUltimaVida` (janela de
  velocidade volta ao início).

## Fluxo do jogo

O fluxo de nível superior tem 4 momentos — carregamento, menu, jogando,
game over — e cada um vira uma classe própria, dona do que só ela usa.
Não é uma máquina de estados formal (não há um campo "estado atual" nem
despacho polimórfico): é mais próximo de *procedures aninhadas* — cada
classe é um escopo isolado com suas próprias "locais"
(`this.nave`/`this.animacao`/...), chamada a partir de fora e devolvendo o
controle por callback quando termina, no mesmo idioma que o projeto já usa
em `Nave.acabaramVidas`/`Explosao.fimDaExplosao`/`Spritesheet.fimDoCiclo`.

### JogoNave — [jogo-nave.js](../jogo/jogo-nave.js)

Só carregamento + transição entre estados. Não referencia `Animacao`,
`Colisor`, `Teclado` nem nenhuma entidade de jogo — só `CarregadorAssets`,
`BotaoJogar`, `Menu`, `GameOver` e `Partida`. `index.html` instancia
`JogoNave(canvas, elementoLinkJogar)` e chama `iniciar()`.

1. **iniciar()** dispara `carregarImagens()`/`carregarMusicas()`, que usam
   `CarregadorAssets` (ver [framework.md](framework.md)) e delegam o
   desenho de progresso/erro para `Menu`. Ao completar, `Menu.mostrar()`
   entra no estado menu.
2. **iniciarJogo()** (clique no link "Jogar", via `addEventListener` em
   `index.html`): esconde o botão e cria uma `Partida` nova, passando um
   callback `jogoEncerrado`.
3. **encerrarJogo()** — é o `jogoEncerrado` que `Partida` chama sozinha
   quando decide que a rodada acabou: solta a referência à partida e
   delega a `GameOver.mostrar()`.

### Partida — [partida.js](../jogo/partida.js)

Uma rodada completa e autocontida. Cria (e é dona de) `nave`, `painel`,
`criadorInimigos`, os 3 `Fundo`s — e também `Animacao`, `Teclado` e
`Colisor` **novos a cada partida**, não reaproveitados de uma rodada pra
outra. Consequência importante: como tudo nasce do zero a cada partida,
não existe "resetar pela metade" (pontuação, vidas, contagem de inimigos
já começam certos) e não sobra sprite de uma partida anterior registrado
em `animacao`/`colisor` — eles são descartados por inteiro no fim.

- Construtor: monta tudo, liga `nave.acabaramVidas` (chama `encerrar()` e
  o callback `jogoEncerrado`) e `colisor.aoColidir` (pontuação), liga tiro
  (tecla espaço) e pausa (Enter), toca a música, liga a animação.
- `pausar()`: alterna `animacao.ligar()/desligar()`, desativa/ativa o
  disparo, desenha "Pausado" por cima do último frame. Ao retomar, chama
  `criadorInimigos.reiniciar()`. "Jogando" e "pausado" continuam sendo a
  mesma sequência de eventos, não um estado formal — quem controla isso é
  `animacao.ligado`.
- `encerrar()`: desliga tudo que a partida ligou (`teclado.remover()` —
  ver [framework.md](framework.md) — música, `animacao.desligar()`). Não
  precisa varrer `Ovni`/`Tiro` residual: `animacao`/`colisor` inteiros
  somem junto com o objeto.

### Menu / GameOver / BotaoJogar

Telas estáticas — sem mecânica de jogo, só desenho + o botão "Jogar".

- **[menu.js](../jogo/menu.js)** — `mostrar()` desenha o fundo parado e
  mostra o botão (entrada do estado menu); `desenharCarregando()`/
  `desenharFalha()` cobrem as telas do período de carregamento, antes de
  qualquer `Partida` existir.
- **[game-over.js](../jogo/game-over.js)** — `mostrar()` desenha o texto
  "GAME OVER" sobre o fundo e mostra o botão.
- **[botao-jogar.js](../jogo/botao-jogar.js)** — o link "Jogar" em si
  (`mostrar()`/`esconder()`). Não pertence a `Menu` nem a `GameOver` —
  os dois mostram o mesmo botão, então é um recurso injetado nos dois em
  vez de duplicado ou possuído por um só.
