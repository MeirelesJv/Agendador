import { useState, useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'
import { Task, Meeting } from '../types'
import './Widget.css'

// ─── Sub-componente: Pílula (aba lateral) ─────────────────────────────────────
function Pill({ hasPending, onClick }: { hasPending: boolean; onClick: () => void }) {
  return (
    <div className="pill" onClick={onClick}>
      {hasPending && <div className="pill-dot" />}
      <span className="pill-text">Agenda</span>
    </div>
  )
}

// ─── Sub-componente: Item de Reunião ──────────────────────────────────────────
function MeetingCard({ meeting }: { meeting: Meeting }) {
  const endTime = (() => {
    const [h, m] = meeting.time.split(':').map(Number)
    const total = h * 60 + m + meeting.duration
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
  })()

  return (
    <div className="meet-card">
      <div className="meet-time">{meeting.time} — {endTime}</div>
      <div className="meet-title">{meeting.title}</div>
      {meeting.link && (
        <a
          className="meet-link"
          href={meeting.link}
          target="_blank"
          rel="noreferrer"
          onClick={e => { e.stopPropagation() }}
        >
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
            <path d="M1 5h8M6 2l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          entrar
        </a>
      )}
    </div>
  )
}

// ─── Sub-componente: Item de Tarefa ───────────────────────────────────────────
function TaskItem({ task, onToggle }: { task: Task; onToggle: (id: string) => void }) {
  const tagClass: Record<Task['tag'], string> = {
    urgente: 'tag-u',
    trabalho: 'tag-w',
    pessoal: 'tag-p',
    outro: 'tag-o',
  }

  return (
    <div className={`task-item ${task.done ? 'done' : ''}`} onClick={() => onToggle(task.id)}>
      <div className="task-box">
        {task.done && (
          <svg width="8" height="7" viewBox="0 0 8 7" fill="none">
            <path d="M1 3.5L3 5.5L7 1" stroke="rgba(255,255,255,0.65)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <span className="task-label">{task.text}</span>
      <span className={`task-tag ${tagClass[task.tag]}`}>{task.tag}</span>
    </div>
  )
}

// ─── Componente Principal do Widget ───────────────────────────────────────────
function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function Widget() {
  const [isOpen, setIsOpen] = useState(false)
  const { tasks, meetings, loaded, toggleTask } = useStore()
  const panelRef = useRef<HTMLDivElement>(null)

  const today = todayStr()
  const todayTasks = tasks.filter(t => !t.date || t.date === today)
  const todayMeetings = meetings.filter(m => !m.date || m.date === today)

  const pendingCount = todayTasks.filter(t => !t.done).length
  const doneCount = todayTasks.filter(t => t.done).length
  const progressPct = todayTasks.length ? Math.round((doneCount / todayTasks.length) * 100) : 0

  // Data de hoje formatada
  const now = new Date()
  const dayName = now.toLocaleDateString('pt-BR', { weekday: 'long' })
  const dateStr = now.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })

  // Abre o painel e notifica o Electron para expandir a janela
  function openPanel() {
    setIsOpen(true)
    window.electronAPI?.openPanel()
  }

  // Fecha o painel e notifica o Electron para encolher a janela
  function closePanel() {
    setIsOpen(false)
    window.electronAPI?.closePanel()
  }

  // Escuta o evento de fechamento vindo do Electron (blur da janela)
  useEffect(() => {
    window.electronAPI?.onClosePanel(() => closePanel())
  }, [])

  // Fecha ao clicar fora do painel (modo browser/dev)
  useEffect(() => {
    if (!isOpen) return
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        closePanel()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen])

  if (!loaded) return null

  return (
    <div className="widget-root">
      {!isOpen && <Pill hasPending={pendingCount > 0} onClick={openPanel} />}

      {/* Painel deslizante */}
      <div ref={panelRef} className={`widget-panel ${isOpen ? 'open' : ''}`}>
        <div className="widget-inner">

          {/* Cabeçalho */}
          <div className="w-header">
            <div className="w-dayname">{dayName}</div>
            <div className="w-today">{dateStr}</div>
            <div className="w-pending">
              {pendingCount > 0
                ? `${pendingCount} pendente${pendingCount !== 1 ? 's' : ''} hoje`
                : 'tudo em dia ✓'}
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="progress-row">
            <div className="progress-nums">
              <span>tarefas concluídas</span>
              <span>{doneCount} / {tasks.length}</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          {/* Corpo */}
          <div className="w-body">

            {/* Reuniões */}
            {todayMeetings.length > 0 && (
              <>
                <div className="sec-label">reuniões</div>
                {todayMeetings.map(m => <MeetingCard key={m.id} meeting={m} />)}
              </>
            )}

            {/* Tarefas */}
            <div className="sec-label">tarefas</div>
            {todayTasks.map(t => (
              <TaskItem key={t.id} task={t} onToggle={toggleTask} />
            ))}

          </div>

          {/* Rodapé */}
          <div className="w-footer">
            <button className="open-main-btn" onClick={() => window.electronAPI?.openMainWindow()}>
              gerenciar agenda
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
