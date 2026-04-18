import { useState, useEffect, useCallback } from 'react'
import { Task, Meeting } from '../types'

// Dados de exemplo para rodar no browser (sem Electron)
const DEMO_TASKS: Task[] = [
  { id: '1', text: 'Revisar proposta do cliente', done: false, tag: 'urgente', createdAt: Date.now() },
  { id: '2', text: 'Enviar relatório semanal', done: true, tag: 'trabalho', createdAt: Date.now() },
  { id: '3', text: 'Comprar ingredientes para o jantar', done: false, tag: 'pessoal', createdAt: Date.now() },
]

const DEMO_MEETINGS: Meeting[] = [
  { id: '1', title: 'Sync semanal de produto', time: '14:00', duration: 60, link: 'https://meet.google.com', createdAt: Date.now() },
  { id: '2', title: '1:1 com o gestor', time: '17:30', duration: 30, link: 'https://zoom.us', createdAt: Date.now() },
]

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function useStore() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loaded, setLoaded] = useState(false)

  const api = window.electronAPI

  // ── Carrega dados ao iniciar ──────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      if (api) {
        const [t, m] = await Promise.all([api.getTasks(), api.getMeetings()])
        setTasks(t)
        setMeetings(m)
      } else {
        // Modo browser: usa dados de demonstração
        setTasks(DEMO_TASKS)
        setMeetings(DEMO_MEETINGS)
      }
      setLoaded(true)
    }
    load()
  }, [])

  // ── Tarefas ───────────────────────────────────────────────────────────────
  const toggleTask = useCallback(async (id: string) => {
    const updated = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t)
    setTasks(updated)
    await api?.saveTasks(updated)
  }, [tasks, api])

  const addTask = useCallback(async (text: string, tag: Task['tag']) => {
    const newTask: Task = { id: generateId(), text, done: false, tag, createdAt: Date.now() }
    const updated = [...tasks, newTask]
    setTasks(updated)
    await api?.saveTasks(updated)
  }, [tasks, api])

  const deleteTask = useCallback(async (id: string) => {
    const updated = tasks.filter(t => t.id !== id)
    setTasks(updated)
    await api?.saveTasks(updated)
  }, [tasks, api])

  const updateTask = useCallback(async (id: string, changes: Partial<Task>) => {
    const updated = tasks.map(t => t.id === id ? { ...t, ...changes } : t)
    setTasks(updated)
    await api?.saveTasks(updated)
  }, [tasks, api])

  // ── Reuniões ──────────────────────────────────────────────────────────────
  const addMeeting = useCallback(async (data: Omit<Meeting, 'id' | 'createdAt'>) => {
    const newMeeting: Meeting = { ...data, id: generateId(), createdAt: Date.now() }
    const updated = [...meetings, newMeeting].sort((a, b) => a.time.localeCompare(b.time))
    setMeetings(updated)
    await api?.saveMeetings(updated)
  }, [meetings, api])

  const deleteMeeting = useCallback(async (id: string) => {
    const updated = meetings.filter(m => m.id !== id)
    setMeetings(updated)
    await api?.saveMeetings(updated)
  }, [meetings, api])

  const updateMeeting = useCallback(async (id: string, changes: Partial<Meeting>) => {
    const updated = meetings.map(m => m.id === id ? { ...m, ...changes } : m)
    setMeetings(updated)
    await api?.saveMeetings(updated)
  }, [meetings, api])

  return {
    tasks,
    meetings,
    loaded,
    toggleTask,
    addTask,
    deleteTask,
    updateTask,
    addMeeting,
    deleteMeeting,
    updateMeeting,
  }
}
