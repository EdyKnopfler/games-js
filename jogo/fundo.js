'use strict';

class Fundo {
   constructor(context, imagem) {
      this.context = context;
      this.imagem = imagem;
      this.velocidade = 0;
      this.posicaoEmenda = 0;
   }

   atualizar() {
      this.posicaoEmenda +=
         this.velocidade * this.animacao.decorrido / 1000;

      if (this.posicaoEmenda > this.imagem.height)
         this.posicaoEmenda = 0;
   }

   desenhar() {
      const img = this.imagem;

      // Primeira cópia
      let posicaoY = this.posicaoEmenda - img.height;
      this.context.drawImage(img, 0, posicaoY, img.width, img.height);

      // Segunda cópia
      posicaoY = this.posicaoEmenda;
      this.context.drawImage(img, 0, posicaoY, img.width, img.height);
   }
}
