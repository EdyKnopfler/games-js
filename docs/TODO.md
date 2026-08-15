# TODO — débitos técnicos para o rework

Ordenado por prioridade. Cada item tem o problema, onde está, e um esboço de
encaminhamento (a decidir em conjunto antes de implementar).

## 1. Colisão ineficiente (prioridade alta) — resolvido em parte

**[colisor.js](../framework/colisor.js)** — `Colisor.processar()`.

O que foi feito:
- `processar()` trocou o duplo `for...in` + dedupe via string
  (`stringUnica`/`jaTestados`) por `for (i=0) for (j=i+1)` direto — cada
  par é testado exatamente uma vez, sem estrutura de dedupe nenhuma.
- `retangulosColisao()` (`nave.js`/`ovni.js`/`tiro.js`) não recalcula nem
  aloca mais nada por chamada: cada `static RETANGULOS_COLISAO` é um
  descritor estático por classe (`x`/`y`/`largura`/`altura` como função que
  recebe a instância dona), montado uma vez na definição da classe via
  `Colisor.criarRetangulos()` (método estático em `colisor.js`, que só
  congela o array e cada retângulo dentro dele). Antes, cada chamada de
  `retangulosColisao()` fazia um `.map()` alocando array+objetos novos —
  e isso acontecia ~`3n(n-1)` vezes por frame por causa do dedupe caro.
- `retangulosColidem()` agora recebe o sprite dono junto de cada
  retângulo, pra poder chamar `ret.x(sprite)` etc.

O que ainda fica em aberto:
- A contagem de pares testados continua O(n²) — não há *broad phase*
  (grid espacial ou ordenação por eixo) antes do teste fino de
  retângulos. Não há sinal de que isso custe frame hoje (poucos sprites
  em tela); só vale a pena se a contagem de inimigos crescer bastante no
  rework.

## 2. Sem módulos / build

Problema:
- Todo o código depende da ordem manual das tags `<script>` em
  [index.html](../index.html)
- Tudo roda no mesmo escopo global léxico, compartilhado entre os
  `<script>` clássicos (sem `type="module"`)
- Não há bundler, não há `import`/`export`

Encaminhamento a discutir:
- Migrar para ES modules nativos (`<script type="module">` +
  `import`/`export`)
- Tornaria as dependências entre arquivos explícitas em vez de implícitas
  na ordem das tags

## 3. Valores mágicos hardcoded (parcial)

Já centralizado como constante nomeada:
- Dimensões da nave (36×48) → `LARGURA_NAVE`/`ALTURA_NAVE`
  ([nave.js](../jogo/nave.js))
- Offsets dos retângulos de colisão → `Nave.RETANGULOS_COLISAO`
  ([nave.js](../jogo/nave.js)), `Ovni.RETANGULOS_COLISAO`
  ([ovni.js](../jogo/ovni.js))

Segue hardcoded:
- Tamanho do canvas (500×500), em [index.html](../index.html) — sem
  duplicação hoje, então sem risco de dessincronia
- Nenhum valor acima deriva das imagens reais carregadas

Encaminhamento: baixa prioridade — se incomodar no futuro, derivar de
`imagem.width`/`imagem.height`.

## 4. Zero testes automatizados

Problema:
- Sem testes para as regras de jogo (colisão, vidas, pontuação)
- Qualquer rework corre risco de regressão silenciosa

Encaminhamento:
- Testes unitários para `Colisor` (item 1, a lógica mais arriscada de mexer)
- Testes para as transições de estado do jogo (vidas, game over)

## 5. Falta de metadados de projeto

- Já existe: `README.md`
- Falta: `package.json`, `.gitignore`
- Necessário se o rework introduzir ferramentas (bundler, testes, lint)

## 6. Pool de objetos para `Ovni`/`Tiro` (prioridade baixa)

Problema:
- `Ovni` ([ovni.js](../jogo/ovni.js)) e `Tiro` ([tiro.js](../jogo/tiro.js))
  são criados e destruídos o tempo todo durante uma partida (`Ovni` a cada
  1000ms via `CriadorInimigos`, `Tiro` a cada disparo) — candidatos naturais
  a pool de objetos, reaproveitando instâncias em vez de `new`/GC a cada vez

Por que está em prioridade baixa, não descartado:
- Volume de criação é baixo (poucos objetos por segundo) — não há sinal
  (nem perfil) de que o GC esteja custando frame. O gargalo real de
  performance do jogo é outro, já mapeado no item 1
- Pool troca disciplina por performance: cada objeto reaproveitado precisa
  de um `reiniciar(...)` que cubra **todo** campo que `atualizar()`/
  `desenhar()`/`colidiuCom()` dependem, ou sobra estado velho de um uso
  anterior — é exatamente a classe de bug que `Partida`
  ([partida.js](../jogo/partida.js)) eliminou *por construção*, ao
  descartar `animacao`/`colisor` inteiros a cada partida em vez de reciclar
  (ver [decisoes-de-projeto.md](decisoes-de-projeto.md#estados-de-nível-superior-como-classes-não-como-máquina-de-estados-formal)).
  Pool reintroduziria esse risco, um nível abaixo, por uma vantagem de
  performance que hoje não é necessária

Encaminhamento a discutir, se algum dia a contagem de inimigos em tela
crescer o suficiente para justificar:
- `Ovni`/`Tiro` ganhariam um `reiniciar(...)` simétrico ao construtor
  (mesma ideia de `CriadorInimigos.reiniciar()`, já existente)
- O pool seria dono único do "obter" (ponto único de verdade, evitando dois
  lugares reaproveitando o mesmo slot) — provavelmente vivendo dentro da
  própria `Partida`, já dona do ciclo de vida de uma rodada

## 7. Refactor dos retângulos de colisão — resolvido

Ficou mais eficiente (item 1), mas o jeito de montar `congelarArray(...)`
como `const` solta no topo do módulo, longe da classe, estava confuso.

Cogitado e descartado: reduzir a constante de cada sprite a só valores
brutos (offset x/y + largura/altura fixos) e gerar as closures num método
genérico. Não fecha para todo caso — o retângulo do `Tiro`
([tiro.js](../jogo/tiro.js)) não é offset+tamanho fixo, é o próprio
retângulo do sprite (`x: i => i.x`, `largura: i => i.largura`), então
teria que virar caso especial de qualquer forma. Generalizar a forma do
dado teria trocado "confuso" por "confuso de outro jeito", sem ganho real.
Cogitado e descartado também: uma classe `RetanguloColisao` — os
retângulos não têm estado próprio, só dado; criar uma classe por isso
proliferaria classes sem necessidade.

O que foi feito, então: manter as closures como estão (cada caso — offset
fixo ou espelhando o sprite — continua explícito ali, sem indireção nova),
só mudando *onde* e *como* o array nasce congelado:
- `congelarArray()` virou `static Colisor.criarRetangulos()`
  ([colisor.js](../framework/colisor.js)) — mesma lógica (`Object.freeze`
  do array e de cada retângulo), só relocada para o método do `Colisor`
  que é dono do contrato, em vez de função solta.
- Cada `RETANGULOS_COLISAO_*` module-level virou `static RETANGULOS_COLISAO`
  dentro da própria classe do sprite (`Nave`/`Ovni`/`Tiro`), inicializado
  chamando `Colisor.criarRetangulos([...])` — descritor nasce junto da
  classe dona, não antes dela no arquivo.
