import Game from './components/Game.tsx';
import { ToastContainer } from 'react-toastify';

export default function App() {
  return (
    <main className="relative flex min-h-screen flex-col bg-factory-900 text-white font-body">
      <header className="px-6 py-4 border-b border-factory-700">
        <h1 className="text-2xl font-bold font-display">
          AI Factory Floor
        </h1>
        <p className="text-sm text-factory-400">
          Your command center where AI agents execute on your prompts
        </p>
      </header>

      <Game />

      <ToastContainer position="bottom-right" autoClose={2000} closeOnClick theme="dark" />
    </main>
  );
}
