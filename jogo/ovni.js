'use strict';

const RETANGULOS_COLISAO_OVNI = congelarArray([
   {x: i => i.x + 20, y: i => i.y + 1,  largura: () => 25, altura: () => 10},
   {x: i => i.x + 2,  y: i => i.y + 11, largura: () => 60, altura: () => 12},
   {x: i => i.x + 20, y: i => i.y + 23, largura: () => 25, altura: () => 7}
]);

class Ovni {
   constructor(context, imagem, imgExplosao) {
      this.context = context;
      this.imagem = imagem;
      this.x = 0;
      this.y = 0;
      this.velocidade = 0;
      this.imgExplosao = imgExplosao;
   }

   atualizar() {
      this.y +=
         this.velocidade * this.animacao.decorrido / 1000;

      if (this.y > this.context.canvas.height) {
         this.animacao.excluirSprite(this);
         this.colisor.excluirSprite(this);
      }
   }

   desenhar() {
      const ctx = this.context;
      const img = this.imagem;
      ctx.drawImage(img, this.x, this.y, img.width, img.height);
   }

   retangulosColisao() {
      return RETANGULOS_COLISAO_OVNI;
   }

   colidiuCom(outro) {
      if (outro instanceof Tiro) {
         this.animacao.excluirSprite(this);
         this.colisor.excluirSprite(this);
         this.animacao.excluirSprite(outro);
         this.colisor.excluirSprite(outro);

         const explosao = new Explosao(this.context, this.imgExplosao,
                                     this.x, this.y);
         this.animacao.novoSprite(explosao);
      }
   }
}
