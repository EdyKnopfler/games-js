'use strict';

const LARGURA_NAVE = 36;
const ALTURA_NAVE = 48;

class Nave {
   static RETANGULOS_COLISAO = Colisor.criarRetangulos([
      {x: (nave) => nave.x + 2,  y: (nave) => nave.y + 19, largura: () => 9,  altura: () => 13},
      {x: (nave) => nave.x + 13, y: (nave) => nave.y + 3,  largura: () => 10, altura: () => 33},
      {x: (nave) => nave.x + 25, y: (nave) => nave.y + 19, largura: () => 9,  altura: () => 13}
   ]);

   constructor(context, teclado, imagem, imgExplosao) {
      this.context = context;
      this.teclado = teclado;
      this.imagem = imagem;
      this.x = 0;
      this.y = 0;
      this.velocidade = 0;
      this.spritesheet = new Spritesheet(context, imagem, 3, 2);
      this.spritesheet.linha = 0;
      this.spritesheet.intervalo = 100;
      this.imgExplosao = imgExplosao;
      this.acabaramVidas = null;
      this.perdeuVida = null;
      this.vidasExtras = 3;
      this.cadenciaTiro = 300;
      this.ultimoTiro = 0;
   }

   atualizar() {
      const incremento =
          this.velocidade * this.animacao.decorrido / 1000;

      if (this.teclado.pressionada(SETA_ESQUERDA) && this.x > 0)
         this.x -= incremento;

      if (this.teclado.pressionada(SETA_DIREITA) &&
               this.x < this.context.canvas.width - LARGURA_NAVE)
         this.x += incremento;

      if (this.teclado.pressionada(SETA_ACIMA) && this.y > 0)
         this.y -= incremento;

      if (this.teclado.pressionada(SETA_ABAIXO) &&
               this.y < this.context.canvas.height - ALTURA_NAVE)
         this.y += incremento;
   }

   desenhar() {
      if (this.teclado.pressionada(SETA_ESQUERDA))
         this.spritesheet.linha = 1;
      else if (this.teclado.pressionada(SETA_DIREITA))
         this.spritesheet.linha = 2;
      else
         this.spritesheet.linha = 0;

      this.spritesheet.desenhar(this.x, this.y);
      this.spritesheet.proximoQuadro();
   }

   atirar() {
      const agora = new Date().getTime();
      if (agora - this.ultimoTiro < this.cadenciaTiro) return;
      this.ultimoTiro = agora;

      const t = new Tiro(this.context, this);
      this.animacao.novoSprite(t);
      this.colisor.novoSprite(t);
   }

   retangulosColisao() {
      return Nave.RETANGULOS_COLISAO;
   }

   colidiuCom(outro) {
      if (outro instanceof Ovni) {
         this.animacao.excluirSprite(this);
         this.animacao.excluirSprite(outro);
         this.colisor.excluirSprite(this);
         this.colisor.excluirSprite(outro);

         const exp1 = new Explosao(this.context, this.imgExplosao,
                                 this.x, this.y);
         const exp2 = new Explosao(this.context, this.imgExplosao,
                                 outro.x, outro.y);

         this.animacao.novoSprite(exp1);
         this.animacao.novoSprite(exp2);

         exp1.fimDaExplosao = () => {
            this.vidasExtras--;
            if (this.perdeuVida) this.perdeuVida();

            if (this.vidasExtras < 0) {
               if (this.acabaramVidas) this.acabaramVidas();
            }
            else {
               // TODO: readicionar é estranho - talvez vire estado explícito
               this.colisor.novoSprite(this);
               this.animacao.novoSprite(this);

               this.posicionar();
            }
         };
      }
   }

   posicionar() {
      const canvas = this.context.canvas;
      this.x = canvas.width / 2 - LARGURA_NAVE / 2;
      this.y = canvas.height - ALTURA_NAVE;
   }
}
