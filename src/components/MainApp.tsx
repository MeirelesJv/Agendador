import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Task, Meeting } from '../types'
import './MainApp.css'

// ─── Modal: Adicionar Tarefa ──────────────────────────────────────────────────
function AddTaskModal({ onAdd, onClose }: {
  onAdd: (text: string, tag: Task['tag']) => void
  onClose: () => void
}) {
  const [text, setText] = useState('')
  const [tag, setTag] = useState<Task['tag']>('trabalho')

  function handleSubmit() {
    if (!text.trim()) return
    onAdd(text.trim(), tag)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Nova tarefa</h3>
        <input
          autoFocus
          className="m-input"
          placeholder="O que você precisa fazer?"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />
        <div className="m-row">
          <label className="m-label">Categoria</label>
          <div className="tag-pills">
            {(['trabalho', 'pessoal', 'urgente', 'outro'] as Task['tag'][]).map(t => (
              <button
                key={t}
                className={`tag-pill tag-pill-${t} ${tag === t ? 'active' : ''}`}
                onClick={() => setTag(t)}
              >{t}</button>
            ))}
          </div>
        </div>
        <div className="m-actions">
          <button className="m-btn-cancel" onClick={onClose}>cancelar</button>
          <button className="m-btn-confirm" onClick={handleSubmit}>adicionar</button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal: Adicionar Reunião ─────────────────────────────────────────────────
function AddMeetingModal({ onAdd, onClose }: {
  onAdd: (data: Omit<Meeting, 'id' | 'createdAt'>) => void
  onClose: () => void
}) {
  const [title, setTitle] = useState('')
  const [time, setTime] = useState('09:00')
  const [duration, setDuration] = useState(60)
  const [link, setLink] = useState('')

  function handleSubmit() {
    if (!title.trim()) return
    onAdd({ title: title.trim(), time, duration, link })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Nova reunião</h3>
        <input
          autoFocus
          className="m-input"
          placeholder="Título da reunião"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <div className="m-row">
          <div className="m-field">
            <label className="m-label">Horário</label>
            <input
              type="time"
              className="m-input"
              value={time}
              onChange={e => setTime(e.target.value)}
            />
          </div>
          <div className="m-field">
            <label className="m-label">Duração (min)</label>
            <input
              type="number"
              className="m-input"
              value={duration}
              min={5}
              step={5}
              onChange={e => setDuration(Number(e.target.value))}
            />
          </div>
        </div>
        <div>
          <label className="m-label">Link (Meet, Zoom, Teams…)</label>
          <input
            className="m-input"
            placeholder="https://meet.google.com/..."
            value={link}
            onChange={e => setLink(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>
        <div className="m-actions">
          <button className="m-btn-cancel" onClick={onClose}>cancelar</button>
          <button className="m-btn-confirm" onClick={handleSubmit}>adicionar</button>
        </div>
      </div>
    </div>
  )
}

// ─── Componente Principal ─────────────────────────────────────────────────────
export function MainApp() {
  const { tasks, meetings, loaded, toggleTask, addTask, deleteTask, addMeeting, deleteMeeting } = useStore()
  const [tab, setTab] = useState<'tasks' | 'meetings'>('tasks')
  const [showAddTask, setShowAddTask] = useState(false)
  const [showAddMeeting, setShowAddMeeting] = useState(false)

  const pendingCount = tasks.filter(t => !t.done).length
  const doneCount = tasks.filter(t => t.done).length
  const progressPct = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long'
  })

  if (!loaded) return <div className="main-loading">carregando…</div>

  return (
    <div className="main-root">
      {/* Barra de título customizada (sem frame nativo) */}
      <div className="titlebar" style={{ WebkitAppRegion: 'drag' } as any}>
        <div className="titlebar-left">
          <span className="app-name">Agendeiro</span>
          <span className="app-date">{today}</span>
        </div>
        <div className="titlebar-controls" style={{ WebkitAppRegion: 'no-drag' } as any}>
          <button className="tb-btn" onClick={() => window.electronAPI?.minimizeMain()}>─</button>
          <button className="tb-btn tb-close" onClick={() => window.electronAPI?.closeMain()}>✕</button>
        </div>
      </div>

      {/* Resumo do dia */}
      <div className="summary-bar">
        <div className="summary-stat">
          <span className="stat-num">{pendingCount}</span>
          <span className="stat-label">pendentes</span>
        </div>
        <div className="summary-stat">
          <span className="stat-num">{doneCount}</span>
          <span className="stat-label">concluídas</span>
        </div>
        <div className="summary-stat">
          <span className="stat-num">{meetings.length}</span>
          <span className="stat-label">reuniões</span>
        </div>
        <div className="summary-progress">
          <div className="sp-track">
            <div className="sp-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="sp-label">{progressPct}%</span>
        </div>
      </div>

      {/* Abas */}
      <div className="tabs">
        <button className={`tab ${tab === 'tasks' ? 'active' : ''}`} onClick={() => setTab('tasks')}>
          tarefas
        </button>
        <button className={`tab ${tab === 'meetings' ? 'active' : ''}`} onClick={() => setTab('meetings')}>
          reuniões
        </button>
        <div className="tab-spacer" />
        <button
          className="add-btn"
          onClick={() => tab === 'tasks' ? setShowAddTask(true) : setShowAddMeeting(true)}
        >
          + adicionar
        </button>
      </div>

      {/* Lista de Tarefas */}
      {tab === 'tasks' && (
        <div className="list">
          {tasks.length === 0 && (
            <div className="empty">nenhuma tarefa. adicione uma acima!</div>
          )}
          {tasks.map(task => (
            <div key={task.id} className={`list-item ${task.done ? 'done' : ''}`}>
              <div className="list-check" onClick={() => toggleTask(task.id)}>
                {task.done && (
                  <svg width="10" height="9" viewBox="0 0 10 9" fill="none">
                    <path d="M1 4.5L4 7.5L9 1" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span className="list-text" onClick={() => toggleTask(task.id)}>{task.text}</span>
              <span className={`list-tag tag-pill-${task.tag}`}>{task.tag}</span>
              <button className="list-delete" onClick={() => deleteTask(task.id)}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Lista de Reuniões */}
      {tab === 'meetings' && (
        <div className="list">
          {meetings.length === 0 && (
            <div className="empty">nenhuma reunião. adicione uma acima!</div>
          )}
          {meetings.map(meeting => {
            const [h, m] = meeting.time.split(':').map(Number)
            const total = h * 60 + m + meeting.duration
            const endTime = `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
            return (
              <div key={meeting.id} className="list-item meeting-item">
                <div className="meeting-time-block">
                  <span className="mt-start">{meeting.time}</span>
                  <span className="mt-sep">→</span>
                  <span className="mt-end">{endTime}</span>
                </div>
                <div className="meeting-info">
                  <span className="meeting-title">{meeting.title}</span>
                  {meeting.link && (
                    <a className="meeting-link-tag" href={meeting.link} target="_blank" rel="noreferrer">
                      abrir link
                    </a>
                  )}
                </div>
                <button className="list-delete" onClick={() => deleteMeeting(meeting.id)}>✕</button>
              </div>
            )
          })}
        </div>
      )}

      {/* Modais */}
      {showAddTask && (
        <AddTaskModal
          onAdd={(text, tag) => addTask(text, tag)}
          onClose={() => setShowAddTask(false)}
        />
      )}
      {showAddMeeting && (
        <AddMeetingModal
          onAdd={(data) => addMeeting(data)}
          onClose={() => setShowAddMeeting(false)}
        />
      )}
    </div>
  )
}
