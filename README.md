# DoseCare

O DoseCare é um aplicativo mobile para organizar medicamentos e cuidados recorrentes de pessoas, animais e plantas. Ele foi pensado para quem cuida de uma ou várias vidas e precisa entender rapidamente o que demanda atenção, o que vem depois e o que já foi realizado.

A proposta do produto é oferecer uma experiência simples, acolhedora e confiável. O DoseCare ajuda a cuidar, mas não fiscaliza. Por isso, a interface evita linguagem culpabilizante, alertas exagerados e mecanismos de pressão.

> Tudo que você cuida, em um só lugar, no tempo certo.

## Instalação

Baixe o APK da versão mais recente na página de [releases](https://github.com/osamucadev/dose-care/releases) e abra o arquivo no celular Android. Talvez seja preciso permitir a instalação de apps de fontes externas.

O histórico de versões está no [CHANGELOG](./CHANGELOG.md).

## Funcionalidades atuais

O MVP inclui:

- criação e edição de múltiplos perfis;
- perfis para crianças, adultos, idosos, pets e plantas;
- personalização de avatar e cor por perfil;
- exclusão lógica de perfis, preservando seus dados e histórico;
- cadastro e edição de medicamentos de rotina;
- um ou mais horários fixos por medicamento;
- tratamentos contínuos, com data final ou por quantidade de doses programadas;
- ativação e desativação de medicamentos;
- visão agregada de todos os perfis;
- identificação da dose que precisa de atenção agora;
- apresentação da próxima dose, inclusive no dia seguinte;
- registro de doses tomadas ou puladas;
- histórico individual por perfil;
- atualização automática da interface conforme o horário avança;
- lembretes no horário de cada dose, mesmo com o app fechado;
- persistência local e funcionamento offline.

## Princípios do produto

O desenvolvimento do DoseCare segue alguns princípios centrais:

1. A Home deve responder rapidamente quem precisa de cuidado agora.
2. Registrar uma dose deve exigir poucas interações.
3. A interface sempre deve deixar claro quem, o quê, quanto e quando.
4. Esquecer ou pular uma dose não deve parecer uma punição.
5. Alterações futuras em uma rotina não podem reescrever o histórico.
6. Medicamento e ocorrência de dose são conceitos diferentes.
7. O aplicativo deve continuar simples mesmo com vários perfis e medicamentos.

A especificação completa do produto está em [SPEC.md](./SPEC.md). As convenções de desenvolvimento, commits e release estão em [AGENTS.md](./AGENTS.md).

## Tecnologias

- React Native
- Expo SDK 54
- TypeScript com modo estrito
- Expo Router
- Expo SQLite
- React Hook Form
- Zod
- Jest e Jest Expo
- Yarn 1

## Requisitos

Para executar o projeto, você precisa de:

- Node.js em uma versão LTS;
- Yarn 1 (o `yarn.lock` é v1; com um Yarn mais novo instalado, use `npx yarn@1.22.22`);
- Expo Go instalado em um dispositivo Android ou iOS;
- computador e celular conectados à mesma rede local.

Também é possível utilizar um emulador Android ou simulador iOS. O simulador iOS exige macOS com Xcode.

## Executando localmente

O aplicativo está na pasta `mobile`.

```bash
cd mobile
yarn install
yarn expo start
```

Depois que o servidor iniciar, um QR Code será exibido no terminal. No Android, abra o Expo Go e utilize a opção de leitura do QR Code. No iOS, utilize a câmera do sistema.

Caso o aparelho não consiga acessar o servidor pela rede local, tente o modo tunnel:

```bash
yarn expo start --tunnel
```

O modo tunnel costuma ser mais lento e deve ser usado apenas quando a conexão local não funcionar.

## Verificações de qualidade

Dentro de `mobile`, utilize:

```bash
yarn tsc --noEmit
yarn lint
yarn test
```

Esses comandos verificam, respectivamente, os tipos TypeScript, as regras de lint e os testes automatizados.

## Estrutura do repositório

```text
dose-care/
├── README.md
├── SPEC.md
└── mobile/
    ├── app/
    ├── assets/
    ├── components/
    ├── database/
    ├── domain/
    ├── features/
    ├── hooks/
    ├── services/
    ├── theme/
    └── view-models/
```

Responsabilidades principais:

- `mobile/app`: telas e rotas do Expo Router (Views, apenas renderizam);
- `mobile/components`: componentes visuais compartilhados;
- `mobile/database`: conexão SQLite, migrations e repositórios;
- `mobile/domain`: tipos, validações e regras de negócio puras;
- `mobile/features`: componentes organizados por área funcional;
- `mobile/hooks`: integração entre estado React e serviços;
- `mobile/services`: operações da aplicação e acesso aos repositórios;
- `mobile/theme`: tokens e definições visuais;
- `mobile/view-models`: um ViewModel por tela, com o estado pronto para exibir e os comandos, incluindo a navegação.

## Arquitetura

O app segue MVVM:

- **Model**: `domain`, `database`, `services` e os hooks de dados em `hooks` (por exemplo `useDoses`).
- **ViewModel**: hooks em `view-models`, como `useHomeViewModel`. Combinam os dados, derivam o que a tela mostra e expõem comandos (`markTaken`, `openProfile`). A lógica de apresentação com regras fica em funções puras testadas, como `buildHomeDosesState`.
- **View**: as telas em `app` e os componentes em `features` e `components`, que só renderizam.

Uma regra de lint impede que as telas em `app` importem `services`, `database`, `domain`, hooks de dados ou `useRouter`.

## Modelo de dados

A principal decisão arquitetural do DoseCare é separar a configuração de um medicamento das ocorrências e ações relacionadas a cada dose.

```text
Medication
    ↓ gera em memória
DoseOccurrence
    ↓ recebe uma ação
DoseEvent
```

`Medication` representa uma rotina, como Losartana 50 mg todos os dias às 08:00. `DoseOccurrence` representa a dose esperada em uma data e horário específicos. `DoseEvent` registra uma ação efetivamente realizada, como tomada ou pulada.

As ocorrências pendentes são calculadas em tempo de execução. Apenas ações do usuário são persistidas como eventos. Cada evento armazena um snapshot das informações relevantes do medicamento, garantindo que o histórico permaneça compreensível mesmo depois de uma edição ou desativação.

Perfis e medicamentos utilizam exclusão lógica. Seus registros não são removidos fisicamente, preservando a integridade do histórico.

## Datas e horários

Horários programados são armazenados como horário civil local, no formato `YYYY-MM-DDTHH:mm`. Isso representa o horário em que a rotina deve acontecer no aparelho.

Timestamps de auditoria, como criação e registro efetivo de uma dose, são armazenados em UTC no formato ISO 8601. Na interface, eles são convertidos para o horário local do dispositivo.

A Home e a tela do perfil possuem um relógio reativo. A interface é atualizada na virada de cada minuto, ao retornar do background e quando ocorre uma mudança de data local.

## Armazenamento

O MVP utiliza SQLite no próprio aparelho e funciona sem conexão com a internet. O banco é inicializado na primeira abertura e evolui por migrations versionadas.

As telas não executam SQL diretamente. O acesso aos dados passa por repositórios e serviços, mantendo as regras de negócio separadas da interface.

## Próximas funcionalidades

Algumas evoluções previstas são:

- medicamentos de uso SOS;
- adiamento de doses;
- recorrências por intervalo de horas ou dias;
- seleção de dias da semana;
- ciclos de tratamento;
- sincronização entre dispositivos;
- compartilhamento entre cuidadores;
- exportação de histórico;
- relatórios e calendário.

## Responsabilidade e segurança

O DoseCare é uma ferramenta de organização, lembrete e registro. Ele não deve:

- diagnosticar;
- prescrever medicamentos;
- recomendar doses;
- determinar intervalos clinicamente seguros;
- substituir orientação médica, veterinária ou de outro profissional responsável.

As informações configuradas no aplicativo são fornecidas pelo próprio usuário ou cuidador com base nas orientações que recebeu.

## Status do projeto

O projeto está em desenvolvimento ativo. O foco atual é validar o fluxo principal em dispositivos reais, fortalecer as regras de recorrência e evoluir o MVP de forma incremental sem comprometer a rastreabilidade do histórico.
