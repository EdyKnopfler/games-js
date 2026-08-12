'use strict';

const INTERVALO_CRIACAO_OVNI_INICIAL = 1000;
const INTERVALO_CRIACAO_OVNI_MINIMO = 300;
// Tempo de jogo (ms) para o intervalo cair do valor inicial até o mínimo.
const TEMPO_RAMPA_DIFICULDADE = 120000;
const VELOCIDADE_MIN_OVNI = 500;
const VELOCIDADE_MAX_OVNI = 1000;

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
   }

   processar() {
      const agora = new Date().getTime();
      const decorrido = agora - this.ultimoOvni;

      this.tempoJogado += this.animacao.decorrido;

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

   novoOvni() {
      const ovni = new Ovni(this.context, this.imgOvni, this.imgExplosao);

      // Mínimo: VELOCIDADE_MIN_OVNI; máximo: VELOCIDADE_MAX_OVNI
      ovni.velocidade = Math.floor(
         VELOCIDADE_MIN_OVNI +
         Math.random() * (VELOCIDADE_MAX_OVNI - VELOCIDADE_MIN_OVNI + 1)
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
}
