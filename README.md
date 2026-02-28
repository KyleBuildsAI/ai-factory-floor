# AI Factory Floor

Your command center where AI agents execute on your prompts.

A visual 2D factory/office where a team of specialist AI agents collaboratively process your tasks. Inspired by [ChatDev](https://github.com/OpenBMB/ChatDev) — but with a live PixiJS-rendered interface showing agents working, thinking, and collaborating in real time.

## How It Works

1. **You submit a prompt** — any task, question, or creative request
2. **The Manager agent decomposes it** into 2-5 subtasks using an LLM call
3. **Specialist agents pick up subtasks** based on their role (researcher, engineer, designer, etc.)
4. **Each agent processes their subtask** with a real LLM call, producing work output
5. **The Manager assembles the final output** from all specialist contributions
6. **You see it all happen visually** — agents at workstations with speech bubbles, status dots, and a live task board

## Agent Roles

| Agent | Emoji | Role |
|-------|-------|------|
| Manager | 👔 | Decomposes prompts, assigns subtasks, assembles final output |
| Researcher | 🔍 | Gathers context, analyzes requirements, produces research |
| Engineer | ⚙️ | Writes code, designs systems, solves technical problems |
| Designer | 🎨 | Creates UI/UX specs, visual designs, layouts |
| Writer | ✍️ | Documentation, reports, articles, creative writing |
| Reviewer | ✅ | Reviews work for quality, correctness, feedback |
| Analyst | 📊 | Data analysis, strategic insights, problem breakdown |
| Tester | 🧪 | Verifies work, finds edge cases, ensures quality |

## Stack

- **Backend:** [Convex](https://convex.dev/) (real-time database, serverless functions, cron jobs)
- **Frontend:** React + [PixiJS](https://pixijs.com/) + Tailwind CSS
- **LLM:** Ollama (default), OpenAI, Anthropic, Together.ai, LiteLLM, or any OpenAI-compatible API
- **Build:** Vite + TypeScript

## Quick Start

```bash
git clone <repo-url>
cd ai-factory-floor
npm install
```

### Connect an LLM

**Ollama (default, fully local):**
```bash
ollama pull llama3
ollama serve
```

**OpenAI:**
```bash
npx convex env set LLM_PROVIDER openai
npx convex env set OPENAI_API_KEY 'sk-...'
```

**Anthropic:**
```bash
npx convex env set LLM_PROVIDER anthropic
npx convex env set ANTHROPIC_API_KEY 'sk-ant-...'
```

### Run

```bash
npm run dev
```

Visit `http://localhost:5173`. The factory floor initializes with 8 agents at their workstations. Type a prompt and watch them work.

## Architecture

```
User submits prompt
  → Manager decomposes (LLM) → subtasks created in DB
  → Specialists claim subtasks matching their role
  → Each specialist processes subtask (LLM) → output saved
  → Manager detects all subtasks complete → assembles final output (LLM)
  → Final output displayed to user
```

The game engine runs a tick loop via Convex actions. Agents check for work each tick. LLM calls happen asynchronously in Convex `internalAction`s — they don't block the tick loop.

## Commands

```bash
npm run dev              # Start development
npx convex run testing:stop     # Stop the engine
npx convex run testing:resume   # Resume the engine
npx convex run testing:kick     # Kick-start stuck engine
npx convex run testing:wipeAllTables  # Reset everything
```

## Customization

Agent roles are defined in `data/agents.ts`. Each agent has:
- `name` — display name
- `role` — role identifier (used for subtask assignment)
- `identity` — system prompt defining the agent's personality and capabilities
- `emoji` — visual identifier
- `color` — avatar color
- `workstationPosition` — position on the factory floor grid

The factory layout is defined in `data/factoryMap.ts` (20x15 tile grid, 32px tiles).

## Credits

- Inspired by [ChatDev](https://github.com/OpenBMB/ChatDev) and [ai-town](https://github.com/a16z-infra/ai-town)
- Engine architecture from [a16z-infra/ai-town](https://github.com/a16z-infra/ai-town)
- [Convex](https://convex.dev/) for the real-time backend
- [PixiJS](https://pixijs.com/) for 2D rendering

## License

MIT
