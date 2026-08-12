'use strict';

const SOM_EXPLOSAO = new Audio();
SOM_EXPLOSAO.src = 'snd/explosao.mp3';
SOM_EXPLOSAO.volume = 0.2;
SOM_EXPLOSAO.load();

class Explosao {
   constructor(context, imagem, x, y) {
      this.context = context;
      this.imagem = imagem;
      this.spritesheet = new Spritesheet(context, imagem, 1, 5);
      this.spritesheet.intervalo = 75;
      this.x = x;
      this.y = y;
      this.animando = false;

      this.fimDaExplosao = null;
      this.spritesheet.fimDoCiclo = () => {
         this.animacao.excluirSprite(this);
         if (this.fimDaExplosao) this.fimDaExplosao();
      };

      const som = SOM_EXPLOSAO.cloneNode();
      som.volume = SOM_EXPLOSAO.volume;
      som.play();
   }

   atualizar() {

   }

   desenhar() {
      this.spritesheet.desenhar(this.x, this.y);
      this.spritesheet.proximoQuadro();
   }
}
