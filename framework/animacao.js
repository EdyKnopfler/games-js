'use strict';

/**
 * Game loop baseado em requestAnimationFrame. Mantém as listas de sprites
 * (desenháveis) e processamentos (lógica sem desenho) e as percorre a cada
 * frame, na ordem: atualizar -> desenhar -> processar -> aplicar exclusões.
 */
class Animacao {
   /**
    * @param {CanvasRenderingContext2D} context
    */
   constructor(context) {
      this.context = context;
      this.sprites = [];
      this.ligado = false;
      this.processamentos = [];
      this.spritesExcluir = [];
      this.processamentosExcluir = [];
      this.ultimoCiclo = 0;
      this.decorrido = 0;
   }

   /**
    * Registra um sprite no loop. O sprite passa a receber atualizar()/
    * desenhar() a cada frame e ganha uma referência de volta (this.animacao).
    * @param {{atualizar: function, desenhar: function}} sprite
    */
   novoSprite(sprite) {
      this.sprites.push(sprite);
      sprite.animacao = this;
   }

   /** Reinicia a contagem de delta time e inicia (ou retoma) o loop. */
   ligar() {
      this.ultimoCiclo = 0;
      this.ligado = true;
      this.proximoFrame();
   }

   /**
    * Para o loop. Não interrompe um frame já agendado; o próprio
    * proximoFrame() encerra a cadeia ao checar `ligado` no próximo tick.
    */
   desligar() {
      this.ligado = false;
   }

   /**
    * Um tick do loop: calcula o delta time (this.decorrido, em ms), roda
    * atualizar/desenhar de todos os sprites e processar() de todos os
    * processamentos, aplica exclusões pendentes e agenda o próximo frame.
    */
   proximoFrame() {
      if (! this.ligado) return;

      const agora = new Date().getTime();
      if (this.ultimoCiclo == 0) this.ultimoCiclo = agora;
      this.decorrido = agora - this.ultimoCiclo;

      for (const i in this.sprites)
         this.sprites[i].atualizar();

      for (const i in this.sprites)
         this.sprites[i].desenhar();

      for (const i in this.processamentos)
         this.processamentos[i].processar();

      this.processarExclusoes();

      this.ultimoCiclo = agora;

      requestAnimationFrame(() => this.proximoFrame());
   }

   /**
    * Registra algo que roda a cada frame mas não é desenhável (ex.: o
    * Colisor, ou o criador de inimigos do bootstrap).
    * @param {{processar: function}} processamento
    */
   novoProcessamento(processamento) {
      this.processamentos.push(processamento);
      processamento.animacao = this;
   }

   /**
    * Marca um sprite para remoção. A remoção é diferida: só é aplicada em
    * processarExclusoes(), ao final do frame, para não mutar o array
    * `sprites` durante a iteração.
    * @param {*} sprite
    */
   excluirSprite(sprite) {
      this.spritesExcluir.push(sprite);
   }

   /**
    * Marca um processamento para remoção diferida (mesmo padrão de
    * excluirSprite).
    * @param {*} processamento
    */
   excluirProcessamento(processamento) {
      this.processamentosExcluir.push(processamento);
   }

   /** Aplica as exclusões pendentes de sprites e processamentos. */
   processarExclusoes() {
      const novoSprites = [];
      const novoProcessamentos = [];

      for (const i in this.sprites) {
         if (this.spritesExcluir.indexOf(this.sprites[i]) == -1)
            novoSprites.push(this.sprites[i]);
      }

      for (const i in this.processamentos) {
         if (this.processamentosExcluir.indexOf(this.processamentos[i])
             == -1)
            novoProcessamentos.push(this.processamentos[i]);
      }

      this.spritesExcluir = [];
      this.processamentosExcluir = [];

      this.sprites = novoSprites;
      this.processamentos = novoProcessamentos;
   }
}
