# AGENTS.md

Guia para agentes de IA (e pessoas) que trabalham neste repositório. Leia antes de alterar código.

## O projeto

DoseCare é um app mobile (Expo SDK 54, React Native, TypeScript estrito) para organizar medicamentos e cuidados de pessoas, pets e plantas. Tudo roda no aparelho: SQLite local, sem backend, sem contas, funciona offline. O código do app está em `mobile/`.

### Fontes da verdade

- **[SPEC.md](SPEC.md)** define produto, comportamento e fluxos. Em caso de conflito, a SPEC vence.
- **O protótipo visual** (as telas de referência) serve só para a linguagem visual: paleta, avatares, ícones e estilo de cards. Ele não define fluxos nem funcionalidades. Exemplos do que não seguir: ele tira o "Pular", inclui login e pinta o card "Agora" de rosa alarmante.
- **[CHANGELOG.md](CHANGELOG.md)** registra o que cada versão entregou.

### Princípios que valem para todo código e texto

- O app ajuda a cuidar, não fiscaliza. Nada de linguagem de culpa, alarme ou cobrança. Uma dose atrasada é algo a fazer, não uma falha.
- O app organiza e lembra. Ele não diagnostica, não prescreve e não recomenda doses ou intervalos.
- Todo texto de interface é em português do Brasil.

## Comandos

Rode tudo dentro de `mobile/`.

