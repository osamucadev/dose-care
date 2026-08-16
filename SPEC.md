# DoseCare — Especificação Completa do Produto

> **Versão:** 1.0
> **Tipo:** Aplicação Web Responsiva
> **Objetivo:** Gestão simples, humana e confiável de medicamentos e cuidados recorrentes ou esporádicos para múltiplos seres vivos.

---

# 1. Visão do produto

## 1.1 Conceito

O **DoseCare** é uma aplicação de gestão de cuidados que permite ao usuário acompanhar medicamentos e rotinas de **uma ou várias pessoas, animais e plantas**.

O sistema não é centrado exclusivamente no usuário. O conceito principal é:

> **Uma pessoa cuida de várias vidas. O DoseCare organiza tudo em um só lugar.**

Um usuário pode, por exemplo, cadastrar:

* Joãozinho — criança
* Tia — adulto
* Florita — idosa
* Nino — pet
* Horta — planta

Cada perfil possui sua própria rotina, medicamentos, cuidados e histórico.

---

# 2. Princípio central

## "O DoseCare ajuda a cuidar. Não fiscaliza."

O produto deve transmitir:

* tranquilidade
* confiança
* simplicidade
* acolhimento
* organização
* segurança

O usuário nunca deve sentir que está sendo punido por esquecer uma dose.

Evitar:

* linguagem culpabilizante
* excesso de notificações
* gamificação agressiva
* rankings
* streaks
* mensagens alarmistas
* excesso de informações médicas

---

# 3. Público-alvo

O DoseCare deve funcionar para pessoas com diferentes níveis de familiaridade tecnológica.

## Principais usuários

### Usuário individual

Pessoa que administra seus próprios medicamentos.

### Cuidador familiar

Pessoa responsável por:

* filhos
* pais
* avós
* familiares dependentes

### Cuidador de animais

Pessoa que administra:

* medicamentos
* tratamentos
* cuidados recorrentes

### Pessoa responsável por plantas

Pessoa que deseja controlar:

* rega
* fertilização
* tratamentos
* cuidados periódicos

---

# 4. Conceito de Perfil

O elemento central do sistema é o **Perfil**.

Um perfil representa qualquer ser vivo que recebe cuidados.

## Tipos de perfil

O sistema deve inicialmente suportar:

* Criança
* Adulto
* Idoso
* Pet
* Planta

O sistema deve ser construído de maneira que novos tipos possam ser adicionados futuramente.

---

# 5. Dados do Perfil

Cada perfil deve possuir:

* `id`
* nome
* tipo
* avatar
* cor temática
* data de criação
* observações opcionais
* status
* medicamentos de rotina
* medicamentos SOS
* histórico

## Exemplo

```text
Nome: Joãozinho
Tipo: Criança
Avatar: 👶
Cor: Amarelo suave
```

---

# 6. Identidade visual dos perfis

Cada tipo possui uma identidade visual própria.

## Criança

* amarelo suave
* ícone/avatar infantil

## Adulto

* azul suave
* avatar adulto

## Idoso

* lilás/roxo suave
* avatar de pessoa idosa

## Pet

* verde suave
* pata ou avatar do animal

## Planta

* verde natural
* folha/planta

As cores devem ser usadas com moderação:

* bordas
* pequenos detalhes
* badges
* ícones
* fundos muito suaves

Evitar transformar a interface em um carnaval de cores.

---

# 7. Estrutura geral da aplicação

O sistema deve possuir, no mínimo:

1. Home / Dashboard
2. Perfil
3. Cadastro de medicamento
4. Edição de medicamento
5. Registro de dose SOS
6. Histórico
7. Configurações

---

# 8. HOME — Dashboard

## 8.1 Objetivo

A Home responde rapidamente:

> **"O que precisa da minha atenção agora?"**

Ela deve apresentar informações agregadas de todos os perfis.

---

# 9. Header da Home

O cabeçalho deve ser simples e persistente.

## Desktop

```text
[ Dose Care ]       [ Data ]       [ ⚙ ] [ Avatar ]
```

## Elementos

### Logo

**Dose Care**

A identidade deve ser suave, moderna e acolhedora.

### Data

Exemplo:

```text
Seg, 28 de jan
```

### Configurações

Ícone de engrenagem.

### Avatar do usuário

