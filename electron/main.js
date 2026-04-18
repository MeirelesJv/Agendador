const { app, BrowserWindow, Tray, Menu, ipcMain, screen, nativeImage } = require('electron')
const path = require('path')
const Store = require('electron-store')

// ─── Persistência de dados ───────────────────────────────────────────────────
const store = new Store({
  defaults: {
    tasks: [
      { id: '1', text: 'Revisar proposta do cliente', done: false, tag: 'urgente', createdAt: Date.now() },
      { id: '2', text: 'Enviar relatório semanal', done: true, tag: 'trabalho', createdAt: Date.now() },
      { id: '3', text: 'Comprar ingredientes para o jantar', done: false, tag: 'pessoal', createdAt: Date.now() }
    ],
    meetings: [
      { id: '1', title: 'Sync semanal de produto', time: '14:00', duration: 60, link: 'https://meet.google.com', createdAt: Date.now() },
      { id: '2', title: '1:1 com o gestor', time: '17:30', duration: 30, link: 'https://zoom.us', createdAt: Date.now() }
    ]
  }
})

const isDev = process.env.NODE_ENV === 'development'

// Dimensões da pílula fechada
const PILL_W = 90
const PILL_H = 34

let widgetWindow = null
let mainWindow = null
let tray = null

// ─── Janela do Widget (painel lateral) ───────────────────────────────────────
function createWidgetWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  widgetWindow = new BrowserWindow({
    width: PILL_W,
    height: PILL_H,
    x: width - PILL_W,
    y: Math.round((height - PILL_H) / 2), // centraliza verticalmente na work area
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    alwaysOnTop: false,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    focusable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  const url = isDev
    ? 'http://localhost:5173/#widget'
    : `file://${path.join(__dirname, '../dist/index.html')}#widget`

  widgetWindow.loadURL(url)

  // Fecha o painel ao perder o foco (clique fora)
  widgetWindow.on('blur', () => {
    widgetWindow.webContents.send('close-panel')
  })

  if (isDev) {
    widgetWindow.webContents.openDevTools({ mode: 'detach' })
  }
}

// ─── Janela Principal (configurações) ────────────────────────────────────────
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 650,
    minWidth: 700,
    minHeight: 500,
    frame: false,
    transparent: false,
    backgroundColor: '#141418',
    titleBarStyle: 'hidden',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  const url = isDev
    ? 'http://localhost:5173/#main'
    : `file://${path.join(__dirname, '../dist/index.html')}#main`

  mainWindow.loadURL(url)

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// ─── Ícone na bandeja do sistema (System Tray) ───────────────────────────────
function createTray() {
  // Ícone simples gerado como imagem nativa (substitua por assets/icon.png)
  const icon = nativeImage.createFromDataURL(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAAR0lEQVRYhe3OMQoAIAxD0fT+h+4uDkKhUHT0LyH4yJBERERERERERERERERERERERERERERERERERERERERERERE5C8HfxU4AfgAOjAAAAAASUVORK5CYII='
  )

  tray = new Tray(icon)
  tray.setToolTip('Agendeiro')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Abrir configurações',
      click: () => {
        if (!mainWindow) createMainWindow()
        else mainWindow.focus()
      }
    },
    { type: 'separator' },
    {
      label: 'Sair',
      click: () => app.quit()
    }
  ])

  tray.setContextMenu(contextMenu)

  tray.on('click', () => {
    if (!mainWindow) createMainWindow()
    else mainWindow.focus()
  })
}

// ─── IPC: comunicação entre Electron e React ─────────────────────────────────

// Widget pede para expandir → janela cresce para o painel completo
ipcMain.on('widget-open', () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  widgetWindow.setBounds({ x: width - 280, y: 0, width: 280, height }, { animate: false })
  widgetWindow.focus()
})

// Widget pede para fechar → janela volta ao tamanho da pílula
ipcMain.on('widget-close', () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  widgetWindow.setBounds({
    x: width - PILL_W,
    y: Math.round((height - PILL_H) / 2),
    width: PILL_W,
    height: PILL_H
  }, { animate: false })
})

// Leitura de dados
ipcMain.handle('get-tasks', () => store.get('tasks'))
ipcMain.handle('get-meetings', () => store.get('meetings'))

// Escrita de dados
ipcMain.handle('save-tasks', (_, tasks) => { store.set('tasks', tasks); return true })
ipcMain.handle('save-meetings', (_, meetings) => { store.set('meetings', meetings); return true })

// Abrir app principal pelo widget
ipcMain.on('open-main-window', () => {
  if (!mainWindow) createMainWindow()
  else mainWindow.focus()
})

// Controles da janela principal (minimizar, fechar)
ipcMain.on('main-minimize', () => mainWindow?.minimize())
ipcMain.on('main-close', () => mainWindow?.close())

// ─── Inicialização ────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  createWidgetWindow()
  createTray()
})

app.on('window-all-closed', () => {
  // No Windows/Linux, mantém o app rodando no tray mesmo sem janelas abertas
  if (process.platform === 'darwin') app.quit()
})

app.on('activate', () => {
  if (!widgetWindow) createWidgetWindow()
})
