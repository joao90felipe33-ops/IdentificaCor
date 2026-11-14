# Identifica Cor 🎨

O **Identifica Cor** é um projeto web voltado à acessibilidade visual, desenvolvido com o objetivo de auxiliar pessoas com daltonismo ou dificuldades na identificação de cores.

A proposta é simples: oferecer uma ferramenta gratuita, acessível e intuitiva, permitindo identificar, explorar e comparar cores de imagens.

O projeto começou como uma atividade acadêmica e continua sendo desenvolvido, recebendo melhorias visuais, novas funcionalidades e ajustes de acessibilidade.

## Funcionalidades

- **Identificador de cores:** permite selecionar pontos de uma imagem para descobrir o nome aproximado da cor e seus códigos HEX e RGB.
- **Comparador de cores:** permite comparar duas cores de uma mesma imagem, apresentando diferenças de luminosidade, saturação, contraste e uma comparação visual.
- **Cores predominantes:** identifica as principais cores presentes na imagem.
- **Combinações:** apresenta tonalidades semelhantes e harmonias de cores.
- **Histórico:** registra as últimas cores selecionadas.
- **Leitura em voz alta:** reproduz o nome das cores identificadas.
- **Acessibilidade:** oferece alto contraste, ajuste do tamanho dos textos e paletas alternativas para protanopia, deuteranopia, tritanopia e acromatopsia.

Os modos de daltonismo modificam a interface, incluindo suas cores, logos e ícones, sem alterar os valores originais das imagens.

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript
- Canvas API

O projeto utiliza uma estrutura modular, com arquivos separados por funcionalidade, facilitando a manutenção e a implementação de novos recursos.

Não utiliza banco de dados nem exige cadastro. As imagens são processadas diretamente no navegador.

## Hospedagem e desenvolvimento

O Identifica Cor foi publicado inicialmente pelo **Netlify**, permitindo disponibilizar gratuitamente o projeto na internet.

Com a continuidade do desenvolvimento, o **Cloudflare Pages** passou a ser considerado como alternativa de hospedagem gratuita, especialmente pela possibilidade de realizar atualizações frequentes.

O desenvolvimento é realizado pelo Visual Studio Code, utilizando o Live Server para testes locais.

O GitHub também está previsto como ferramenta para organizar o versionamento e facilitar futuras publicações.

## Histórico de versões

**v1.0.0 — Versão inicial**

Lançamento do identificador de cores e das funcionalidades principais.

**v1.1.1 — Acessibilidade e identidade visual**

Implementação de filtros de daltonismo, personalização de cores, logos dinâmicas, melhorias na interface e reorganização modular do código.

**v1.2.0 — Comparador de Cores**

Implementação de uma ferramenta independente para comparar duas cores, mantendo o funcionamento do identificador principal.

**v1.2.1 — Aprimoramento visual**

Adição planejada da comparação visual com cores sobrepostas, facilitando a observação das diferenças entre tonalidades.

**v1.2.2 — Atualizações pequenas**

Agora o site oferece uma imagem de teste, e o botão brilhante aparece embaixo da imagem

**v1.2.2.1 — Ícone da imagem de teste**

A miniatura do botão de teste foi substituída por um ícone de paleta, sem alterar o carregamento da imagem.

**v1.2.2.2 — Ajustes na interface**

O botão “Explorar cores semelhantes e combinações” mantém seu brilho, agora sem receber a cor identificada como plano de fundo. A área “Sua imagem” não estica para acompanhar a altura do painel “Cor identificada”, evitando espaços em branco desnecessários.

**v1.2.2.3 — Brilho e consistência dos temas**

O botão “Ativar comparador” ganhou um efeito luminoso. Os botões de comparação e de combinações agora acompanham as paletas de protanopia, deuteranopia, tritanopia e acromatopsia, sem permanecer azuis. No alto contraste, os destaques têm halo estático e o botão “Alto contraste” muda de amarelo para branco ao passar o mouse. Animações são desativadas para usuários que preferem movimento reduzido.

**v1.2.2.4 — Correção do tamanho da foto**

## Objetivo

Continuar desenvolvendo o Identifica Cor, aprimorando seus recursos e explorando novas possibilidades de acessibilidade.

Mais do que identificar cores, a intenção é tornar a interação com elas mais simples e acessível.

---

**Identifica Cor — Descubra as cores, sem barreiras.**