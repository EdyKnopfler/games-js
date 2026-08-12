'use strict';

/** Estado "game over": tela de fim de jogo + botão "Jogar" visível. */
class GameOver {
   /**
    * @param {HTMLCanvasElement} canvas
    * @param {CanvasRenderingContext2D} context
    * @param {BotaoJogar} botaoJogar
    */
   constructor(canvas, context, botaoJogar) {
      this.canvas = canvas;
      this.context = context;
      this.botaoJogar = botaoJogar;
   }

   /** Entra no estado game over: desenha a tela e mostra o botão. */
   mostrar(imgEspaco) {
      const context = this.context;

      context.drawImage(imgEspaco, 0, 0, this.canvas.width,
                        this.canvas.height);

      context.save();
      context.fillStyle = 'white';
      context.strokeStyle = 'black';
      context.font = '70px sans-serif';
      context.fillText("GAME OVER", 40, 200);
      context.strokeText("GAME OVER", 40, 200);
      context.restore();

      this.botaoJogar.mostrar();
   }
}
