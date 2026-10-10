# Changelog

Todas as mudanças relevantes do DoseCare são registradas aqui.

O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto usa [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não lançado]

## [1.4.0] - 2026-10-10

Doses que podem ser antecipadas e avatares para mais gente, bichos e plantas.

### Adicionado

- Antecipar doses: no cadastro do medicamento, a opção "Pode ser tomado antes do horário, no mesmo dia" mostra "Tomar agora" na próxima dose do dia. A dose vai para o histórico como "Tomado antes do horário", com o horário do toque, e pode ser desfeita como qualquer outra. A opção vem desligada.
- Tom de pele para os avatares de criança, adulto e idoso, com cinco opções escolhidas à parte do avatar. Perfil novo começa no tom médio; os perfis existentes continuam como estavam.
- Mais avatares de pets: labrador, husky, boxer, vira-lata caramelo, gato preto, gato branco, gato tricolor, peixe, hamster, tartaruga, lagarto, cobra e robô.
- Mais avatares de plantas: suculenta, orquídea e samambaia.

### Alterado

- Cachorros, gatos e coelho aparecem sentados, com as patas da frente, em vez de com ombros parecidos com os das pessoas.
- O histórico mostra o nome atual de um medicamento renomeado, com "Registrado como ..." indicando o nome original. A dose exibida continua sendo a registrada, e nenhum registro é reescrito.

## [1.3.0] - 2026-10-04

Um toque errado em Tomado ou Pular agora tem volta.

### Adicionado

- "Desfazer" depois de tocar em Tomado ou Pular: a barra fica alguns segundos na tela e, se usada, nada entra no histórico. Fechar o app nesse intervalo não perde a ação; ela é registrada com o horário do toque.

## [1.2.0] - 2026-10-03

Lembretes que não param sem aviso e uma lista "Próximos" mais clara.

### Adicionado

- Aviso para abrir o app três, dois e um dia antes do fim dos lembretes programados, para quem passa dias sem abrir o DoseCare. Abrir o app renova a programação.

### Alterado

- A lista "Próximos" vazia agora diz "Por hoje está tudo certo!" quando nada está pendente hoje, e "Nenhuma outra dose para hoje." quando ainda há uma dose em Agora ou em Próximo.

## [1.1.0] - 2026-10-03

Controle de estoque com aviso de reposição e app inteiramente ilustrado, sem emojis.

### Adicionado

- Controle de estoque por medicamento, contado em doses:
  - "Controlar estoque" e "Atualizar estoque" no card do medicamento;
  - cada dose tomada desconta 1 dose, e dose pulada não desconta;
  - estimativa de quantos dias o estoque cobre.
- Aviso de reposição quando restam 10% ou menos da última contagem:
  - notificação diária às 09:00 até a reposição ser registrada;
  - seção "Para repor" na Home;
  - selos "Estoque baixo", "Quase acabando" e "Estoque esgotado".
- Avatares ilustrados novos: menina, bebê, homem, senhor, gato, coelho, pássaro, planta no vaso, cacto e girassol.

### Alterado

- Todos os emojis viraram ilustrações e ícones em SVG, inclusive os símbolos de status.
- Perfis que usavam um emoji como avatar são convertidos automaticamente para a ilustração equivalente.

## [1.0.0] - 2026-10-03

Primeira versão oficial. App Android instalável por APK, com todos os dados guardados no próprio aparelho e funcionamento sem internet.

### Adicionado

#### Perfis

- Cadastro de quem você cuida: crianças, adultos, idosos, pets e plantas.
- Avatar ilustrado para cada tipo de perfil, além da opção de emojis.
- Edição de perfis.
- Exclusão sem perda de dados: o perfil sai da Home, mas o histórico é preservado.

#### Medicamentos de rotina

- Um ou mais horários fixos por dia.
- Data de início.
- Três formas de término: tratamento contínuo, até uma data ou por quantidade de doses programadas.
- Ativação e desativação sem apagar o histórico.
- Edições mudam apenas as próximas doses, nunca o que já foi registrado.

#### Doses

- **Agora:** destaca a dose que precisa de atenção.
- **Próximo:** mostra a próxima dose, inclusive quando ela cai no dia seguinte.
- Registro de dose como Tomado ou Pulado em um toque, com proteção contra registro duplicado.
- Atualização automática da tela na virada de cada minuto, ao voltar do segundo plano e na troca de dia.

#### Home

- Visão de todos os perfis, com status de cada um.
- Filtro por perfil.
- Lista dos próximos cuidados.

#### Histórico

- Histórico por perfil, com horário previsto e horário realizado.

#### Lembretes

- Notificações locais no horário de cada dose, entregues mesmo com o app fechado.
- Não exigem internet nem servidor.
- Tocar na notificação abre o perfil da dose.
- A permissão é pedida ao cadastrar o primeiro medicamento.

#### Identidade visual

- Ícone, splash e ícone de notificação próprios, gerados a partir do logo.
- Paleta verde-azulada, azul-marinho e creme, com modo escuro.
- Ilustrações e ícones em SVG.

#### Acessibilidade

- Contraste WCAG AA em todos os textos.
- Áreas de toque de pelo menos 48px.
- Status sempre com texto ou símbolo, nunca só cor.
- Rótulos para leitores de tela.

### Corrigido

- Doses com horário já passado não aparecem mais na lista "Próximos".

### Limitações conhecidas

- **Lembretes param após 7 dias sem abrir o app.** O app agenda lembretes para os próximos 7 dias. Abrir o app renova essa janela.
- **"Forçar parada" apaga os lembretes.** Isso é uma regra do Android: os lembretes voltam quando o app é aberto de novo.
- **Ainda não existem:** medicamentos SOS, adiamento de dose ("Depois") e recorrências além de horários fixos.
- **A versão web ainda não abre o banco de dados.**

[Não lançado]: https://github.com/osamucadev/dose-care/compare/v1.4.0...HEAD
[1.4.0]: https://github.com/osamucadev/dose-care/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/osamucadev/dose-care/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/osamucadev/dose-care/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/osamucadev/dose-care/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/osamucadev/dose-care/releases/tag/v1.0.0