Foto ou avatar do cuidador.

---

# 10. Seletor de perfis

Logo abaixo do header deve existir uma navegação horizontal.

Exemplo:

```text
[ Todos ] [ 👶 Joãozinho ] [ 🧑 Tia ] [ 👵 Florita ] [ 🐾 Nino ] [ 🌿 Horta ]
```

## Comportamento

### Todos

Exibe a visão agregada.

### Perfil específico

Ao selecionar um perfil, a Home pode filtrar os cuidados daquele perfil.

No mobile:

* scroll horizontal
* chips não devem quebrar em várias linhas

---

# 11. Card "Agora"

É o principal elemento da Home.

Deve mostrar o cuidado que exige atenção imediata.

Exemplo:

```text
AGORA · 08:00

Florita
Losartana 50 mg

[ ✓ Tomado ] [ ◷ Depois ] [ × Pular ]
```

## Informações

* perfil
* avatar
* medicamento
* dose
* horário
* status

## Ações

### Tomado

Registra a dose como tomada.

### Depois

Adia a dose.

### Pular

Marca aquela ocorrência como pulada.

---

# 12. Card "Próximo"

Logo abaixo do cuidado atual, apresentar o próximo cuidado relevante.

Exemplo:

```text
PRÓXIMO

🐾 Nino
08:40
Remédio de pulga
```

Isso dá ao usuário uma visão imediata do que vem depois sem sobrecarregar a tela.

---

# 13. Cards de Perfis

A Home deve apresentar um conjunto de cards, um para cada perfil.

Exemplo:

```text
┌──────────────────┐
│ 👶               │
│                  │
│ Joãozinho        │
│                  │
│ ● Agora          │
│ Próximo: 12:00   │
└──────────────────┘
```

Outro:

```text
┌──────────────────┐
│ 🧑               │
│                  │
│ Tia              │
│                  │
│ ✓ Tudo ok        │
│ Próximo: 20:00   │
└──────────────────┘
```

Outro:

```text
┌──────────────────┐
│ 👵               │
│                  │
│ Florita          │
│                  │
│ ● Agora          │
│ Próximo: 20:00   │
└──────────────────┘
```

Outro:

```text
┌──────────────────┐
│ 🐾               │
│                  │
│ Nino             │
│                  │
│ Próximo: 08:40   │
└──────────────────┘
```

## Informações possíveis

Cada card deve mostrar:

* avatar
* nome
* status atual
* próximo cuidado

Status:

* Tudo ok
* Agora
* Próximo
* Nenhum cuidado hoje

---

# 14. Ação "Adicionar Perfil"

Depois dos cards de perfil:

```text
[ + Adicionar Perfil ]
```

Ao clicar:

1. escolher tipo
2. definir nome
3. escolher avatar
4. escolher/confirmar cor
5. salvar

---

# 15. Lista "Próximos"

A Home deve possuir uma lista agregada dos próximos cuidados.

Não deve ser chamada de "Lista de hoje", pois o conceito é temporal.

Título:

```text
Próximos
```

Exemplo:

```text
Florita · 08:00 · Losartana 50 mg
Nino · 08:40 · Remédio
Joãozinho · 12:00 · Vitamina
Horta · 17:00 · Regar
Tia · 20:00 · Sinvastatina
```

## Quantidade

Mostrar aproximadamente:

* 5 itens no desktop
* 5 itens no mobile, com possibilidade de expandir

---

# 16. Clique em um Perfil

Ao clicar no card de Joãozinho:

```text
Home
  ↓
Perfil Joãozinho
```

A tela passa a mostrar **somente os cuidados de Joãozinho**.

---

# 17. TELA DE PERFIL

## Objetivo

Permitir administrar tudo relacionado a um perfil.

Exemplo:

```text
←

      👶 Joãozinho
         Perfil

Agora
Rotina
SOS
Histórico
```

---

# 18. Header do Perfil

Elementos:

* botão voltar
* avatar
* nome
* tipo
* botão editar perfil

Exemplo:

```text
←     👶 Joãozinho          ✎
           Criança
```

---

# 19. Card "Agora / Próximo"

Mostrar o próximo medicamento de rotina daquele perfil.

Exemplo:

```text
Agora · 12:00

💊 Vitamina
12:00

[ ✓ Tomado ]
[ ◷ Depois ]
[ × Pular ]
```

