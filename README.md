# Agendeiro

Widget de agenda minimalista para o desktop Windows.

---

## O que é o Agendeiro?

O Agendeiro fica discretamente na borda direita da tela como uma pequena pílula com o texto "Agenda". Ao clicar nela, um painel desliza mostrando suas tarefas e reuniões do dia. Clicar fora fecha automaticamente. Também tem um app de configurações completo acessível pelo ícone na bandeja do sistema (próximo ao relógio).

---

## Pré-requisitos (instale antes de tudo)

### 1. Node.js
O Node.js é o motor que roda o projeto. Sem ele, nada funciona.

- Acesse: https://nodejs.org
- Baixe a versão **LTS** (a recomendada, fica no botão verde maior)
- Instale normalmente (next, next, finish)
- Para verificar se instalou certo, abra o **Prompt de Comando** e digite:
  ```
  node --version
  ```
  Deve aparecer algo como `v20.x.x`

### 2. Git (opcional, mas recomendado)
Serve para baixar e versionar o código. Se não quiser instalar, você pode simplesmente copiar a pasta do projeto.

- Acesse: https://git-scm.com
- Baixe e instale com as opções padrão

---

## Como instalar e rodar o projeto

### Passo 1 — Abra o terminal na pasta do projeto

Navegue até a pasta `agendeiro` que você extraiu/baixou.  
Clique com o botão direito dentro da pasta → **"Abrir no Terminal"** (Windows 10/11).

Ou abra o Prompt de Comando e navegue:
```
cd C:\Users\SeuNome\Desktop\agendeiro
```

### Passo 2 — Instale as dependências

Este comando baixa tudo que o projeto precisa (Electron, React, etc.):
```
npm install
```

Aguarde terminar. Vai criar uma pasta chamada `node_modules`. Isso é normal.

### Passo 3 — Rode em modo de desenvolvimento

```
npm run dev
```

Isso vai:
1. Iniciar o servidor React (Vite) na porta 5173
2. Esperar ele ficar pronto
3. Abrir o Electron com o widget e a janela principal

O widget vai aparecer na borda direita da tela imediatamente.

> **Dica:** Em modo dev, o app atualiza automaticamente quando você salva qualquer arquivo de código.

### Passo 4 — Gerar o instalador para Windows (opcional)

Quando quiser distribuir o app:
```
npm run build
```

Vai gerar um instalador `.exe` dentro da pasta `release/`. Basta executar esse arquivo em qualquer PC com Windows 10 ou 11.

---

## Como usar o app

### Widget (painel lateral)
- A pílula "Agenda" fica colada na borda direita da tela, quase invisível
- O pontinho vermelho aparece quando há tarefas pendentes
- **Clique na pílula** → o painel desliza
- **Clique em uma tarefa** → risca/desmarca
- **Clique fora do painel** → fecha automaticamente
- **"gerenciar agenda"** → abre o app de configurações

### App de configurações
- Acessível pelo ícone na **bandeja do sistema** (ao lado do relógio, canto inferior direito)
- Clique com botão direito no ícone → "Abrir configurações"
- Ou clique no botão "gerenciar agenda" no widget
- Aqui você pode adicionar, remover e visualizar tarefas e reuniões

### Adicionar uma tarefa
1. Abra o app de configurações
2. Certifique-se de estar na aba "tarefas"
3. Clique em **+ adicionar**
4. Digite o texto e escolha a categoria (trabalho, pessoal, urgente, outro)
5. Pressione Enter ou clique "adicionar"

### Adicionar uma reunião
1. Vá para a aba "reuniões"
2. Clique em **+ adicionar**
3. Preencha: título, horário, duração e link (Meet, Zoom, Teams, etc.)
4. Clique "adicionar"

---

## Estrutura de arquivos explicada

```
agendeiro/
│
├── electron/                   ← Código do Electron (processo principal)
│   ├── main.js                 ← Cria as janelas, tray, gerencia IPC
│   └── preload.js              ← Ponte segura entre Electron e React
│
├── src/                        ← Código React (interface visual)
│   ├── components/
│   │   ├── Widget.tsx          ← A pílula + painel lateral
│   │   ├── Widget.css          ← Estilos do widget
│   │   ├── MainApp.tsx         ← App de configurações completo
│   │   └── MainApp.css         ← Estilos do app principal
│   ├── store/
│   │   └── useStore.ts         ← Gerencia dados (tarefas e reuniões)
│   ├── types/
│   │   └── index.ts            ← Tipos TypeScript compartilhados
│   ├── App.tsx                 ← Decide qual tela mostrar (#widget ou #main)
│   └── main.tsx                ← Ponto de entrada do React
│
├── assets/                     ← Ícones do app
├── index.html                  ← HTML base do Vite
├── vite.config.ts              ← Configuração do bundler
├── tsconfig.json               ← Configuração do TypeScript
└── package.json                ← Dependências e scripts
```

---

## Como os dados são salvos

Os dados ficam salvos localmente no seu computador em:
```
C:\Users\SeuNome\AppData\Roaming\agendeiro\config.json
```

Não precisam de internet. Não vão para nenhum servidor. São só seus.

---

## Solução de problemas comuns

**"npm não é reconhecido como comando"**
→ O Node.js não foi instalado corretamente. Reinstale pelo site nodejs.org e reinicie o terminal.

**O widget não aparece na tela**
→ Verifique se o Electron abriu sem erros no terminal. Em dev, o DevTools abre automaticamente — feche-o e o widget estará na borda direita.

**"Erro ao instalar dependências"**
→ Verifique sua conexão com a internet e rode `npm install` novamente.

**O instalador não gera**
→ Rode `npm run build` com o terminal em modo administrador.
