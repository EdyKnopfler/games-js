'use strict';

const SOM_TIRO = new Audio();
SOM_TIRO.src = 'snd/tiro.mp3';
SOM_TIRO.volume = 0.2;
SOM_TIRO.load();

const RETANGULOS_COLISAO_TIRO = congelarArray([
   {x: i => i.x, y: i => i.y, largura: i => i.largura, altura: i => i.altura}
]);

class Tiro {
   constructor(context, nave) {
      this.context = context;
      this.nave = nave;

      // Posicionar o tiro no bico da nave
      this.largura = 3;
      this.altura = 10;
      this.x = nave.x + LARGURA_NAVE / 2;
      this.y = nave.y - this.altura;
      this.velocidade = 400;

      this.cor = 'yellow';

      const som = SOM_TIRO.cloneNode();
      som.volume = SOM_TIRO.volume;
      som.play();
   }

   atualizar() {
      this.y -=
         this.velocidade * this.animacao.decorrido / 1000;

      if (this.y < -this.altura) {
         this.animacao.excluirSprite(this);
         this.colisor.excluirSprite(this);
      }
   }

   desenhar() {
      const ctx = this.context;
      ctx.save();
      ctx.fillStyle = this.cor;
      ctx.fillRect(this.x, this.y, this.largura, this.altura);
      ctx.restore();
   }

   retangulosColisao() {
      return RETANGULOS_COLISAO_TIRO;
   }

   colidiuCom(outro) {

   }
}
