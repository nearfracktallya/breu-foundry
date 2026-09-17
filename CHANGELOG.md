# Changelog

Todas as mudanças relevantes da implementação são registradas neste arquivo.

## [0.9.0-beta.2] - 2026-09-17

### Adicionado

- Arte de apresentação do sistema na tela **Game Systems** do Foundry.
- Arte de fundo padrão para novos mundos BREU.
- Uso de `breu-logo-colorido.jpg` como mídia de Setup.
- Uso de `capa_arte_original.jpg` como background padrão do sistema.

### Corrigido

- Painel da Iniciativa BREU reposicionado abaixo do cabeçalho de rodada do Combat Tracker.
- Manifesto e link de download atualizados para a beta.2.

## [0.9.0-beta.1] - 2026-09-17

Primeira beta pública.

### Fichas

- Ficha de Personagem própria para Foundry VTT v14.
- Modos Jogar e Editar para separar uso em sessão de manutenção da ficha.
- Atributos FOR, DES, CON, INT, SAB e CAR com Testes de Resistência.
- PV, CA, deslocamento, Bônus de Proficiência e Dados de Vida.
- Progressão multiclasse entre Arcanista, Combatente, Especialista e Profeta.
- Campos de Antecedente, Herança, Benefícios de Classe, Debilidades e anotações.
- Ficha de Criatura com estatísticas, ataques, dano, Moral, habilidades, Magias e campos de criação.
- Fichas próprias para Equipamento e Magia.

### Inventário e equipamento

- Inventário organizado por categorias e localização.
- Cálculo de Carga e Carga Mínima.
- Suporte à Mochila e aos limites adicionais de carga.
- Armas corpo a corpo, à distância e de arremesso.
- Proficiências de armas simples, marciais, arcos e escolhas especiais.
- Armaduras leves, médias, pesadas e escudos.
- Cálculo de CA com tratamento de armadura fora das restrições.
- Suporte à propriedade de Arma Favorita e progressão de dano.

### Magia

- Magias como Items reutilizáveis.
- Feitiços e Milagres separados por tipo e Círculo.
- Espaços de Magia separados para Arcanista e Profeta.
- Preparação de Feitiços para Arcanista.
- Teste de Magia e Potência Mágica na ficha.
- Conjuração e consumo de Espaços pelo chat.
- Criaturas com Nível de Conjuração, CD e Espaços configuráveis manualmente.

### Automação seletiva

- Estilos de Luta com bônus de ataque, dano e redução configuráveis.
- Lutador integrado ao cálculo de CA quando aplicável.
- Tomar Fôlego com consumo de Dado de Vida.
- Ignorar Debilidades com controle manual de ativação.
- Técnica Especializada de Especialista refletida diretamente nos TRs.
- Proteção Arcana aplicada como BP adicional em TRs contra efeitos mágicos.
- Penalidades de Debilidade apresentadas como condições automáticas de rolagem.
- Vantagem e Desvantagem vindas da ficção continuam sob controle do jogador e podem se anular com condições automáticas.
- Benefícios dependentes de decisão ou contexto permanecem manuais quando a automação retiraria agência da mesa.

### Recuperação

- Descanso Diário e Meio Descanso.
- Recuperação de PV por Dado de Vida.
- Recuperação de Espaços de Magia dos Círculos menores para os maiores.
- Descanso Longo com recuperação de PV, Dados de Vida, Espaços e tratamento de Debilidades.

### Iniciativa

- Iniciativa própria de BREU no Combat Tracker.
- Rolagem por lados usando 1d6 e modificadores ficcionais.
- Controle separado de Aventureiros e PNJs.
- Empates tratados como atuação simultânea.
- Estado reiniciado a cada nova rodada.
- Comunicação entre jogadores e GM pelo socket do sistema.

### Chat e interface

- Cards padronizados para Ataque, Dano, TR, Teste de Magia, Moral, Magias, recuperação e Iniciativa.
- Shell próprio de mensagens com retrato do Actor, personagem, jogador, horário e controles.
- Identidade visual escura com destaque laranja.
- Logotipo BREU integrado à ficha e aos cards de chat com autorização de Diego Bassinello.
- Tipografia global com Grenze e Grenze Gotisch.
- Melhorias de consistência entre fichas de Personagem, Criatura, Equipamento e Magia.

### Correções

- Botões Cancelar de diálogos deixam de executar a ação correspondente.
- Cancelamento corrigido em rolagens de Personagem, Criatura, Magia, Moral, descansos e Iniciativa.
- Descanso Longo corrigido para concluir e atualizar a ficha corretamente.
- Correção da ordem de identidade, card e dados no chat.
- Preservação dos ícones do Foundry/Font Awesome após a aplicação da tipografia global.

### Distribuição

- Removidos os tipos de Item antigos `beneficio`, `heranca` e `debilidade` do manifesto; essas informações pertencem ao Actor.
- Socket do sistema habilitado para a iniciativa compartilhada.
- Pacote não inclui compêndios nem conteúdo editorial do livro.
- Adicionados README, documentação legal, licença do código, avisos de terceiros e modelo de bug report.
