# Colisão avançada: retângulos com tag e condicionais por estado

Contrato atual: um retângulo de colisão pode ter uma tag opcional
(`retangulosColisao()`); `colidiuCom(outro, meuRetangulo, retangDeOutro)`
e `aoColidir(sprite1, sprite2, ret1, ret2)`
([colisor.js](../framework/colisor.js)) recebem os dois retângulos que
colidiram, meu retângulo primeiro. Nenhuma entidade do jogo de nave usa
isso — `Nave`/`Ovni`/`Tiro` não declaram tag e ignoram os parâmetros
extras (`colidiuCom(outro)` de um argumento só continua válido). Este doc
mostra como usar quando o framework for reaproveitado num jogo que
precise de resultado por parte tocada: Mario pulando num Goomba, o soco de
um lutador.

## Quando isso é necessário

`Nave`↔`Ovni`, `Ovni`↔`Tiro`: um resultado só por par, não importa qual
retângulo se tocou — os 3 retângulos de cada um são só silhueta
aproximada, intercambiáveis, por isso não usam tag.

`Mario`↔`Goomba` precisa de dois resultados opostos pro mesmo par de
tipos, dependendo de *qual parte* se tocou:
- pé no Goomba → Goomba morre.
- corpo no Goomba (lateral ou por baixo) → Mario se fere.

A tag resolve isso por identidade: a entidade lê `meuRetangulo.tag` e
decide. A alternativa sem tag (inferir o lado por geometria, MTV — seção
mais abaixo) é heurística, com falso positivo possível em toques de
quina.

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

Decide por identidade do retângulo, não por inferência de overlap — sem
ambiguidade de quina. Custo: desenhar pés e corpo como regiões sem
sobreposição (relevante na próxima seção).

## Segundo exemplo: o soco de um lutador

Outro caso: o soco num jogo de luta. Parado ou andando, só o corpo colide.
Nos quadros do soco, um retângulo extra aparece sob a mão — só ele causa
dano, e só nesses quadros. Mesmo problema do Mario (resultado depende de
qual parte tocou), mais uma dimensão: o retângulo às vezes nem existe.

`retangulosColisao()` é **método de instância** em `Nave`/`Ovni`/`Tiro`
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

Retângulos condicionais por estado e tag são mecanismos independentes: o
primeiro é só `retangulosColisao()` escolhendo qual conjunto devolver; o
segundo é o campo `tag` sendo lido em `colidiuCom`. Usados juntos no
exemplo acima, mas nada impede usar um sem o outro.

**Atenção:** ordem no array importa quando as tags têm papéis diferentes.
`testarColisao()` para no primeiro par que colide — irrelevante hoje
porque os 3 retângulos de `Nave`/`Ovni` são equivalentes, mas em
`RETANGULOS_SOCO`, se `'mao'` e `'corpo'` puderem sobrepor o mesmo alvo no
mesmo frame, só o primeiro par (ordem de declaração) é reportado. Evite
sobreposição entre retângulos do mesmo sprite (como pés/corpo do Mario);
quando não der, coloque a tag mais específica primeiro.

## Alternativa sem tag: heurística de overlap mínimo (MTV)

Quando não compensa desenhar uma hitbox dedicada (ex.: inimigo pequeno
demais pra ter uma faixa de pés com folga), dá pra aproximar "pisão vs.
dano" comparando overlap em X e Y dentro do próprio `colidiuCom(outro)`,
sem usar tag nenhuma:

```js
pisouEm(goomba) { // só se não valer a pena ter retângulo 'pes' dedicado
   const overlapX = Math.min(this.x + this.largura, goomba.x + goomba.largura)
                   - Math.max(this.x, goomba.x);
   const overlapY = Math.min(this.y + this.altura, goomba.y + goomba.altura)
                   - Math.max(this.y, goomba.y);

   return overlapY < overlapX && this.y < goomba.y;
}
```

Heurística, não a abordagem principal — tag é mais simples de raciocinar
(identidade em vez de inferência) e não custa nada a mais.

## Pontuação

Mesma decisão de [decisoes-de-projeto.md](decisoes-de-projeto.md):
pontuação entra via `aoColidir` (equivalente a `Partida.aoColidir`), não
em `Mario`/`Goomba`. O callback recebe `ret1`/`ret2` — dá pra checar
`ret1.tag === 'pes'` sem `Mario` expor nada a mais.

## Resumo

| | MTV (sem tag) | Tag no retângulo |
|---|---|---|
| Detecção do "lado" | heurística geométrica, aproximada — falso positivo em quina | identidade do retângulo, exata |
| Precisa de hitbox dedicada | não | sim — regiões sem sobreposição, ou tag mais específica primeiro no array |
| Generaliza pro soco do lutador | não (MTV não faz sentido pra hitbox de animação) | sim — mesmo mecanismo, tag muda por quadro |
