'use strict';

/**
 * Orquestra só duas coisas: carregamento de assets e transição entre os
 * estados de nível superior (menu -> jogando -> game over -> menu -> ...).
 * Não conhece mecânica de jogo — isso é responsabilidade de Partida — nem
 * desenho de tela — isso é responsabilidade de Menu/GameOver.
 */
class JogoNave {
   /**
    * @param {HTMLCanvasElement} canvas
    * @param {HTMLAnchorElement} elementoLinkJogar
    */
   constructor(canvas, elementoLinkJogar) {
      this.canvas = canvas;
      this.context = canvas.getContext('2d');
      this.carregador = new CarregadorAssets();

      this.botaoJogar = new BotaoJogar(elementoLinkJogar);
      this.menu = new Menu(canvas, this.context, this.botaoJogar);
      this.gameOver = new GameOver(canvas, this.context, this.botaoJogar);

      this.imagens = null;
      this.musicaAcao = null;
      this.partida = null;
   }

   /** Ponto de entrada: dispara o carregamento de imagens e músicas. */
   iniciar() {
      this.carregarImagens();
      this.carregarMusicas();
   }

   carregarImagens() {
      this.carregador.aoProgredir = (carregadas, total) =>
         this.menu.desenharCarregando(carregadas, total, this.imagens.espaco);
      this.carregador.aoFalhar = (nomeArquivo) =>
         this.menu.desenharFalha(nomeArquivo);
      this.carregador.aoCompletar = () =>
         this.menu.mostrar(this.imagens.espaco);

      this.imagens = this.carregador.carregarImagens({
         espaco:   'fundo-espaco.png',
         estrelas: 'fundo-estrelas.png',
         nuvens:   'fundo-nuvens.png',
         nave:     'nave-spritesheet.png',
         ovni:     'ovni.png',
         explosao: 'explosao.png'
      });
   }

   carregarMusicas() {
      this.musicaAcao = new Audio();
      this.musicaAcao.src = 'snd/musica-acao.mp3';
      this.musicaAcao.volume = 0.8;
      this.musicaAcao.loop = true;
      this.musicaAcao.load();
   }

   iniciarJogo() {
      this.botaoJogar.esconder();
      this.partida = new Partida(this.context, this.imagens, this.musicaAcao,
         () => this.encerrarJogo());
   }

   encerrarJogo() {
      this.partida = null;
      this.gameOver.mostrar(this.imagens.espaco);
   }
}
