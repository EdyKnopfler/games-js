'use strict';

/**
 * Animação por quadros a partir de uma grade linhas x colunas numa única
 * imagem. `linha` seleciona a "animação" (ex. nave reta/virando esquerda/
 * virando direita são linhas diferentes da mesma spritesheet); `coluna`
 * avança sozinha ao longo do tempo via proximoQuadro().
 */
class Spritesheet {
   /**
    * @param {CanvasRenderingContext2D} context
    * @param {HTMLImageElement} imagem
    * @param {number} linhas
    * @param {number} colunas
    */
   constructor(context, imagem, linhas, colunas) {
      this.context = context;
      this.imagem = imagem;
      this.numLinhas = linhas;
      this.numColunas = colunas;
      /** Intervalo em ms entre a troca de colunas (velocidade da animação). */
      this.intervalo = 0;
      this.linha = 0;
      this.coluna = 0;
      /** Callback opcional disparado ao completar um ciclo de colunas. */
      this.fimDoCiclo = null;
   }

   /**
    * Avança para a próxima coluna quando `intervalo` ms tiverem se passado
    * desde a última troca; ao voltar para a coluna 0, dispara fimDoCiclo().
    */
   proximoQuadro() {
      const agora = new Date().getTime();

      // Lazy init: só sabemos "agora" no primeiro proximoQuadro().
      if (! this.ultimoTempo) this.ultimoTempo = agora;

      if (agora - this.ultimoTempo < this.intervalo) return;

      if (this.coluna < this.numColunas - 1) {
         this.coluna++;
      }
      else {
         this.coluna = 0;
         if (this.fimDoCiclo) this.fimDoCiclo();
      }

      this.ultimoTempo = agora;
   }

   /**
    * Desenha o quadro atual (this.linha, this.coluna) na posição (x, y).
    * @param {number} x
    * @param {number} y
    */
   desenhar(x, y) {
      const largura = this.imagem.width / this.numColunas;
      const altura = this.imagem.height / this.numLinhas;

      this.context.drawImage(
         this.imagem,
         largura * this.coluna,
         altura * this.linha,
         largura,
         altura,
         x,
         y,
         largura,
         altura
      );
   }
}