| Para | Comando |
|---|---|
| Instalar dependências | `npx yarn@1.22.22 install --frozen-lockfile` |
| Adicionar dependência | `npx yarn@1.22.22 add <pacote>@<versão>`; para módulos nativos, use a versão de `node_modules/expo/bundledNativeModules.json` |
| Typecheck | `npx tsc --noEmit` |
| Lint | `npx eslint .` |
| Testes | `npx jest` |
| Rodar no Expo Go | `npx expo start` |
| Development build Android | `npx expo run:android` |
| APK de release | `scripts/build-release-apk.sh` (veja [Release](#release)) |

**Use Yarn 1.** O `yarn.lock` é v1. O `yarn` global da máquina pode ser v4, que tenta reescrever o lockfile e cria um `.yarnrc.yml` que não deve ser commitado.

**Typecheck, lint e testes devem passar antes de qualquer commit.**

## Arquitetura (MVVM)

```text
app/            View: telas do Expo Router, apenas renderizam
features/       View: componentes por área (doses, profiles, medications, history, home)
components/ui/  View: componentes visuais compartilhados
view-models/    ViewModel: um hook por tela, com estado pronto para exibir e comandos
hooks/          Model: hooks de dados (useDoses, useProfile...), relógio reativo, travas
services/       Model: operações do app, incluindo lembretes
database/       Model: SQLite, migrations e repositórios
domain/         Model: tipos e regras puras, sem React nem SQLite
theme/, constants/  tokens visuais e paleta
```

- **Telas em `app/` não importam** `services`, `database`, `domain`, hooks de dados nem `useRouter`. Uma regra de lint em `eslint.config.js` garante isso. A tela pega tudo do seu ViewModel.
- **A navegação é um comando do ViewModel** (`openProfile`, `editMedication`...). Não existe Coordinator.
- **Os ViewModels devolvem estados explícitos** (`{ status: 'loading' | 'error' | 'ready', ... }`), para a tela só escolher o que desenhar.
- **Lógica de apresentação com regra vai para funções puras com teste.** Exemplo: `view-models/home-view-state.ts`. O hook do ViewModel só junta as peças.
- **Regra de negócio vai para `domain/`**, em funções puras e testadas.

## Regras de domínio que não podem ser quebradas

1. **Configuração e ocorrência são coisas diferentes.**
   - `Medication` é configuração e fica salva.
   - `DoseOccurrence` é calculada em memória e nunca é salva.
   - `DoseEvent` só existe quando o usuário age (Tomado ou Pulado). É imutável e guarda uma cópia do nome e da dose do medicamento naquele momento.
2. **Editar uma rotina nunca reescreve o histórico.**
   - Na exibição, o histórico usa o nome atual do medicamento e mostra "Registrado como ..." quando o nome do registro é diferente (`domain/history.ts`). A dose exibida é sempre a do registro.
3. **Nada é apagado de verdade.** Perfis e medicamentos só ficam inativos (`active = 0`), e o histórico continua.
4. **Datas:**
   - Horário de dose é hora civil local, no formato `YYYY-MM-DDTHH:mm`.
   - Registro de auditoria é UTC ISO 8601 com `Z`.
   - Use as funções de `domain/datetime.ts` em vez de manipular datas manualmente.
5. **Migrations só acrescentam.**
   - Nunca edite uma migration que já foi publicada. Crie `NNN_descricao.ts` e registre em `database/migrations/index.ts`.
   - Validações que o SQLite não expressa ficam em `domain/validation.ts`, que roda tanto na escrita quanto na leitura.
6. **Medicamento SOS nunca fica pendente nem gera lembrete** (SPEC §43 e §46).
7. **Estoque é derivado, nunca editado.**
   - Cada contagem é uma linha imutável em `stock_counts`.
   - O estoque atual é a última contagem menos as doses `taken` registradas depois dela (`domain/stock.ts`).
   - Dose pulada não consome.
   - O aviso começa em 10% da última contagem (SPEC §81).
8. **Tomado e Pular passam por uma janela de desfazer** (`hooks/pending-dose-action.ts`).
   - A ação é salva em `pending_dose_actions` no instante do toque. Essa tabela não é histórico: desfazer apaga a linha.
   - Ela vira `DoseEvent` ao fim da janela, ao registrar outra dose, quando o app sai do primeiro plano ou perde o foco, e, se o app morreu antes, na próxima abertura (`commitLeftoverDoseActions`).
   - O `occurredAt` é sempre o horário do toque.
   - No Android, o app continua "ativo" na tela de recentes: deslizá-lo para fechar mata o processo sem evento de segundo plano. Por isso a gravação no toque é obrigatória, não um detalhe.
9. **Avatares são sempre ilustrações** (`svg:<chave>`, lista em `components/ui/avatar.tsx`). Não use emojis na interface.

## Testes de banco

`test/node-sqlite.ts` roda as migrations e o SQL dos repositórios num SQLite real em memória (o `node:sqlite` do Node 22), já que o expo-sqlite não roda no Jest. Use isso para testar migrations e consultas novas.

## Interface e acessibilidade

- **Use os tokens:**
  - cores em `constants/theme.ts` (modo claro e escuro);
  - espaçamento, raios e sombra em `theme/tokens.ts`;
  - tons por tipo de perfil em `theme/profile-types.ts`.
  - Não escreva cores fixas nos componentes.
- **Contraste:**
  - texto precisa de pelo menos 4,5:1 contra todos os fundos onde aparece;
  - borda de campo de formulário precisa de 3:1.
  - `theme/__tests__/contrast.test.ts` calcula isso a partir dos tokens. Mudou a paleta? Os testes precisam passar.
- **Área de toque mínima de 48px** (`minTouchTarget`).
- **Estado nunca só por cor:** sempre com texto ou símbolo, e com `accessibilityState` quando for seleção.
- **Pastéis só no modo claro.** No escuro, eles ficam sob texto claro e perdem contraste. Use `hooks/use-profile-surface.ts`.
- **Ícones e ilustrações são SVG** em `assets/svg/`, importados como componentes. Ícones usam `currentColor`. Para mudar arte ou paleta dos SVGs, edite e rode `scripts/generate-svg-assets.py`.
- **Ícone do app, splash, favicon e ícone de notificação** saem de `assets/svg/brand/logo-mark.svg` via `scripts/generate-app-icons.py`. Não edite os PNGs manualmente.

## Lembretes (notificações)

- **Lembretes são uma cópia descartável** das doses pendentes dos próximos 7 dias, mais um aviso diário às 09:00 para cada medicamento com estoque baixo. `syncReminders` cancela tudo e reagenda.
- **Três avisos de renovação** ("abra o app") ficam 3, 2 e 1 dia antes do último lembrete agendado, com vagas reservadas no limite de 60 (`buildReminderSchedule`). Abrir o app reagenda tudo, então quem abre com frequência nunca os vê.
- **Leituras de estoque ficam em `services/stock-queries.ts`,** separadas de `stock-service.ts`, porque o serviço de lembretes depende delas e a escrita de estoque depende do serviço de lembretes.
- **Qualquer escrita que muda doses deve chamar `syncRemindersInBackground()`**, e a falha do lembrete nunca derruba a escrita.
- **Android:**
  - `USE_EXACT_ALARM` garante horário exato;
  - "Forçar parada" apaga os alarmes até o app abrir de novo;
  - a permissão nunca pedida aparece como `denied` com `canAskAgain: true`.
- **Teste com app fechado só funciona em development build ou APK**, não no Expo Go.

## Verificação

- **Mudou algo visível?** Confira de verdade, não só com testes.
- **Emulador:**
  - O AVD `Pixel_8` está em `~/Android/Sdk`.
  - Instale o APK com `adb install`.
  - Use `adb reverse tcp:8081 tcp:8081` para o Metro.
  - Faça capturas com `adb exec-out screencap -p`.
- **Metro:**
  - Não rode com `CI=1`: esse modo desliga o recarregamento e o app fica com código velho.
  - `console.log` do app não aparece no `logcat`.
- **Web:** o build sobe, mas não abre o banco, porque as migrations usam `withExclusiveTransactionAsync`. Serve só para checar layout, com um patch temporário que não pode ser commitado.
- **`expo prebuild`:**
  - gera `android/`, que é ignorado pelo git;
  - reescreve os scripts `android` e `ios` do `package.json`. Não commite essa mudança.

## Commits

- **Commits pequenos:** uma mudança coesa por commit. Se um arquivo mistura duas mudanças, separe em commits diferentes.
- **[Conventional Commits](https://www.conventionalcommits.org/):**
  - formato `tipo(escopo): resumo no imperativo, em inglês e em minúsculas`;
  - tipos usados: `feat`, `fix`, `refactor`, `style`, `build`, `docs`, `chore`, `test`;
  - escopo `mobile` para código do app; sem escopo para arquivos da raiz.
- **O corpo explica o porquê,** não repete o diff.
- **Cada commit precisa passar typecheck, lint e testes sozinho.**
- **Nunca commite** segredos, a keystore, `android/`, `ios/`, `dist/`, `.expo/` ou `.yarnrc.yml`.
- **Commit automático:** ao terminar cada tarefa que altera arquivos, commite sem esperar pedido, seguindo as regras acima. Verifique antes (typecheck, lint, testes e, se mudou algo visível, o app rodando) e só então divida em commits pequenos.
- **Push e releases só quando o mantenedor pedir.** Os commits ficam locais até lá.

## Escrita

- **Nunca use travessão (o caractere U+2014)** em nada que for escrito: código, comentários, commits, documentação, textos da interface e mensagens. Use vírgula, ponto, dois-pontos ou parênteses.
- **Comentários de código em inglês,** explicando o porquê.
- **Documentação do projeto em português do Brasil.**

## Release

O versionamento segue [SemVer](https://semver.org/lang/pt-BR/). Para uma versão nova:

1. **Atualize a versão em três lugares:**
   - `expo.version` no `app.json`;
   - `version` no `package.json`;
   - `expo.android.versionCode` no `app.json` (inteiro, sempre maior que o anterior, senão o Android não instala por cima).
2. **No `CHANGELOG.md`,** mova os itens de "Não lançado" para a versão nova, com a data, e atualize os links no fim do arquivo.
3. **Faça o commit** `chore: release vX.Y.Z` e crie a tag anotada `vX.Y.Z`.
4. **Gere o APK** com `scripts/build-release-apk.sh`. Ele sai em `mobile/dist/dosecare-vX.Y.Z.apk`. O script recusa um APK assinado com a chave de debug.
5. **Faça o push** da branch e da tag. Depois crie a release no GitHub com o APK anexado e as notas da versão:

   ```bash
   gh release create vX.Y.Z mobile/dist/dosecare-vX.Y.Z.apk --title "DoseCare vX.Y.Z" --notes-file <notas>
   ```

### Assinatura

- **O ID do app é `dev.samuelcaetite.dosecare`** (Android e iOS). Não mude: o Android trataria como outro app.
- **O APK é assinado pela chave de upload** em `~/.config/dosecare/dosecare-upload.jks`.
- **As senhas ficam em `~/.config/dosecare/release-signing.env`**, com as variáveis `DOSECARE_UPLOAD_STORE_FILE`, `DOSECARE_UPLOAD_STORE_PASSWORD`, `DOSECARE_UPLOAD_KEY_ALIAS` e `DOSECARE_UPLOAD_KEY_PASSWORD`. Também dá para apontar outro arquivo com `DOSECARE_SIGNING_ENV`.
- **O plugin `plugins/with-release-signing.js`** injeta essa assinatura no Gradle durante o `prebuild`.
- **Os dois arquivos nunca vão para o repositório e precisam de backup.** Sem eles, nenhuma versão futura instala por cima da atual.

### Google Play

- A `USE_EXACT_ALARM` é restrita pela política da Play Store a apps de alarme e calendário. Revise antes de publicar lá.
- A Play Store usa `.aab` (`./gradlew bundleRelease`) em vez de `.apk`.
