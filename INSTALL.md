# Instalação

## Instalação manual

Esta beta pode ser distribuída como um arquivo ZIP do diretório do sistema. O Foundry VTT oferece instalação manual de sistemas extraindo o pacote na pasta `Data/systems/`.

1. Feche o Foundry VTT.
2. Extraia a pasta `breu` em `Data/systems/`.
3. A estrutura final deve conter `Data/systems/breu/system.json`.
4. Abra o Foundry VTT.
5. Crie ou configure um mundo usando o sistema **BREU**.

## Atualização manual

Antes de atualizar, faça backup do mundo.

Para atualizar uma versão beta manualmente, substitua a pasta do sistema por uma versão nova. Não apague seu mundo: os dados de mundo ficam separados do diretório do sistema.

## Instalação por manifesto

O `system.json` já está preparado como manifesto do sistema, mas a instalação automática exige URLs públicas estáveis para `url`, `manifest` e `download`. Esses campos devem ser adicionados quando o repositório e a primeira release pública do GitHub estiverem definidos.

Versão do sistema: `0.9.0-beta.1`  
Foundry verificado: `14.359`
