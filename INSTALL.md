# Instalação

## Instalação pelo manifesto

No Foundry VTT:

1. Abra a tela de **Configuração**.
2. Entre em **Sistemas de Jogo**.
3. Clique em **Instalar Sistema**.
4. No campo de URL do manifesto, cole:

   `https://raw.githubusercontent.com/nearfracktallya/breu-foundry/main/system.json`

5. Confirme a instalação.

O manifesto é estável e será usado também para verificar futuras atualizações do sistema.

## Instalação manual

1. Feche o Foundry VTT.
2. Baixe `breu-0.9.0-beta.1.zip` na página de Releases do projeto.
3. Extraia o conteúdo em `Data/systems/breu/`.
4. Confirme que a estrutura contém diretamente:

   `Data/systems/breu/system.json`

5. Abra o Foundry VTT.
6. Crie ou configure um mundo usando o sistema **BREU**.

## Atualização

Antes de atualizar uma beta, faça backup do mundo.

Se o sistema foi instalado pelo manifesto, use a opção de atualização do Foundry. O endereço de manifesto permanece o mesmo e aponta para a versão mais recente publicada.

Em instalações manuais, substitua os arquivos da pasta `Data/systems/breu/` pelos da nova versão. Os dados dos mundos ficam separados do diretório do sistema.

## Compatibilidade

- Sistema: `0.9.0-beta.1`
- Foundry VTT mínimo: `14`
- Verificado em: `14.359`
