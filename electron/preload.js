const { contextBridge, ipcRenderer } = require('electron')

// Expõe uma API segura para o React acessar funções do Electron
// O React nunca acessa o Node.js diretamente — tudo passa por aqui
contextBridge.exposeInMainWorld('electronAPI', {

  // ── Widget ────────────────────────────────────────────────────────────────
  openPanel: () => ipcRenderer.send('widget-open'),
  closePanel: () => ipcRenderer.send('widget-close'),
  onClosePanel: (cb) => ipcRenderer.on('close-panel', cb),

  // ── Dados ─────────────────────────────────────────────────────────────────
  getTasks: () => ipcRenderer.invoke('get-tasks'),
  getMeetings: () => ipcRenderer.invoke('get-meetings'),
  saveTasks: (tasks) => ipcRenderer.invoke('save-tasks', tasks),
  saveMeetings: (meetings) => ipcRenderer.invoke('save-meetings', meetings),

  // ── Navegação ─────────────────────────────────────────────────────────────
  openMainWindow: () => ipcRenderer.send('open-main-window'),
  minimizeMain: () => ipcRenderer.send('main-minimize'),
  closeMain: () => ipcRenderer.send('main-close'),
})
