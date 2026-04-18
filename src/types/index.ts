export interface Task {
  id: string
  text: string
  done: boolean
  tag: 'trabalho' | 'pessoal' | 'urgente' | 'outro'
  createdAt: number
}

export interface Meeting {
  id: string
  title: string
  time: string        // formato "HH:MM"
  duration: number    // minutos
  link: string
  createdAt: number
}

// Estende o objeto window global para incluir a API do Electron
declare global {
  interface Window {
    electronAPI?: {
      openPanel: () => void
      closePanel: () => void
      onClosePanel: (cb: () => void) => void
      getTasks: () => Promise<Task[]>
      getMeetings: () => Promise<Meeting[]>
      saveTasks: (tasks: Task[]) => Promise<boolean>
      saveMeetings: (meetings: Meeting[]) => Promise<boolean>
      openMainWindow: () => void
      minimizeMain: () => void
      closeMain: () => void
    }
  }
}
