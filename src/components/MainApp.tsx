import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { Task, Meeting, UpdateStatus } from '../types'
import './MainApp.css'

function localDateStr(offsetDays = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ─── Calendário ───────────────────────────────────────────────────────────────
function Calendar({ year, month, selected, todayStr, tasks, meetings, onSelect, onPrev, onNext }: {
  year: number; month: number; selected: string; todayStr: string
  tasks: Task[]; meetings: Meeting[]
  onSelect: (d: string) => void; onPrev: () => void; onNext: () => void
}) {
  const MONTHS = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']
  const WDS = ['D','S','T','Q','Q','S','S']
  const firstWd = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  function ds(day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const cells: (number | null)[] = [
    ...Array(firstWd).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="calendar">
      <div className="cal-header">
        <button className="cal-nav" onClick={onPrev}>‹</button>
        <span className="cal-month">{MONTHS[month]} {year}</span>
        <button className="cal-nav" onClick={onNext}>›</button>
      </div>
      <div className="cal-grid">
        {WDS.map((w, i) => <span key={`wd${i}`} className="cal-wd">{w}</span>)}
        {cells.map((day, i) => {
          if (!day) return <span key={`e${i}`} />
          const d = ds(day)
          const hasTask = tasks.some(t => t.date === d)
          const hasMeet = meetings.some(m => m.date === d)
          return (
            <button
              key={`d${i}`}
              className={`cal-day${d === todayStr ? ' cal-today' : ''}${d === selected ? ' cal-sel' : ''}`}
              onClick={() => onSelect(d)}
            >
              <span>{day}</span>
              {(hasTask || hasMeet) && <span className="cal-dot" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

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
  onAdd: (data: Omit<Meeting, 'id' | 'createdAt' | 'date'>) => void
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
  const [update, setUpdate] = useState<UpdateStatus | null>(null)

  const todayStr = localDateStr()
  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [calMonth, setCalMonth] = useState(new Date().getMonth())

  useEffect(() => {
    window.electronAPI?.onUpdateStatus(setUpdate)
  }, [])

  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) }
    else setCalMonth(m => m - 1)
  }
  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) }
    else setCalMonth(m => m + 1)
  }

  const dayTasks = tasks.filter(t => t.date === selectedDate)
  const dayMeetings = meetings.filter(m => m.date === selectedDate)
  const pendingCount = dayTasks.filter(t => !t.done).length
  const doneCount = dayTasks.filter(t => t.done).length
  const progressPct = dayTasks.length ? Math.round((doneCount / dayTasks.length) * 100) : 0

  const selectedLabel = new Date(selectedDate + 'T12:00').toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long'
  })

  if (!loaded) return <div className="main-loading">carregando…</div>

  return (
    <div className="main-root">

      {/* Barra de título */}
      <div className="titlebar" style={{ WebkitAppRegion: 'drag' } as any}>
        <div className="titlebar-left">
          <span className="app-name">Agendeiro</span>
        </div>
        <div className="titlebar-controls" style={{ WebkitAppRegion: 'no-drag' } as any}>
          <div className="update-area">
            {(!update || update.status === 'error') && (
              <button className="update-btn" onClick={() => window.electronAPI?.checkForUpdates()}>
                {update?.status === 'error' ? 'erro — tentar novamente' : 'verificar atualizações'}
              </button>
            )}
            {update?.status === 'checking' && <span className="update-info">verificando…</span>}
            {update?.status === 'up-to-date' && <span className="update-info">✓ atualizado</span>}
            {update?.status === 'available' && <span className="update-info">baixando v{update.version}…</span>}
            {update?.status === 'downloading' && <span className="update-info">baixando {update.percent}%</span>}
            {update?.status === 'downloaded' && (
              <button className="update-btn update-btn-ready" onClick={() => window.electronAPI?.installUpdate()}>
                reiniciar e instalar
              </button>
            )}
          </div>
          <button className="tb-btn" onClick={() => window.electronAPI?.minimizeMain()}>─</button>
          <button className="tb-btn tb-close" onClick={() => window.electronAPI?.closeMain()}>✕</button>
        </div>
      </div>

      {/* Calendário */}
      <Calendar
        year={calYear} month={calMonth}
        selected={selectedDate} todayStr={todayStr}
        tasks={tasks} meetings={meetings}
        onSelect={setSelectedDate}
        onPrev={prevMonth} onNext={nextMonth}
      />

      {/* Resumo do dia selecionado */}
      <div className="summary-bar">
        <span className="summary-date">{selectedLabel}</span>
        <div className="summary-stats">
          <div className="summary-stat">
            <span className="stat-num">{pendingCount}</span>
            <span className="stat-label">pendentes</span>
          </div>
          <div className="summary-stat">
            <span className="stat-num">{doneCount}</span>
            <span className="stat-label">concluídas</span>
          </div>
          <div className="summary-stat">
            <span className="stat-num">{dayMeetings.length}</span>
            <span className="stat-label">reuniões</span>
          </div>
          <div className="summary-progress">
            <div className="sp-track">
              <div className="sp-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="sp-label">{progressPct}%</span>
          </div>
        </div>
      </div>

      {/* Abas */}
      <div className="tabs">
        <button className={`tab ${tab === 'tasks' ? 'active' : ''}`} onClick={() => setTab('tasks')}>tarefas</button>
        <button className={`tab ${tab === 'meetings' ? 'active' : ''}`} onClick={() => setTab('meetings')}>reuniões</button>
        <div className="tab-spacer" />
        <button className="add-btn" onClick={() => tab === 'tasks' ? setShowAddTask(true) : setShowAddMeeting(true)}>
          + adicionar
        </button>
      </div>

      {/* Lista de Tarefas */}
      {tab === 'tasks' && (
        <div className="list">
          {dayTasks.length === 0 && <div className="empty">nenhuma tarefa para este dia.</div>}
          {dayTasks.map(task => (
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
          {dayMeetings.length === 0 && <div className="empty">nenhuma reunião para este dia.</div>}
          {dayMeetings.map(meeting => {
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
                    <a className="meeting-link-tag" href={meeting.link} target="_blank" rel="noreferrer">abrir link</a>
                  )}
                </div>
                <button className="list-delete" onClick={() => deleteMeeting(meeting.id)}>✕</button>
              </div>
            )
          })}
        </div>
      )}

      {showAddTask && (
        <AddTaskModal
          onAdd={(text, tag) => addTask(text, tag, selectedDate)}
          onClose={() => setShowAddTask(false)}
        />
      )}
      {showAddMeeting && (
        <AddMeetingModal
          onAdd={(data) => addMeeting({ ...data, date: selectedDate })}
          onClose={() => setShowAddMeeting(false)}
        />
      )}
    </div>
  )
}
