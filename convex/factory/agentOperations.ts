import { v } from 'convex/values';
import { internalAction } from '../_generated/server';
import { internal, api } from '../_generated/api';
import { Id } from '../_generated/dataModel';
import { chatCompletion } from '../util/llm';
import { sleep } from '../util/sleep';
import { IDLE_MESSAGES, SUBTASK_MAX_TOKENS, DECOMPOSE_MAX_TOKENS, ASSEMBLE_MAX_TOKENS } from '../constants';

// Manager checks for pending prompts or completed subtasks to assemble
export const managerCheckWork = internalAction({
  args: {
    worldId: v.id('worlds'),
    agentId: v.string(),
    operationId: v.string(),
  },
  handler: async (ctx, args) => {
    const worldId = args.worldId;

    // Check for pending prompts to decompose
    const pendingPrompts = await ctx.runQuery(internal.factory.prompts_internal.getPendingPrompts, {
      worldId,
    });

    if (pendingPrompts.length > 0) {
      const prompt = pendingPrompts[0];
      // Mark prompt as decomposing
      await ctx.runMutation(internal.factory.prompts_internal.updatePromptStatus, {
        promptId: prompt._id,
        status: 'decomposing',
      });
      // Update agent status
      await ctx.runMutation(api.factory.main.sendInput, {
        engineId: await getEngineId(ctx, worldId),
        name: 'updateAgentStatus',
        args: {
          agentId: args.agentId,
          status: 'thinking',
          speechBubble: 'Analyzing prompt...',
          currentPromptId: prompt._id,
        },
      });
      // Start decomposition
      await ctx.scheduler.runAfter(0, internal.factory.agentOperations.managerDecomposePrompt, {
        worldId,
        agentId: args.agentId,
        operationId: args.operationId,
        promptId: prompt._id,
      });
      return;
    }

    // Check for prompts with all subtasks completed
    const inProgressPrompts = await ctx.runQuery(
      internal.factory.prompts_internal.getInProgressPrompts,
      { worldId },
    );
    for (const prompt of inProgressPrompts) {
      const allDone = await ctx.runQuery(
        internal.factory.prompts_internal.allSubtasksCompleted,
        { promptId: prompt._id },
      );
      if (allDone) {
        await ctx.runMutation(api.factory.main.sendInput, {
          engineId: await getEngineId(ctx, worldId),
          name: 'updateAgentStatus',
          args: {
            agentId: args.agentId,
            status: 'reviewing',
            speechBubble: 'Assembling final output...',
            currentPromptId: prompt._id,
          },
        });
        await ctx.scheduler.runAfter(0, internal.factory.agentOperations.managerAssembleOutput, {
          worldId,
          agentId: args.agentId,
          operationId: args.operationId,
          promptId: prompt._id,
        });
        return;
      }
    }

    // Nothing to do — idle
    await ctx.scheduler.runAfter(0, internal.factory.agentOperations.agentIdleBehavior, {
      worldId,
      agentId: args.agentId,
      operationId: args.operationId,
    });
  },
});

// Specialist checks for assigned subtasks
export const agentCheckWork = internalAction({
  args: {
    worldId: v.id('worlds'),
    agentId: v.string(),
    operationId: v.string(),
  },
  handler: async (ctx, args) => {
    const worldId = args.worldId;

    // Get agent's role from description
    const agentDesc = await ctx.runQuery(internal.factory.prompts_internal.getAgentDescription, {
      worldId,
      agentId: args.agentId,
    });
    if (!agentDesc) {
      await finishOp(ctx, args);
      return;
    }

    // Find a subtask assigned to this role that's ready
    const subtask = await ctx.runQuery(internal.factory.prompts_internal.findReadySubtask, {
      worldId,
      role: agentDesc.role,
    });

    if (subtask) {
      // Claim the subtask
      await ctx.runMutation(internal.factory.prompts_internal.claimSubtask, {
        subtaskId: subtask._id,
        agentId: args.agentId,
      });
      // Update status
      await ctx.runMutation(api.factory.main.sendInput, {
        engineId: await getEngineId(ctx, worldId),
        name: 'updateAgentStatus',
        args: {
          agentId: args.agentId,
          status: 'working',
          speechBubble: subtask.title.slice(0, 50) + '...',
          currentSubtaskId: subtask._id,
        },
      });
      // Start processing
      await ctx.scheduler.runAfter(0, internal.factory.agentOperations.agentProcessSubtask, {
        worldId,
        agentId: args.agentId,
        operationId: args.operationId,
        subtaskId: subtask._id,
      });
      return;
    }

    // Nothing to do — idle
    await ctx.scheduler.runAfter(0, internal.factory.agentOperations.agentIdleBehavior, {
      worldId,
      agentId: args.agentId,
      operationId: args.operationId,
    });
  },
});

