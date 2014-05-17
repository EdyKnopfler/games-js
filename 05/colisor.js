function Colisor() {
   this.sprites = [];
   this.aoColidir = null;
}
Colisor.prototype = {
   novoSprite: function(sprite) {
      this.sprites.push(sprite);
   },
   processar: function() {
      // Inicio com um objeto vazio
      var jaTestados = new Object();

      for (var i in this.sprites) {
         for (var j in this.sprites) {
            // Não colidir um sprite com ele mesmo
            if (i == j) continue;

            // Gerar strings únicas para os objetos
            var id1 = this.stringUnica(this.sprites[i]);
            var id2 = this.stringUnica(this.sprites[j]);

            // Criar os arrays se não existirem
            if (! jaTestados[id1]) jaTestados[id1] = [];
            if (! jaTestados[id2]) jaTestados[id2] = [];

            // Teste de repetição
            if (! (jaTestados[id1].indexOf(id2) >= 0 ||
                   jaTestados[id2].indexOf(id1) >= 0) ) {

               // Abstrair a colisão
               this.testarColisao(this.sprites[i], this.sprites[j]);
               
               // Registrando o teste
               jaTestados[id1].push(id2);
               jaTestados[id2].push(id1);
            }
         }
      }
   },
   testarColisao: function(sprite1, sprite2) {
      // Obter os retângulos de colisão de cada sprite
      var rets1 = sprite1.retangulosColisao();
      var rets2 = sprite2.retangulosColisao();

      // Testar as colisões entre eles
      colisoes:
      for (var i in rets1) {
         for (var j in rets2) {
            // Abstraindo a fórmula!
            if (this.retangulosColidem(rets1[i], rets2[j])) {
               // Eles colidem, vamos notificá-los
               sprite1.colidiuCom(sprite2);
               sprite2.colidiuCom(sprite1);
               
               // Tratador geral
               if (this.aoColidir) this.aoColidir(sprite1, sprite2);
               
               // Não precisa terminar de ver todos os retângulos
               break colisoes;
            }
         }
      }
   },
   retangulosColidem: function(ret1, ret2) {
      // Fórmula de interseção de retângulos
      return (ret1.x + ret1.largura) > ret2.x &&
             ret1.x < (ret2.x + ret2.largura) &&
             (ret1.y + ret1.altura) > ret2.y &&
             ret1.y < (ret2.y + ret2.altura);
   },
   stringUnica: function(sprite) {
      var str = '';
      var retangulos = sprite.retangulosColisao();

      for (var i in retangulos) {
         str += 'x:' + retangulos[i].x + ',' +
                'y:' + retangulos[i].y + ',' +
                'l:' + retangulos[i].largura + ',' +
                'a:' + retangulos[i].altura + '\n';
      }

      return str;
   }
}
