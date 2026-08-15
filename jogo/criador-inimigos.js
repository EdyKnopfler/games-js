'use strict';

const INTERVALO_CRIACAO_OVNI_INICIAL = 1000;
const INTERVALO_CRIACAO_OVNI_MINIMO = 300;
const TEMPO_RAMPA_DIFICULDADE = 120000;
const VELOCIDADE_MIN_OVNI = 500;
const VELOCIDADE_MAX_OVNI = 1000;
const LARGURA_JANELA_VELOCIDADE =
   (VELOCIDADE_MAX_OVNI - VELOCIDADE_MIN_OVNI) / 5;
const RECUO_JANELA_AO_PERDER_VIDA = 30000;

/**
 * Sistema de processamento (mesmo contrato de Colisor): a cada processar(),
 * cria um novo Ovni se já passou o intervalo atual desde o último. O
 * intervalo começa em INTERVALO_CRIACAO_OVNI_INICIAL e cai linearmente,
 * conforme o tempo de jogo decorrido, até INTERVALO_CRIACAO_OVNI_MINIMO —
 * a dificuldade sobe aos poucos, ao longo de TEMPO_RAMPA_DIFICULDADE.
 * `tempoJogado` só avança enquanto a animação está ligada, então pausar a
 * partida não conta como progresso de dificuldade.
 */
class CriadorInimigos {
   constructor(context, imgOvni, imgExplosao, colisor) {
      this.context = context;
      this.imgOvni = imgOvni;
      this.imgExplosao = imgExplosao;
      this.colisor = colisor;
      this.ultimoOvni = new Date().getTime();
      this.tempoJogado = 0;
      this.tempoDesdeUltimaVida = 0;
   }

   processar() {
      const agora = new Date().getTime();
      const decorrido = agora - this.ultimoOvni;

      this.tempoJogado += this.animacao.decorrido;
      this.tempoDesdeUltimaVida += this.animacao.decorrido;

      if (decorrido > this.intervaloAtual()) {
         this.novoOvni();
         this.ultimoOvni = agora;
      }
   }

   /** Intervalo de criação atual, decrescendo com `tempoJogado`. */
   intervaloAtual() {
      const progresso = Math.min(this.tempoJogado / TEMPO_RAMPA_DIFICULDADE, 1);
      return INTERVALO_CRIACAO_OVNI_INICIAL - progresso *
         (INTERVALO_CRIACAO_OVNI_INICIAL - INTERVALO_CRIACAO_OVNI_MINIMO);
   }

   /** Início da janela de velocidade atual, avançando com `tempoDesdeUltimaVida`. */
   inicioJanelaVelocidade() {
      const progresso =
         Math.min(this.tempoDesdeUltimaVida / TEMPO_RAMPA_DIFICULDADE, 1);
      return VELOCIDADE_MIN_OVNI + progresso *
         (VELOCIDADE_MAX_OVNI - VELOCIDADE_MIN_OVNI - LARGURA_JANELA_VELOCIDADE);
   }

   novoOvni() {
      const ovni = new Ovni(this.context, this.imgOvni, this.imgExplosao);

      const inicioJanela = this.inicioJanelaVelocidade();
      ovni.velocidade = Math.floor(
         inicioJanela + Math.random() * (LARGURA_JANELA_VELOCIDADE + 1)
      );

      // Mínimo: 0; máximo: largura do canvas - largura do ovni
      ovni.x = Math.floor(
         Math.random() * (this.context.canvas.width - this.imgOvni.width + 1)
      );

      // Descontar a altura
      ovni.y = -this.imgOvni.height;

      this.animacao.novoSprite(ovni);
      this.colisor.novoSprite(ovni);
   }

   /** Reinicia a contagem — usado ao (re)começar ou retomar o jogo. */
   reiniciar() {
      this.ultimoOvni = new Date().getTime();
   }

   /**
    * Reage a uma vida perdida: recua `tempoJogado` (respiro no ritmo de
    * criação — fixo, mas como intervaloAtual() é linear já sai maior cedo
    * e menor tarde) e reinicia `tempoDesdeUltimaVida` (janela de
    * velocidade volta ao início).
    */
   aoPerderVida() {
      this.tempoJogado =
         Math.max(0, this.tempoJogado - RECUO_JANELA_AO_PERDER_VIDA);
      this.tempoDesdeUltimaVida = 0;
   }
}