// Manager decomposes a prompt into subtasks
export const managerDecomposePrompt = internalAction({
  args: {
    worldId: v.id('worlds'),
    agentId: v.string(),
    operationId: v.string(),
    promptId: v.id('prompts'),
  },
  handler: async (ctx, args) => {
    const prompt = await ctx.runQuery(internal.factory.prompts_internal.getPrompt, {
      promptId: args.promptId,
    });
    if (!prompt) {
      await finishOp(ctx, args);
      return;
    }

    const roles = ['researcher', 'engineer', 'designer', 'writer', 'reviewer', 'analyst', 'tester'];
    const systemPrompt = `You are the Manager of an AI Factory Floor. You receive user prompts and decompose them into subtasks for specialist agents.

Available specialist roles: ${roles.join(', ')}

Role descriptions:
- researcher: Gathers information, finds data, produces research summaries
- engineer: Writes code, designs systems, solves technical problems
- designer: Creates visual designs, layouts, UX solutions
- writer: Produces documentation, copy, articles, reports
- reviewer: Reviews work for quality and correctness
- analyst: Analyzes data, identifies patterns, provides insights
- tester: Verifies work, finds edge cases, ensures quality

Decompose the user's prompt into 2-5 subtasks. Assign each to the most appropriate role.
Only use roles that are actually needed — don't create work just to involve everyone.

Respond with ONLY a JSON array, no other text:
[
  { "title": "Brief task title", "description": "Detailed instructions for the specialist", "assignedRole": "role_name", "order": 1 }
]

Order determines execution sequence. Tasks with the same order can run in parallel.`;

    try {
      const { content } = await chatCompletion({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt.text },
        ],
        max_tokens: DECOMPOSE_MAX_TOKENS,
      });

      // Parse JSON from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Manager did not return valid JSON');
      }
      const subtasks = JSON.parse(jsonMatch[0]) as Array<{
        title: string;
        description: string;
        assignedRole: string;
        order: number;
      }>;

      // Validate and insert subtasks
      const now = Date.now();
      for (const st of subtasks) {
        if (!roles.includes(st.assignedRole)) {
          st.assignedRole = 'researcher'; // fallback
        }
        await ctx.runMutation(internal.factory.prompts_internal.insertSubtask, {
          worldId: args.worldId,
          promptId: args.promptId,
          title: st.title,
          description: st.description,
          assignedRole: st.assignedRole,
          order: st.order,
          createdAt: now,
        });
      }

      // Mark prompt as in_progress
      await ctx.runMutation(internal.factory.prompts_internal.updatePromptStatus, {
        promptId: args.promptId,
        status: 'in_progress',
      });

      // Update manager speech bubble
      await ctx.runMutation(api.factory.main.sendInput, {
        engineId: await getEngineId(ctx, args.worldId),
        name: 'updateAgentStatus',
        args: {
          agentId: args.agentId,
          status: 'idle',
          speechBubble: `Created ${subtasks.length} subtasks`,
        },
      });
    } catch (e: any) {
      console.error('Manager decomposition failed:', e.message);
      await ctx.runMutation(internal.factory.prompts_internal.updatePromptStatus, {
        promptId: args.promptId,
        status: 'failed',
      });
    }

    await finishOp(ctx, args);
  },
});

// Specialist processes their assigned subtask
export const agentProcessSubtask = internalAction({
  args: {
    worldId: v.id('worlds'),
    agentId: v.string(),
    operationId: v.string(),
    subtaskId: v.id('subtasks'),
  },
  handler: async (ctx, args) => {
    const subtask = await ctx.runQuery(internal.factory.prompts_internal.getSubtask, {
      subtaskId: args.subtaskId,
    });
    if (!subtask) {
      await finishOp(ctx, args);
      return;
    }

    const prompt = await ctx.runQuery(internal.factory.prompts_internal.getPrompt, {
      promptId: subtask.promptId,
    });
    const agentDesc = await ctx.runQuery(internal.factory.prompts_internal.getAgentDescription, {
      worldId: args.worldId,
      agentId: args.agentId,
    });

    // Load dependency outputs
    let dependencyContext = '';
    if (subtask.dependsOn && subtask.dependsOn.length > 0) {
      for (const depId of subtask.dependsOn) {
        const dep = await ctx.runQuery(internal.factory.prompts_internal.getSubtask, {
          subtaskId: depId,
        });
        if (dep?.output) {
          dependencyContext += `\n\n--- Output from "${dep.title}" (${dep.assignedRole}) ---\n${dep.output}`;
        }
      }
    }

    const systemPrompt = `${agentDesc?.identity ?? 'You are a specialist AI agent.'}

You are working on the AI Factory Floor, processing a subtask that was assigned to you by the Manager.

Original user prompt: "${prompt?.text ?? ''}"

Your specific subtask: "${subtask.title}"
Instructions: ${subtask.description}
${dependencyContext ? `\nContext from previous work:${dependencyContext}` : ''}

Complete this subtask thoroughly. Provide your complete output below:`;

    // Mark subtask as in_progress
    await ctx.runMutation(internal.factory.prompts_internal.updateSubtaskStatus, {
      subtaskId: args.subtaskId,
      status: 'in_progress',
    });

    try {
      const { content } = await chatCompletion({
        messages: [{ role: 'system', content: systemPrompt }],
        max_tokens: SUBTASK_MAX_TOKENS,
      });

      // Save work log
      await ctx.runMutation(internal.factory.prompts_internal.insertWorkLog, {
        worldId: args.worldId,
        subtaskId: args.subtaskId,
        agentId: args.agentId,
        content,
        timestamp: Date.now(),
      });

      // Mark subtask completed with output
      await ctx.runMutation(internal.factory.prompts_internal.completeSubtask, {
        subtaskId: args.subtaskId,
        output: content,
      });

      // Update agent speech bubble
      await ctx.runMutation(api.factory.main.sendInput, {
        engineId: await getEngineId(ctx, args.worldId),
        name: 'updateAgentStatus',
        args: {
          agentId: args.agentId,
          status: 'idle',
          speechBubble: 'Task complete ✓',
          currentSubtaskId: undefined,
        },
      });
    } catch (e: any) {
      console.error(`Agent ${args.agentId} subtask processing failed:`, e.message);
      await ctx.runMutation(internal.factory.prompts_internal.updateSubtaskStatus, {
        subtaskId: args.subtaskId,
        status: 'failed',
      });
    }

    await finishOp(ctx, args);
  },
});

