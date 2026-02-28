/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as constants from "../constants.js";
import type * as crons from "../crons.js";
import type * as engine_abstractGame from "../engine/abstractGame.js";
import type * as factory_agent from "../factory/agent.js";
import type * as factory_agentDescription from "../factory/agentDescription.js";
import type * as factory_agentOperations from "../factory/agentOperations.js";
import type * as factory_factoryMap from "../factory/factoryMap.js";
import type * as factory_game from "../factory/game.js";
import type * as factory_ids from "../factory/ids.js";
import type * as factory_inputHandler from "../factory/inputHandler.js";
import type * as factory_inputs from "../factory/inputs.js";
import type * as factory_insertInput from "../factory/insertInput.js";
import type * as factory_main from "../factory/main.js";
import type * as factory_prompts from "../factory/prompts.js";
import type * as factory_prompts_internal from "../factory/prompts_internal.js";
import type * as factory_world from "../factory/world.js";
import type * as init from "../init.js";
import type * as testing from "../testing.js";
import type * as util_llm from "../util/llm.js";
import type * as util_sleep from "../util/sleep.js";
import type * as world from "../world.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  constants: typeof constants;
  crons: typeof crons;
  "engine/abstractGame": typeof engine_abstractGame;
  "factory/agent": typeof factory_agent;
  "factory/agentDescription": typeof factory_agentDescription;
  "factory/agentOperations": typeof factory_agentOperations;
  "factory/factoryMap": typeof factory_factoryMap;
  "factory/game": typeof factory_game;
  "factory/ids": typeof factory_ids;
  "factory/inputHandler": typeof factory_inputHandler;
  "factory/inputs": typeof factory_inputs;
  "factory/insertInput": typeof factory_insertInput;
  "factory/main": typeof factory_main;
  "factory/prompts": typeof factory_prompts;
  "factory/prompts_internal": typeof factory_prompts_internal;
  "factory/world": typeof factory_world;
  init: typeof init;
  testing: typeof testing;
  "util/llm": typeof util_llm;
  "util/sleep": typeof util_sleep;
  world: typeof world;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
