# Convenções de escrita (código e docs)

- Comentário no código: só o que não é óbvio lendo o código (armadilha, invariante, motivo de workaround) — curto, de preferência uma linha
  - se o porquê já está em `docs/`, aponta pra lá em vez de reexplicar
  - ponto de melhoria pequeno e local: `// TODO:` inline, uma linha, em vez de item novo no TODO.md
- JSDoc de método/classe é diferente de comentário narrando código — mantém, mesmo quando o comportamento parece dedutível pelo nome
  - documenta o *tipo*, que em JS puro não existe em outro lugar (`@param`, `@returns`)
  - serve o IDE (hover, autocomplete), não só quem lê o arquivo inteiro
  - JSDoc descreve *o quê*, não o *como*
  - teste é *localidade* — quem olha só aquele método/trecho, sem o resto do arquivo ou dos docs, sabe aquele detalhe?  
- Documentação em `docs/`:
  - desenho ainda não implementado: detalhe completo (é a única fonte de verdade nesse momento)
  - depois de implementado: código vira fonte de verdade do *como*; a doc encolhe pro *porquê* (decisão de negócio/projeto, armadilhas encontradas)
  - cada fato mora num lugar só — duplicar entre código e doc(s) tende a ficar desatualizado
- Escrita em geral (docs, TODOs, mensagens): bullets aninhados e frases curtas em vez de parágrafo denso