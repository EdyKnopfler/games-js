'use strict';

/**
 * Recurso compartilhado entre as telas que oferecem "Jogar" (Menu e
 * GameOver) — nenhuma delas é dona do botão, só o mostram.
 */
class BotaoJogar {
   /**
    * @param {HTMLElement} elemento
    */
   constructor(elemento) {
      this.elemento = elemento;
   }

   mostrar() {
      this.elemento.style.display = 'block';
   }

   esconder() {
      this.elemento.style.display = 'none';
   }
}
