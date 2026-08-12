'use strict';

/**
 * Estado "menu": fundo parado + botão "Jogar" visível. Também cobre as
 * telas do período de carregamento (antes de qualquer Partida existir).
 */
class Menu {
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

   /** Entra no estado menu: desenha o fundo parado e mostra o botão. */
   mostrar(imgEspaco) {
      this.context.drawImage(imgEspaco, 0, 0, this.canvas.width,
                             this.canvas.height);
      this.botaoJogar.mostrar();
   }

   desenharCarregando(carregadas, total, imgEspaco) {
      const context = this.context;

      context.save();

      context.drawImage(imgEspaco, 0, 0, this.canvas.width,
                        this.canvas.height);

      context.fillStyle = 'white';
      context.strokeStyle = 'black';
      context.font = '50px sans-serif';
      context.fillText("Carregando...", 100, 200);
      context.strokeText("Carregando...", 100, 200);

      const tamanhoTotal = 300;
      const tamanho = carregadas / total * tamanhoTotal;
      context.fillStyle = 'yellow';
      context.fillRect(100, 250, tamanho, 50);

      context.restore();
   }

   desenharFalha(nomeArquivo) {
      const context = this.context;

      context.save();
      context.fillStyle = 'black';
      context.fillRect(0, 0, this.canvas.width, this.canvas.height);
      context.fillStyle = 'red';
      context.strokeStyle = 'black';
      context.font = '24px sans-serif';
      context.fillText('Falha ao carregar ' + nomeArquivo, 20, 200);
      context.strokeText('Falha ao carregar ' + nomeArquivo, 20, 200);
      context.restore();
   }
}
