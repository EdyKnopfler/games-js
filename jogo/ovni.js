'use strict';

class Ovni {
   static RETANGULOS_COLISAO = Colisor.criarRetangulos([
      {x: (ovni) => ovni.x + 20, y: (ovni) => ovni.y + 1,  largura: () => 25, altura: () => 10},
      {x: (ovni) => ovni.x + 2,  y: (ovni) => ovni.y + 11, largura: () => 60, altura: () => 12},
      {x: (ovni) => ovni.x + 20, y: (ovni) => ovni.y + 23, largura: () => 25, altura: () => 7}
   ]);

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
      return Ovni.RETANGULOS_COLISAO;
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
