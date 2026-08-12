'use strict';

/**
 * Uma rodada completa e autocontida do jogo: cria e é dona de tudo que só
 * uma partida usa — incluindo Animacao/Teclado/Colisor, que só rodam
 * enquanto se está jogando. Sendo dona da criação, também é a única dona
 * da destruição: ao encerrar, animacao/colisor são descartados por
 * completo (não sobra sprite de partida anterior registrado em lugar
 * nenhum).
 */
class Partida {
   /**
    * @param {CanvasRenderingContext2D} context
    * @param {Object.<string, HTMLImageElement>} imagens
    * @param {HTMLAudioElement} musicaAcao
    * @param {?function} jogoEncerrado callback chamado quando a partida termina
    */
   constructor(context, imagens, musicaAcao, jogoEncerrado) {
      this.context = context;
      this.imagens = imagens;
      this.musicaAcao = musicaAcao;
      this.jogoEncerrado = jogoEncerrado;

      this.animacao = new Animacao(context);
      this.teclado = new Teclado(document);
      this.colisor = new Colisor();

      this.espaco = new Fundo(context, imagens.espaco);
      this.estrelas = new Fundo(context, imagens.estrelas);
      this.nuvens = new Fundo(context, imagens.nuvens);
      this.nave = new Nave(context, this.teclado, imagens.nave,
                           imagens.explosao);
      this.painel = new Painel(context, this.nave);
      this.criadorInimigos = new CriadorInimigos(context, imagens.ovni,
         imagens.explosao, this.colisor);

      this.animacao.novoSprite(this.espaco);
      this.animacao.novoSprite(this.estrelas);
      this.animacao.novoSprite(this.nuvens);
      this.animacao.novoSprite(this.painel);
      this.animacao.novoSprite(this.nave);

      this.colisor.novoSprite(this.nave);
      this.animacao.novoProcessamento(this.colisor);
      this.animacao.novoProcessamento(this.criadorInimigos);

      this.espaco.velocidade = 60;
      this.estrelas.velocidade = 150;
      this.nuvens.velocidade = 500;

      this.nave.posicionar();
      this.nave.velocidade = 200;

      this.nave.acabaramVidas = () => {
         this.encerrar();
         if (this.jogoEncerrado) this.jogoEncerrado();
      };

      this.colisor.aoColidir = (o1, o2) => {
         if ( (o1 instanceof Tiro && o2 instanceof Ovni) ||
              (o1 instanceof Ovni && o2 instanceof Tiro) )
            this.painel.pontuacao += 10;
      };

      this.ativarTiro(true);
      this.teclado.disparou(ENTER, () => this.pausar());

      this.musicaAcao.play();
      this.animacao.ligar();
   }

   ativarTiro(ativar) {
      if (ativar) {
         this.teclado.disparou(ESPACO, () => {
            this.nave.atirar();
         });
      }
      else
         this.teclado.disparou(ESPACO, null);
   }

   pausar() {
      if (this.animacao.ligado) {
         this.animacao.desligar();
         this.ativarTiro(false);

         const context = this.context;
         context.save();
         context.fillStyle = 'white';
         context.strokeStyle = 'black';
         context.font = '50px sans-serif';
         context.fillText("Pausado", 160, 200);
         context.strokeText("Pausado", 160, 200);
         context.restore();
      }
      else {
         this.criadorInimigos.reiniciar();
         this.animacao.ligar();
         this.ativarTiro(true);
      }
   }

   /**
    * Desliga tudo que a partida ligou (entrada/música/loop). animacao e
    * colisor somem junto com o objeto — não é preciso varrer sprite
    * nenhum deles.
    */
   encerrar() {
      this.teclado.remover();

      this.musicaAcao.pause();
      this.musicaAcao.currentTime = 0.0;

      // Sem isso, o loop de requestAnimationFrame desta instância nunca
      // para, mesmo depois de descartada.
      this.animacao.desligar();
   }
}