// Manager assembles all subtask outputs into a final response
export const managerAssembleOutput = internalAction({
  args: {
    worldId: v.id('worlds'),
    agentId: v.string(),
    operationId: v.string(),
    promptId: v.id('prompts'),
  },
  handler: async (ctx, args) => {
    const prompt = await ctx.runQuery(internal.factory.prompts_internal.getPrompt, {
      promptId: args.promptId,
    });
    if (!prompt) {
      await finishOp(ctx, args);
      return;
    }

    const subtasks = await ctx.runQuery(internal.factory.prompts_internal.getSubtasksForPrompt, {
      promptId: args.promptId,
    });

    const subtaskOutputs = subtasks
      .filter((st: any) => st.output)
      .map((st: any) => `### ${st.title} (${st.assignedRole})\n${st.output}`)
      .join('\n\n---\n\n');

    const systemPrompt = `You are the Manager of an AI Factory Floor. Your specialist agents have completed their subtasks for the user's prompt. Assemble their outputs into a single, coherent, well-structured final response.

Original user prompt: "${prompt.text}"

Specialist outputs:
${subtaskOutputs}

Synthesize these into a polished final response for the user. Keep the best parts of each specialist's work. Remove redundancy but preserve all important content. Format clearly with headers and sections as appropriate.`;

    try {
      const { content } = await chatCompletion({
        messages: [{ role: 'system', content: systemPrompt }],
        max_tokens: ASSEMBLE_MAX_TOKENS,
      });

      // Save final output
      await ctx.runMutation(internal.factory.prompts_internal.completePrompt, {
        promptId: args.promptId,
        finalOutput: content,
      });

      await ctx.runMutation(api.factory.main.sendInput, {
        engineId: await getEngineId(ctx, args.worldId),
        name: 'updateAgentStatus',
        args: {
          agentId: args.agentId,
          status: 'idle',
          speechBubble: 'Output assembled ✓',
          currentPromptId: undefined,
        },
      });
    } catch (e: any) {
      console.error('Manager assembly failed:', e.message);
      await ctx.runMutation(internal.factory.prompts_internal.updatePromptStatus, {
        promptId: args.promptId,
        status: 'failed',
      });
    }

    await finishOp(ctx, args);
  },
});

// Idle behavior — sets a random speech bubble
export const agentIdleBehavior = internalAction({
  args: {
    worldId: v.id('worlds'),
    agentId: v.string(),
    operationId: v.string(),
  },
  handler: async (ctx, args) => {
    const msg = IDLE_MESSAGES[Math.floor(Math.random() * IDLE_MESSAGES.length)];
    await ctx.runMutation(api.factory.main.sendInput, {
      engineId: await getEngineId(ctx, args.worldId),
      name: 'updateAgentStatus',
      args: {
        agentId: args.agentId,
        status: 'idle',
        speechBubble: msg,
      },
    });
    // Wait a bit before releasing
    await sleep(2000 + Math.random() * 3000);
    await finishOp(ctx, args);
  },
});

// Helper: finish an operation by sending finishOperation input
async function finishOp(
  ctx: any,
  args: { worldId: Id<'worlds'>; agentId: string; operationId: string },
) {
  const engineId = await getEngineId(ctx, args.worldId);
  await ctx.runMutation(api.factory.main.sendInput, {
    engineId,
    name: 'finishOperation',
    args: { agentId: args.agentId, operationId: args.operationId },
  });
}

async function getEngineId(ctx: any, worldId: Id<'worlds'>): Promise<Id<'engines'>> {
  const ws = await ctx.runQuery(internal.factory.main.getWorldStatus, { worldId });
  if (!ws) throw new Error(`No world status for ${worldId}`);
  return ws.engineId;
}
