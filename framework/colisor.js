'use strict';

/**
 * Detecção de colisão por interseção de retângulos (AABB), desacoplada dos
 * tipos concretos de sprite: qualquer objeto com retangulosColisao() e
 * colidiuCom(outro) pode participar.
 */
class Colisor {
   constructor() {
      this.sprites = [];
      /**
       * Callback opcional chamado após qualquer colisão detectada:
       * function(sprite1, sprite2, retangulo1, retangulo2). Usado pelo
       * bootstrap para regras que não pertencem a nenhuma das duas entidades
       * (ex.: pontuação ao tiro acertar um ovni). retangulo1/retangulo2 são
       * os descritores (ver retangulosColisao()) que colidiram, um de cada
       * sprite, na mesma ordem — úteis quando a entidade os identifica por
       * `tag` (ver docs/colisao-avancada.md).
       */
      this.aoColidir = null;
      this.spritesExcluir = [];
   }

   /**
    * Registra um sprite para participar da checagem de colisão. O sprite
    * ganha uma referência de volta (this.colisor) e deve expor
    * retangulosColisao() e colidiuCom(outro).
    * @param {{retangulosColisao: function, colidiuCom: function}} sprite
    */
   novoSprite(sprite) {
      this.sprites.push(sprite);
      sprite.colisor = this;
   }

   /**
    * Testa cada par de sprites registrados uma única vez por frame
    * e aplica as exclusões pendentes ao final.
    */
   processar() {
      for (let i = 0; i < this.sprites.length; i++) {
         for (let j = i + 1; j < this.sprites.length; j++) {
            this.testarColisao(this.sprites[i], this.sprites[j]);
         }
      }

      this.processarExclusoes();
   }

   /**
    * Testa todos os retângulos de sprite1 contra os de sprite2; na primeira
    * interseção encontrada, notifica ambos via colidiuCom() e dispara
    * aoColidir(), sem checar os retângulos restantes. Cada colidiuCom()
    * recebe o próprio retângulo que colidiu antes do retângulo do outro
    * sprite — parâmetros extras, opcionais: uma entidade que não precisa
    * saber qual retângulo colidiu pode ter colidiuCom(outro) normalmente.
    * @param {*} sprite1
    * @param {*} sprite2
    */
   testarColisao(sprite1, sprite2) {
      const rets1 = sprite1.retangulosColisao();
      const rets2 = sprite2.retangulosColisao();

      for (const ret1 of rets1) {
         for (const ret2 of rets2) {
            if (this.retangulosColidem(ret1, sprite1, ret2, sprite2)) {
               sprite1.colidiuCom(sprite2, ret1, ret2);
               sprite2.colidiuCom(sprite1, ret2, ret1);

               if (this.aoColidir) this.aoColidir(sprite1, sprite2, ret1, ret2);

               return;
            }
         }
      }
   }

   /**
    * Os retângulos de colisão são descritores estáticos por classe
    * (definidos pelo formato do sprite, não pela instância): x/y/largura/
    * altura são funções que recebem o sprite dono e devolvem o valor
    * calculado para o estado atual dele.
    * @param {{x:function,y:function,largura:function,altura:function}} ret1
    * @param {*} sprite1 dono de ret1
    * @param {{x:function,y:function,largura:function,altura:function}} ret2
    * @param {*} sprite2 dono de ret2
    * @returns {boolean} true se os dois retângulos se sobrepõem
    */
   retangulosColidem(ret1, sprite1, ret2, sprite2) {
      return (ret1.x(sprite1) + ret1.largura(sprite1)) > ret2.x(sprite2) &&
             ret1.x(sprite1) < (ret2.x(sprite2) + ret2.largura(sprite2)) &&
             (ret1.y(sprite1) + ret1.altura(sprite1)) > ret2.y(sprite2) &&
             ret1.y(sprite1) < (ret2.y(sprite2) + ret2.altura(sprite2));
   }

   /**
    * Marca um sprite para remoção diferida (aplicada em
    * processarExclusoes(), ao final do processar() do frame).
    * @param {*} sprite
    */
   excluirSprite(sprite) {
      this.spritesExcluir.push(sprite);
   }

   /**
    * Congela um array de retângulos de colisão e cada retângulo dentro
    * dele — Object.freeze() sozinho é raso e não alcançaria os retângulos.
    * Usado pelas classes de sprite (nave.js, ovni.js, tiro.js) para montar
    * seu descritor estático (static RETANGULOS_COLISAO) uma única vez, na
    * definição da classe.
    * @param {Array<{x:function,y:function,largura:function,altura:function}>} retangulos
    * @returns {Array} o mesmo array, congelado
    */
   static criarRetangulos(retangulos) {
      return Object.freeze(retangulos.map(Object.freeze));
   }

   /** Aplica as exclusões de sprite pendentes. */
   processarExclusoes() {
      const novoArray = [];

      for (const i in this.sprites) {
         if (this.spritesExcluir.indexOf(this.sprites[i]) == -1)
            novoArray.push(this.sprites[i]);
      }

      this.spritesExcluir = [];

      this.sprites = novoArray;
   }
}
