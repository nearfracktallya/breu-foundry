# BREU para Foundry VTT

> **Beta pública · v0.9.0-beta.1 · Projeto comunitário não oficial**

Implementação de **BREU** para **Foundry Virtual Tabletop v14**, mantida por **Near**.

Este projeto foi feito para levar a estrutura de jogo de BREU ao Foundry — fichas, rolagens, recursos, iniciativa e algumas automações — sem reproduzir o conteúdo do livro. **Você precisa ter acesso ao livro BREU para usar o sistema de forma completa e correta.**

## Importante

Este é um projeto **não oficial**. Isso significa que ele não é um produto publicado nem mantido oficialmente pela Luz Negra Editora e não recebe suporte oficial da editora.

Ao mesmo tempo, o projeto não foi desenvolvido à revelia dos autores: **Diego Bassinello autorizou o uso do logotipo BREU nesta implementação e incentivou o desenvolvimento e a distribuição comunitária do sistema para Foundry VTT**. Essa autorização não transforma a implementação em um produto oficial.

BREU é obra de **Diego Bassinello e Rafão Araujo** e é publicado pela **Luz Negra Editora**. Os direitos sobre BREU, seu nome, logotipo, identidade, textos, artes e demais conteúdos editoriais permanecem com seus respectivos titulares.

- Luz Negra Editora: https://luznegra.com.br/
- Página oficial de BREU: https://luznegra.com.br/breu/
- Livro BREU: https://luznegra.com.br/produto/breu/

## Este sistema não substitui o livro

A implementação foi deliberadamente construída como uma ferramenta de mesa, em um escopo semelhante ao de uma referência mecânica mínima: ela oferece suporte às regras necessárias para operar as fichas e rolagens, mas **não inclui o texto integral das regras, capítulos do livro, listas completas de magias, catálogo de criaturas, conteúdo editorial, ilustrações do livro ou compêndios oficiais**.

Para criar personagens, consultar Benefícios, entender Magias, usar Criaturas e resolver situações de jogo, consulte o livro BREU.

## Estado da beta

A versão `v0.9.0-beta.1` é a primeira beta pública. O sistema já é utilizável em mesa, mas ainda pode conter bugs, inconsistências visuais e casos de regra não cobertos pela automação.

A filosofia da implementação é **automatizar contas repetitivas sem retirar da mesa decisões que pertencem à ficção ou à arbitragem**. Nem todo Benefício de Classe possui botão ou macro, e isso é intencional.

## Recursos atuais

- Ficha de Personagem com modos **Jogar** e **Editar**.
- Atributos, Testes de Resistência, PV, Dados de Vida, CA, deslocamento e Bônus de Proficiência.
- Progressão multiclasse de Arcanista, Combatente, Especialista e Profeta.
- Herança, Antecedente, Benefícios de Classe, Debilidades e anotações.
- Inventário com Carga, Carga Mínima, Mochila, Prata e equipamentos.
- Armas, armaduras, escudos e regras de proficiência suportadas pela ficha.
- Arma Favorita, Estilos de Luta, Lutador e outras automações seletivas do Combatente.
- Técnica Especializada da Especialista aplicada aos TRs quando configurada.
- Conjuração de Arcanista e Profeta com Espaços de Magia separados.
- Magias como Items, incluindo preparação de Feitiços e conjuração.
- Descanso Diário, Meio Descanso e Descanso Longo.
- Ficha de Criatura com ataques, dano, Moral, habilidades, Magias e criação.
- Iniciativa de BREU por lados com `1d6 + modificadores` e nova rolagem por rodada.
- Chat próprio com identidade visual, retrato do personagem, nome do jogador e cards de rolagem.
- Interface tipográfica baseada em Grenze e Grenze Gotisch.

## O que não vem no pacote

Não há compêndios com conteúdo do livro. O sistema não distribui:

- lista completa de Magias;
- bestiário de BREU;
- Benefícios copiados do livro;
- equipamentos ou tabelas editoriais em massa;
- textos de capítulos;
- artes internas do livro.

O conteúdo usado na mesa deve ser criado pelo usuário a partir da sua própria cópia de BREU.

## Compatibilidade

- **Foundry VTT:** v14
- **Versão verificada:** 14.359
- **Idioma:** Português (Brasil)

## Instalação manual

1. Feche o Foundry VTT.
2. Extraia a pasta `breu` em `Data/systems/` dentro da pasta de dados do Foundry.
3. Confirme que `system.json` está diretamente em `Data/systems/breu/system.json`.
4. Abra o Foundry e crie um mundo usando o sistema **BREU**.

O Foundry também aceita distribuição por manifesto. Os campos `url`, `manifest` e `download` serão adicionados ao `system.json` quando o repositório público e a URL estável da release estiverem definidos.

## Feedback e bugs

Durante a beta, relatórios são especialmente úteis. Ao reportar um problema, inclua:

- versão do Foundry;
- versão do sistema BREU;
- o que você estava tentando fazer;
- passos para reproduzir;
- captura de tela, se houver;
- erro do Console (`F12`) quando aplicável.

Há um modelo de bug em `.github/ISSUE_TEMPLATE/bug_report.yml` para quando o projeto estiver publicado no GitHub.

## Licença do código

O **código original desta implementação** é disponibilizado sob licença MIT. Consulte [`LICENSE.md`](LICENSE.md).

Essa licença **não concede direitos sobre BREU, o logotipo BREU, a identidade editorial, textos, ilustrações ou qualquer outro conteúdo pertencente aos titulares de BREU**. Consulte [`LEGAL.md`](LEGAL.md).

As fontes utilizadas possuem licenças próprias. Consulte [`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md).

## Créditos

**BREU**  
Diego Bassinello e Rafão Araujo  
Publicado pela Luz Negra Editora

**Implementação para Foundry VTT**  
Near

**Tipografia**  
Grenze e Grenze Gotisch — Omnibus-Type / Renata Polastri

---

Se você chegou até aqui procurando as regras do jogo, este repositório não é o livro: pegue BREU pela Luz Negra, abra a ficha e entre no escuro.