Se não houver medicamento pendente:

```text
Tudo certo por aqui 🌿

Próximo cuidado:
20:00 · Vitamina
```

---

# 20. Medicamentos de Rotina

Título:

```text
Rotina
```

Cada medicamento recorrente aparece como um card.

Exemplo:

```text
┌──────────────────────────────────────┐
│ 💊 Vitamina                          │
│    12:00                             │
│                                      │
│                  [Editar] [Excluir]  │
└──────────────────────────────────────┘
```

Outro:

```text
┌──────────────────────────────────────┐
│ 💊 Omeprazol 20 mg                   │
│    07:00 · Tomado                    │
│                                      │
│                  [Editar] [Excluir]  │
└──────────────────────────────────────┘
```

---

# 21. Botão de Rotina

O botão deve ficar claramente associado à seção.

```text
[ + Adicionar medicamento (Rotina) ]
```

Esse botão cria somente medicamentos recorrentes.

---

# 22. Medicamentos SOS

Título:

```text
SOS
```

Descrição:

> Medicamentos de uso esporádico não geram lembretes. Registre cada dose quando ela for utilizada.

Exemplo:

```text
┌──────────────────────────────────────┐
│ 🌙 Calmante                          │
│ Uso esporádico                       │
│                                      │
│                    [Registrar dose]  │
└──────────────────────────────────────┘
```

---

# 23. Botão de SOS

Após a lista:

```text
[ + Adicionar medicamento (SOS) ]
```

Esse botão deve criar um medicamento sem recorrência.

---

# 24. Registrar dose SOS

Ao clicar em:

```text
Registrar dose
```

abrir uma pequena janela/modal.

## Conteúdo

```text
Registrar dose

Calmante

Quando?
(•) Agora
( ) Outro horário

Quantidade
[             ]

Observação
[             ]

[ Cancelar ] [ Registrar ]
```

---

# 25. Regra de intervalo mínimo

Um medicamento SOS pode possuir uma configuração opcional:

```text
Intervalo mínimo entre doses:
[ 6 ] horas
```

Ao registrar uma dose antes desse intervalo:

```text
Atenção

A última dose foi registrada há 3 horas.

O intervalo mínimo configurado é de 6 horas.

Deseja registrar mesmo assim?

[ Cancelar ] [ Registrar ]
```

## Importante

Isso é um **alerta**, não uma prescrição.

O DoseCare não deve assumir que sabe qual intervalo é clinicamente correto.

O intervalo deve ser definido pelo usuário/cuidador conforme a orientação recebida.

---

# 26. Histórico do Perfil

Título:

```text
Histórico
```

O histórico deve registrar:

* medicamentos de rotina
* medicamentos SOS
* cuidados
* data
* hora
* quantidade
* observações
* status

---

# 27. Exemplo de histórico

```text
SOS · Calmante
Hoje · 08:15
Crise de ansiedade

Rotina · Omeprazol 20 mg
Hoje · 07:00
Tomado

Rotina · Omeprazol 20 mg
Ontem · 07:00
Tomado
```

---

# 28. Cadastro de Medicamento

A tela de cadastro deve começar permitindo escolher o tipo:

```text
Cadastrar medicamento

[ 💊 Rotina ] [ 🌙 SOS ]
```

A seleção define o restante do formulário.

---

# 29. Informações básicas

Campos:

### Nome

Obrigatório.

Exemplo:

```text
Losartana
```

### Dosagem

Opcional dependendo do tipo de cuidado.

Exemplo:

```text
50 mg
```

### Quantidade por dose

Exemplo:

```text
1 comprimido
```

### Observações

Campo opcional.

---

# 30. Cadastro de medicamento de Rotina

Após os dados básicos, o usuário escolhe a frequência.

O DoseCare deve suportar múltiplas formas de recorrência.

---

# 31. Tipo de recorrência — Intervalo de horas

Exemplo:

```text
A cada [ 8 ] horas
```

Possibilidade de configurar:

* 4h
* 6h
* 8h
* 12h
* 24h
* valor personalizado

Também deve permitir definir:

```text
Primeira dose:
08:00
```

---

# 32. Horários fixos

Permitir definir horários específicos.

Exemplo:

```text
Horários

08:00
14:00
20:00

[ + Adicionar horário ]
```

