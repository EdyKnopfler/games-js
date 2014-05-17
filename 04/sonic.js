var SONIC_DIREITA = 1;
var SONIC_ESQUERDA = 2;

function Sonic(context, teclado, imagem) { 
   this.context = context; 
   this.teclado = teclado; 
   this.x = 0; 
   this.y = 0; 
   this.velocidade = 10;

   // Criando a spritesheet a partir da imagem recebida
   this.sheet = new Spritesheet(context, imagem, 3, 8);
   this.sheet.intervalo = 60;

   // Estado inicial
   this.andando = false;
   this.direcao = SONIC_DIREITA;
} 
Sonic.prototype = { 
   atualizar: function() { 
      if (this.teclado.pressionada(SETA_DIREITA)) {
         // Se já não estava neste estado...
         if (! this.andando || this.direcao != SONIC_DIREITA) {
            // Seleciono o quadro da spritesheet
            this.sheet.linha = 1;
            this.sheet.coluna = 0;
         }

         // Configuro o estado atual
         this.andando = true;
         this.direcao = SONIC_DIREITA;

         // Neste estado, a animação da spritesheet deve rodar
         this.sheet.proximoQuadro();

         // Desloco o Sonic
         this.x += this.velocidade;
      }

      else if (this.teclado.pressionada(SETA_ESQUERDA)) {
         if (! this.andando || this.direcao != SONIC_ESQUERDA) {
            this.sheet.linha = 2;  // Atenção, aqui será 2!
            this.sheet.coluna = 0;
         }

         this.andando = true;
         this.direcao = SONIC_ESQUERDA;
         this.sheet.proximoQuadro();
         this.x -= this.velocidade;  // E aqui é sinal de menos!
      }

      else {
         if (this.direcao == SONIC_DIREITA) 
            this.sheet.coluna = 0; 
         else if (this.direcao == SONIC_ESQUERDA) 
            this.sheet.coluna = 1; 

         this.sheet.linha = 0; 
         // Não chamo proximoQuadro!
         this.andando = false; 
      }
   }, 
   desenhar: function() { 
      this.sheet.desenhar(this.x, this.y);         
   } 
}
