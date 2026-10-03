# Changelog

Todas as mudanças relevantes do DoseCare são registradas aqui.

O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto usa [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não lançado]

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

[Não lançado]: https://github.com/osamucadev/dose-care/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/osamucadev/dose-care/releases/tag/v1.0.0
