# Colisão avançada: retângulos com tag e condicionais por estado

Exercício de modelagem para um caso que o jogo de nave não tem: colisão
cujo resultado depende de *qual parte* de cada sprite se tocou. A
plumbing no framework ([colisor.js](../framework/colisor.js)) já existe;
os exemplos (Mario/Goomba, soco de lutador) continuam sem uso no jogo
atual — referência para quando o framework for reaproveitado num jogo que
precise disso.

## O problema, comparado ao jogo atual

Hoje todo par de colisão (`Nave`↔`Ovni`, `Ovni`↔`Tiro`) tem um resultado
só, não importa qual retângulo se tocou — os 3 retângulos de cada um são
só silhueta aproximada, intercambiáveis.

`Mario`↔`Goomba` é diferente: o mesmo par de tipos tem dois resultados
opostos, dependendo de *qual parte* se tocou:
- pé no Goomba → Goomba morre.
- corpo no Goomba (lateral ou por baixo) → Mario se fere.

O contrato atual não expressa isso: `colidiuCom(outro)`
([decisoes-de-projeto.md](decisoes-de-projeto.md#padrão-de-entidade-contrato-implícito))
recebe só o sprite `outro`, nunca *qual* retângulo colidiu. Dá pra inferir
por geometria (overlap em X/Y, técnica MTV — seção final), mas é
heurística, com falso positivo em toques de quina. Mais direto: o
`Colisor` reportar qual retângulo colidiu, via tag — a entidade decide por
identidade, não por inferência.

## Extensão implementada: `colidiuCom`/`aoColidir` recebem o par de retângulos

`testarColisao()` ([colisor.js](../framework/colisor.js)) já repassa,
além dos sprites, os dois retângulos que colidiram — meu retângulo
primeiro, o do outro depois, mesma ordem em que cada lado recebe `outro`.
Retângulo aceita um campo opcional `tag` (string livre, sem significado
pro `Colisor` — só congelada junto pelo `Colisor.criarRetangulos()`
existente).

Por quê não quebrou `Nave`/`Ovni`/`Tiro`, que não usam nada disso: JS
ignora argumentos extras não declarados, então `colidiuCom(outro)` (sem
pegar `ret1`/`ret2`) e `Partida.aoColidir = (o1, o2) => ...` continuam
funcionando idênticos. `retangulosColidem()` não mudou — só geometria,
`tag` nunca entra na comparação, mesmo custo O(n²) de sempre (TODO item
1).

## Mario/Goomba modelado com tags

```js
class Mario {
   static RETANGULOS_COLISAO = Colisor.criarRetangulos([
      // faixa fina na base — só os pés
      {tag: 'pes',   x: (m) => m.x + 4, y: (m) => m.y + ALTURA_MARIO - 6,
                     largura: () => LARGURA_MARIO - 8, altura: () => 6},
      // resto do corpo, sem sobrepor a faixa dos pés
      {tag: 'corpo', x: (m) => m.x, y: (m) => m.y,
                     largura: () => LARGURA_MARIO, altura: () => ALTURA_MARIO - 6}
   ]);

   colidiuCom(outro, meuRetangulo, retangDeOutro) {
      if (outro instanceof Goomba) {
         if (meuRetangulo.tag === 'pes') {
            this.animacao.excluirSprite(outro);
            this.colisor.excluirSprite(outro);
            this.vy = -VELOCIDADE_QUIQUE; // bounce, física do próprio Mario
         } else {
            this.levarDano(outro); // mesmo idioma de Nave.colidiuCom(Ovni)
         }
      }
   }
}
```

`Goomba.colidiuCom` não precisa reagir ao Mario — mesmo padrão de
`Ovni.colidiuCom`, que só reage a `Tiro`.

Mais direto que MTV: sem ambiguidade de quina, porque decide por
identidade, não por inferência de overlap. Custo: desenhar pés e corpo
como regiões sem sobreposição (relevante na próxima seção).

## Segundo exemplo: o soco de um lutador

Outro caso: o soco num jogo de luta. Parado ou andando, só o corpo colide.
Nos quadros do soco, um retângulo extra aparece sob a mão — só ele causa
dano, e só nesses quadros. Mesmo problema do Mario (resultado depende de
qual parte tocou), mais uma dimensão: o retângulo às vezes nem existe.

Sem mexer no `Colisor`: `retangulosColisao()` já é **método de instância**
em `Nave`/`Ovni`/`Tiro`
([nave.js](../jogo/nave.js), [ovni.js](../jogo/ovni.js)), não acesso
direto a um campo estático — hoje só faz `return X.RETANGULOS_COLISAO`,
mas o desenho permite a instância escolher, a cada chamada, qual conjunto
estático devolver conforme o próprio estado. Sem realocar nada por frame,
só trocar a referência.

```js
class Lutador {
   static RETANGULOS_PARADO = Colisor.criarRetangulos([
      {tag: 'corpo', x: (l) => l.x, y: (l) => l.y,
                     largura: () => LARGURA_LUTADOR, altura: () => ALTURA_LUTADOR}
   ]);

   static RETANGULOS_SOCO = Colisor.criarRetangulos([
      {tag: 'corpo', x: (l) => l.x, y: (l) => l.y,
                     largura: () => LARGURA_LUTADOR, altura: () => ALTURA_LUTADOR},
      {tag: 'mao',   x: (l) => l.x + offsetSoco(l), y: (l) => l.y + ALTURA_LUTADOR / 2,
                     largura: () => LARGURA_SOCO, altura: () => ALTURA_SOCO}
   ]);

   retangulosColisao() {
      return this.socando ? Lutador.RETANGULOS_SOCO : Lutador.RETANGULOS_PARADO;
   }

   colidiuCom(outro, meuRetangulo, retangDeOutro) {
      if (outro instanceof Lutador &&
            meuRetangulo.tag === 'mao' && retangDeOutro.tag === 'corpo') {
         outro.levarGolpe(this.danoSoco);
      }
   }
}
```

Fora de `RETANGULOS_SOCO`, `'mao'` simplesmente não está no array — sem
retângulo "escondido" degenerado, sem risco de falso positivo por tamanho
zero. Cada conjunto continua congelado uma vez só
([decisoes-de-projeto.md](decisoes-de-projeto.md#simplicidade-sobre-performance));
só a referência devolvida muda por chamada.

**Essa parte (múltiplos conjuntos por estado) não precisou de extensão**
— é usar o contrato como já estava desenhado. A extensão de verdade (já
implementada) é a tag + `colidiuCom`/`aoColidir` recebendo qual retângulo
colidiu.

**Atenção:** ordem no array importa quando as tags têm papéis diferentes.
`testarColisao()` para no primeiro par que colide — irrelevante hoje
porque os 3 retângulos de `Nave`/`Ovni` são equivalentes, mas em
`RETANGULOS_SOCO`, se `'mao'` e `'corpo'` puderem sobrepor o mesmo alvo no
mesmo frame, só o primeiro par (ordem de declaração) é reportado. Evite
sobreposição entre retângulos do mesmo sprite (como pés/corpo do Mario);
quando não der, coloque a tag mais específica primeiro.

## Alternativa sem extensão: heurística MTV

Sem estender o `Colisor`: aproximar "pisão vs. dano" comparando overlap em
X e Y dentro do próprio `colidiuCom(outro)` — útil quando não compensa uma
hitbox dedicada (ex.: inimigo pequeno demais pra ter uma faixa de pés com
folga). Fallback, não abordagem principal — tag é mais simples de
raciocinar e não custa mais nada.

```js
pisouEm(goomba) { // só se não valer a pena ter retângulo 'pes' dedicado
   const overlapX = Math.min(this.x + this.largura, goomba.x + goomba.largura)
                   - Math.max(this.x, goomba.x);
   const overlapY = Math.min(this.y + this.altura, goomba.y + goomba.altura)
                   - Math.max(this.y, goomba.y);

   return overlapY < overlapX && this.y < goomba.y;
}
```

## Pontuação

Mesma decisão de [decisoes-de-projeto.md](decisoes-de-projeto.md):
pontuação entra via `aoColidir` (equivalente a `Partida.aoColidir`), não
em `Mario`/`Goomba`. Com a extensão, o callback já recebe `ret1`/`ret2` —
dá pra checar `ret1.tag === 'pes'` sem `Mario` expor nada a mais.

## Resumo

| | Sem tag nos retângulos | Com tag nos retângulos |
|---|---|---|
| Detecção do "lado" | heurística geométrica (MTV), aproximada | identidade do retângulo, exata |
| Mudança no `Colisor` | nenhuma (já implementada, não usada) | nenhuma — só usar `ret1`/`ret2` já disponíveis em `colidiuCom`/`aoColidir` |
| Risco pro jogo atual | zero | zero (args extras ignorados por quem não pede) |
| Generaliza pro soco do lutador | não (MTV não faz sentido pra hitbox de animação) | sim — mesmo mecanismo, tag muda por quadro |
