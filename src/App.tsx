import { Widget } from './components/Widget'
import { MainApp } from './components/MainApp'

// O Electron abre duas janelas diferentes:
// - /#widget → mostra o painel lateral
// - /#main   → mostra o app de configurações
// Esta lógica simples de hash routing substitui o React Router

export default function App() {
  const hash = window.location.hash

  if (hash === '#widget') return <Widget />
  if (hash === '#main') return <MainApp />

  // Fallback: no browser (npm run vite), mostra o widget por padrão
  return <Widget />
}