Ideal para medicamentos tomados sempre nos mesmos horários.

---

# 33. Dias da semana

Permitir selecionar dias.

```text
Qu  Se  Te  Qa  Qi  Se  Do
□   ✓   □   ✓   □   □   □
```

Exemplo:

```text
Segunda, quarta e sexta
```

---

# 34. Intervalo em dias

Permitir:

```text
A cada [ 2 ] dias
```

ou:

```text
A cada [ 7 ] dias
```

Com data de referência:

```text
Começar em:
14/08/2026
```

---

# 35. Dias alternados

Atalho para:

```text
A cada 2 dias
```

Exemplo:

```text
Dia 14
Dia 16
Dia 18
Dia 20
...
```

---

# 36. Ciclos

O sistema deve suportar tratamentos com ciclos.

Exemplo:

```text
Tomar por 7 dias
Pausar por 3 dias
Repetir
```

Outro exemplo:

```text
Tomar por 21 dias
Pausar por 7 dias
```

---

# 37. Data de início

Todo medicamento de rotina deve permitir:

```text
Início:
14/08/2026
```

Por padrão, utilizar a data atual.

---

# 38. Data de término

Todo medicamento de rotina possui uma modalidade de término:

```text
Duração do tratamento:
( ) Contínuo
( ) Até uma data
( ) Por quantidade de doses
```

Contínuo (padrão):

```text
Término:
[ sem data de término ]
```

Até uma data:

```text
Até:
30/08/2026
```

Por quantidade de doses:

```text
Quantidade de doses:
[ 10 ]
```

Isso permite representar tratamentos contínuos ou temporários, seja por data final, seja por um número fixo de doses programadas.

---

# 39. Lembretes

Para medicamentos de rotina:

```text
Receber lembrete
[ ✓ ]
```

Permitir configurar:

* lembrete no horário
* lembrete antecipado
* repetição do lembrete

Exemplo:

```text
Lembrar:
10 minutos antes
```

---

# 40. Adiamento

Quando o usuário escolher "Depois":

mostrar opções rápidas:

```text
Lembrar depois

[ 15 min ]
[ 30 min ]
[ 1 hora ]
[ Escolher horário ]
```

O usuário pode alterar o comportamento padrão posteriormente.

---

# 41. Status das doses

Cada ocorrência de uma rotina pode possuir:

* Pendente
* Tomado
* Adiado
* Pulado

Uma ocorrência não deve alterar permanentemente a configuração do medicamento.

Exemplo:

O medicamento continua sendo diário mesmo que a dose de hoje seja pulada.

---

# 42. Medicamento SOS

Um medicamento SOS possui:

* nome
* dosagem
* quantidade
* observação
* intervalo mínimo opcional
* limite opcional
* instruções pessoais opcionais

Não possui:

* horário recorrente
* agenda
* lembrete automático
* pendência

---

# 43. SOS nunca deve aparecer como "atrasado"

Isso é fundamental.

Se Joãozinho possui:

```text
Calmante — SOS
```

e não utiliza durante 30 dias:

**não há nenhuma pendência.**

O medicamento simplesmente permanece disponível para registro.

---

# 44. Histórico SOS

Quando utilizado:

```text
Calmante
14/08/2026 · 22:15
1 comprimido
```

O evento entra no histórico.

---

# 45. Histórico global

Além do histórico de cada perfil, futuramente pode existir um histórico global.

Filtros:

* perfil
* medicamento
* Rotina / SOS
* período
* status

Exemplo:

```text
Todos
├── Joãozinho
├── Tia
├── Florita
├── Nino
└── Horta
```

---

# 46. Notificações

## Rotina

Pode gerar notificações.

Exemplo:

> 💊 Hora da vitamina de Joãozinho.

## SOS

Nunca gera notificação automática.

O SOS só aparece quando o usuário acessa o perfil.

---

# 47. Tom das notificações

Evitar:

> "VOCÊ ESQUECEU O REMÉDIO!"

Preferir:

> "Está na hora da vitamina de Joãozinho."

Depois:

> "A vitamina de Joãozinho ainda está pendente."

E nunca utilizar culpa como mecanismo de retenção.

---

# 48. Responsividade

O DoseCare deve ser pensado como **web app responsivo desde o início**.

## Mobile

Prioridade máxima.

