'use strict';

/**
 * Carrega um mapa de imagens em paralelo e reporta progresso via callback.
 * Não desenha nada — quem chama decide como mostrar carregamento/erro.
 */
class CarregadorAssets {
   constructor() {
      this.total = 0;
      this.carregadas = 0;
      /** Callback opcional: function(carregadas, total), chamado a cada imagem carregada. */
      this.aoProgredir = null;
      /** Callback opcional: function(nomeArquivo), chamado se uma imagem falhar. */
      this.aoFalhar = null;
      /** Callback opcional: function(), chamado quando todas as imagens carregarem. */
      this.aoCompletar = null;
   }

   /**
    * Dispara o carregamento de um mapa {chave: nomeArquivo} e retorna,
    * imediatamente, um mapa {chave: Image} — cada Image é preenchida de
    * forma assíncrona conforme o carregamento avança.
    * @param {Object.<string, string>} mapaArquivos
    * @param {string} [pasta='img/']
    * @returns {Object.<string, HTMLImageElement>}
    */
   carregarImagens(mapaArquivos, pasta = 'img/') {
      const imagens = {};

      for (const chave in mapaArquivos) {
         const nomeArquivo = mapaArquivos[chave];
         const img = new Image();
         img.src = pasta + nomeArquivo;
         img.onload = () => this.progrediu();
         img.onerror = () => {
            if (this.aoFalhar) this.aoFalhar(nomeArquivo);
         };
         this.total++;

         imagens[chave] = img;
      }

      return imagens;
   }

   /** Contabiliza uma imagem carregada e dispara aoProgredir()/aoCompletar(). */
   progrediu() {
      this.carregadas++;

      if (this.aoProgredir) this.aoProgredir(this.carregadas, this.total);
      if (this.carregadas == this.total && this.aoCompletar) this.aoCompletar();
   }
}
