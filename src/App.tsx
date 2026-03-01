import Game from './components/Game.tsx';
import { ToastContainer } from 'react-toastify';

export default function App() {
  return (
    <main className="relative flex min-h-screen flex-col bg-factory-900 text-factory-50 font-mono">
      <header className="px-6 py-3 border-b border-factory-700 bg-factory-900 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-accent-orange text-xl">&#9881;</span>
          <h1 className="text-xl font-bold text-factory-50 tracking-wide">
            AI Factory Floor
          </h1>
        </div>
        <div className="h-4 w-px bg-factory-600" />
        <p className="text-xs text-factory-400 tracking-wider uppercase">
          Command Center
        </p>
      </header>

      <Game />

      <ToastContainer position="bottom-right" autoClose={2000} closeOnClick theme="dark" />
    </main>
  );
}
