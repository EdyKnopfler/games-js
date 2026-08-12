'use strict';

class Painel {
   constructor(context, nave) {
      this.context = context;
      this.nave = nave;
      this.spritesheet = new Spritesheet(context, nave.imagem, 3, 2);
      this.pontuacao = 0;
   }

   atualizar() {

   }

   desenhar() {
      this.context.scale(0.5, 0.5);

      let x = 20;
      const y = 20;

      for (let i = 1; i <= this.nave.vidasExtras; i++) {
         this.spritesheet.desenhar(x, y);
         x += 40;
      }

      this.context.scale(2, 2);

      const ctx = this.context;

      ctx.save();
      ctx.fillStyle = 'white';
      ctx.font = '18px sans-serif';
      ctx.fillText(this.pontuacao, 100, 27);
      ctx.restore();
   }
}