Layout:

```text
Header
↓
Perfis
↓
Agora
↓
Próximo
↓
Cards dos perfis
↓
Adicionar perfil
↓
Próximos cuidados
```

Cards ocupam praticamente toda a largura disponível.

---

# 49. Tablet

Utilizar:

* cards em 2 colunas
* timeline mais espaçosa
* header horizontal

---

# 50. Desktop

Utilizar melhor o espaço horizontal.

Possibilidade:

```text
┌───────────────┬──────────────────────────────┐
│ Perfis        │ Agora                        │
│               │                              │
│ Joãozinho     │ Próximo                      │
│ Tia           │                              │
│ Florita       │ Próximos cuidados            │
│ Nino          │                              │
│ Horta         │                              │
└───────────────┴──────────────────────────────┘
```

A arquitetura visual pode evoluir para um dashboard de duas colunas.

---

# 51. Direção visual

## Estética

O DoseCare deve ser:

* suave
* moderno
* acolhedor
* leve
* orgânico
* acessível

A referência visual das primeiras telas utiliza:

* lilás
* lavanda
* rosa muito suave
* creme
* amarelos suaves
* verdes naturais

---

# 52. Background

Pode utilizar um gradiente extremamente suave.

Exemplo conceitual:

```text
Lavanda
↓
Lilás
↓
Creme
↓
Rosa muito suave
```

Elementos naturais discretos podem aparecer no fundo:

* folhas
* pequenas partículas
* formas orgânicas

Eles nunca devem competir com os dados.

---

# 53. Cards

Características:

* bordas arredondadas
* sombras suaves
* bastante espaço interno
* contraste suficiente
* hierarquia tipográfica clara

Evitar:

* sombras exageradas
* glassmorphism excessivo
* bordas muito fortes
* excesso de decoração

---

# 54. Tipografia

Priorizar fontes modernas e altamente legíveis.

Possibilidades:

* Inter
* Nunito
* Manrope
* system-ui

A escolha final deve considerar acessibilidade e disponibilidade web.

---

# 55. Acessibilidade

O DoseCare deve considerar desde o início:

* contraste adequado
* tamanhos de toque apropriados
* textos legíveis
* navegação por teclado
* estados de foco
* leitores de tela
* labels claros
* não depender somente de cores

Exemplo:

Não usar somente:

```text
🟢 = tomado
```

Também mostrar:

```text
✓ Tomado
```

---

# 56. Modelo de dados conceitual

## User

```text
User
├── id
├── name
├── email
├── avatar
├── settings
└── profiles[]
```

---

## Profile

```text
Profile
├── id
├── userId
├── name
├── type
├── avatar
├── color
├── notes
├── routineMedications[]
├── sosMedications[]
└── history[]
```

---

## Medication

```text
Medication
├── id
├── profileId
├── name
├── dosage
├── quantity
├── notes
├── type
├── schedule
├── reminders
├── safetyRules
├── startDate
├── endDate
├── active
└── createdAt
```

---

# 57. Medication.type

Valores:

```text
routine
sos
```

---

# 58. Schedule

Para rotina:

```text
Schedule
├── type
├── times[]
├── intervalHours
├── intervalDays
├── weekdays[]
├── cycle
├── startDate
└── endDate
```

Tipos possíveis:

```text
fixed_times
interval_hours
weekdays
interval_days
cycle
```

---

# 59. Dose Event

Cada dose efetivamente registrada deve gerar um evento.

```text
DoseEvent
├── id
├── profileId
├── medicationId
├── type
├── scheduledAt
├── takenAt
├── status
├── quantity
├── notes
└── createdAt
```

Status:

```text
taken
skipped
snoozed
```

---

# 60. Regra importante de arquitetura

**Medicamento e dose são entidades diferentes.**

Exemplo:

```text
Omeprazol
```

é o medicamento.

Já:

```text
14/08 às 07:00 — tomado
```

é uma ocorrência/dose.

Isso permite:

* histórico
* adiamento
* doses puladas
* relatórios
* auditoria
* recorrência
* edição futura da rotina

sem destruir o histórico passado.

---

# 61. Segurança e responsabilidade

O DoseCare é uma ferramenta de organização e registro.

Ele **não deve**:

