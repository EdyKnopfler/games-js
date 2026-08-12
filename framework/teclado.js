'use strict';

// Códigos de teclas - aqui vão todos os que forem necessários
const SETA_ESQUERDA = 37;
const SETA_ACIMA = 38;
const SETA_DIREITA = 39;
const SETA_ABAIXO = 40;
const ESPACO = 32;
const ENTER = 13;

/**
 * Abstração fina sobre os eventos keydown/keyup de um elemento (tipicamente
 * `document`), com dois modos de leitura: estado contínuo (pressionada) e
 * disparo único por pressionamento (disparou), sem repetir em key-repeat.
 */
class Teclado {
   /**
    * @param {EventTarget} elemento
    */
   constructor(elemento) {
      this.elemento = elemento;
      this.pressionadas = [];
      this.disparadas = [];
      this.funcoesDisparo = [];

      this.aoKeydown = (evento) => {
         const tecla = evento.keyCode;
         this.pressionadas[tecla] = true;

         // Só dispara no primeiro keydown da tecla, não repete no
         // key-repeat do SO.
         if (this.funcoesDisparo[tecla] && !this.disparadas[tecla]) {
             this.disparadas[tecla] = true;
             this.funcoesDisparo[tecla]();
         }
      };

      this.aoKeyup = (evento) => {
         this.pressionadas[evento.keyCode] = false;
         this.disparadas[evento.keyCode] = false;
      };

      elemento.addEventListener('keydown', this.aoKeydown);
      elemento.addEventListener('keyup', this.aoKeyup);
   }

   /**
    * Estado contínuo: true enquanto a tecla estiver pressionada. Usado para
    * movimento (ex. segurar uma seta).
    * @param {number} tecla código da tecla (ver constantes SETA_*, ESPACO, ENTER)
    * @returns {boolean}
    */
   pressionada(tecla) {
      return this.pressionadas[tecla];
   }

   /**
    * Registra um callback disparado uma única vez por pressionamento da
    * tecla (não repete em key-repeat do SO). Passar `null` remove o
    * disparo registrado. Usado para ações discretas (atirar, pausar).
    * @param {number} tecla
    * @param {?function} callback
    */
   disparou(tecla, callback) {
      this.funcoesDisparo[tecla] = callback;
   }

   /**
    * Remove os listeners registrados no elemento. Necessário para descartar
    * um Teclado sem vazar listener (ex.: um Teclado novo por partida).
    */
   remover() {
      this.elemento.removeEventListener('keydown', this.aoKeydown);
      this.elemento.removeEventListener('keyup', this.aoKeyup);
   }
}