* diagnosticar
* prescrever
* recomendar medicamentos
* determinar doses
* substituir orientação médica/veterinária
* afirmar que uma dose é clinicamente segura

O sistema pode:

* registrar
* lembrar
* organizar
* alertar sobre regras configuradas pelo usuário
* mostrar o histórico

---

# 62. Regra de intervalo mínimo

O usuário pode configurar:

```text
intervalo mínimo = 6 horas
```

Se tentar registrar antes:

```text
Atenção

A última dose foi registrada há 3h.

O intervalo mínimo configurado é de 6h.

[Cancelar] [Registrar mesmo assim]
```

O sistema deve registrar que houve uma tentativa/override somente se isso for definido como requisito futuro; o MVP pode simplesmente registrar a dose confirmada.

---

# 63. Exclusão

Ao excluir um medicamento:

**não apagar automaticamente o histórico.**

O medicamento deve ser marcado como inativo.

Exemplo:

```text
active = false
```

O histórico antigo continua disponível.

Isso é fundamental para manter rastreabilidade.

---

# 64. Edição

Ao editar um medicamento de rotina:

A configuração futura pode ser alterada sem reescrever o passado.

Exemplo:

Antes:

```text
08:00
20:00
```

Depois:

```text
09:00
21:00
```

O histórico anterior permanece:

```text
14/08 · 08:00 · Tomado
13/08 · 08:00 · Tomado
```

---

# 65. Estados da Home

A Home deve considerar pelo menos:

### Nenhum perfil

```text
Comece adicionando quem você cuida.
[ + Adicionar Perfil ]
```

### Perfil sem medicamentos

```text
Joãozinho está cadastrado.

Ainda não há medicamentos.
[ + Adicionar medicamento ]
```

### Tudo em dia

```text
Tudo certo por aqui 🌿
```

### Medicamento agora

```text
Agora · 08:00
```

### Medicamento atrasado

Mostrar de forma clara, mas sem linguagem de culpa.

---

# 66. Estado vazio de Rotina

```text
Nenhum medicamento de rotina.

Medicamentos recorrentes aparecerão aqui
e poderão gerar lembretes.

[ + Adicionar medicamento (Rotina) ]
```

---

# 67. Estado vazio de SOS

```text
Nenhum medicamento SOS.

Cadastre medicamentos de uso esporádico
para poder registrar cada dose quando necessário.

[ + Adicionar medicamento (SOS) ]
```

---

# 68. Navegação

Estrutura inicial:

```text
Home
│
├── Perfil
│   ├── Rotina
│   ├── SOS
│   └── Histórico
│
├── Cadastro de medicamento
│
├── Edição de medicamento
│
├── Registro SOS
│
└── Configurações
```

---

# 69. Fluxo principal

```text
Login
  ↓
Home
  ↓
Selecionar perfil
  ↓
Perfil
  ↓
Ver próximo cuidado
  ↓
Registrar dose
  ↓
Histórico
```

---

# 70. Fluxo de cadastro de rotina

```text
Perfil
 ↓
Adicionar medicamento (Rotina)
 ↓
Nome
 ↓
Dose
 ↓
Frequência
 ↓
Horários
 ↓
Data inicial
 ↓
Data final opcional
 ↓
Lembretes
 ↓
Regras de segurança opcionais
 ↓
Resumo
 ↓
Salvar
```

---

# 71. Fluxo de cadastro SOS

```text
Perfil
 ↓
Adicionar medicamento (SOS)
 ↓
Nome
 ↓
Dose
 ↓
Quantidade
 ↓
Intervalo mínimo opcional
 ↓
Observações
 ↓
Salvar
```

Depois:

```text
Perfil
 ↓
SOS
 ↓
Registrar dose
 ↓
Agora / Outro horário
 ↓
Quantidade
 ↓
Observação
 ↓
Validação de intervalo
 ↓
Confirmar
 ↓
Histórico
```

---

# 72. MVP

O primeiro MVP deve priorizar:

## Perfis

* criar
* editar
* excluir/desativar
* visualizar

## Rotina

* criar
* editar
* excluir/desativar
* horários fixos
* intervalo de horas
* dias da semana
* início/fim
* marcar como tomado
* pular
* adiar

## SOS

* criar
* editar
* excluir/desativar
* registrar dose
* histórico
* intervalo mínimo opcional

## Home

* todos os perfis
* Agora
* Próximo
* cards de perfil
* próximos cuidados

## Histórico

* histórico por perfil
* histórico de rotina
* histórico SOS

---

# 73. Funcionalidades futuras

Depois do MVP:

* notificações push
* compartilhamento de perfil com familiares
* múltiplos cuidadores
* permissões
* histórico global avançado
* exportação PDF/CSV
* relatórios
* calendário
* confirmação por cuidador
* anexar receita/documento
* leitura de embalagem
* integração com calendário
* modo offline
* aplicativo nativo
* acessibilidade avançada
* suporte a novos tipos de seres vivos

---

# 74. Possibilidade de múltiplos cuidadores

Arquitetura futura:

```text
Perfil Joãozinho
├── Samuel — administrador
├── Mãe — cuidador
└── Pai — cuidador
```

Permissões possíveis:

* visualizar
* registrar dose
* editar medicamento
* adicionar medicamento
* excluir medicamento
* administrar perfil

---

# 75. Princípios de UX

## 1. Menos pensamento

O usuário deve saber imediatamente:

> Quem precisa de mim agora?

## 2. Ação rápida

Registrar uma dose deve exigir o mínimo possível de interações.

## 3. Contexto

Sempre mostrar:

* quem
* o quê
* quanto
* quando

## 4. Sem culpa

Esquecer não deve parecer fracasso.

## 5. Histórico confiável

O passado nunca deve ser alterado silenciosamente por mudanças futuras.

## 6. Separação clara

Rotina e SOS são conceitos diferentes.

## 7. Escalabilidade

A interface deve continuar funcionando quando o usuário tiver:

* 1 perfil
* 5 perfis
* 10 perfis
* dezenas de medicamentos

---

# 76. Regra de ouro do produto

O DoseCare deve conseguir responder, em poucos segundos:

> **Quem precisa de cuidado agora?**

> **O que precisa ser feito?**

> **Quando foi feito?**

> **O que vem depois?**

E, no caso de um medicamento SOS:

> **Quando foi a última vez que ele foi usado?**

---

# 77. Identidade do produto

### Nome

**DoseCare**

### Personalidade

* humano
* cuidadoso
* calmo
* confiável
* moderno
* acolhedor

### Frase conceitual

> **Tudo que você cuida, em um só lugar, no tempo certo.**

### Filosofia

> **DoseCare é um lembrete gentil, não um fiscal.**

---

# 78. Resumo da arquitetura

```text
                         DOSECARE
                            │
                 ┌──────────┴──────────┐
                 │                     │
               USER                  HOME
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                 AGORA              PERFIS             PRÓXIMOS
                                       │
              ┌────────┬────────┬─────┴─────┬────────┐
              │        │        │           │        │
           Criança   Adulto    Idoso       Pet    Planta
              │
              ↓
           PERFIL
              │
       ┌──────┼───────┐
       │      │       │
    AGORA   ROTINA   SOS
              │       │
       ┌──────┘       └──────┐
       │                     │
   MEDICAMENTOS          REGISTRAR DOSE
       │                     │
       └──────────┬──────────┘
                  ↓
              HISTÓRICO
```

---

# 79. Princípio técnico mais importante

O sistema deve separar:

**Configuração do cuidado**

de

**Ocorrência do cuidado**

Exemplo:

```text
MEDICAMENTO
Omeprazol 20 mg
Todos os dias às 07:00
```

é a configuração.

Enquanto:

```text
14/08/2026
07:03
Tomado
```

é uma ocorrência.

Essa separação deve existir desde o banco de dados e orientar toda a arquitetura do sistema.

---

# 80. Visão final

O DoseCare não deve parecer um simples "app de alarme de remédio".

Ele é melhor definido como:

> **Uma central pessoal de cuidados.**

Um lugar onde o usuário consegue olhar e entender:

```text
👶 Joãozinho
💊 Próximo às 12:00

🧑 Tia
✓ Tudo certo

👵 Florita
💊 Agora

🐾 Nino
🐾 Próximo às 08:40

🌿 Horta
🌱 Próximo cuidado às 17:00
```

E, quando necessário, entrar em qualquer perfil e responder:

> **O que essa pessoa/animal/planta precisa?**

> **O que já foi feito?**

> **O que vem depois?**

Sem transformar cuidado em cobrança.
