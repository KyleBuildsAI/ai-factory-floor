import { ObjectType, PropertyValidators, Value } from 'convex/values';
import { FactoryGame } from './game';

export function inputHandler<ArgsValidator extends PropertyValidators, Return extends Value>(def: {
  args: ArgsValidator;
  handler: (game: FactoryGame, now: number, args: ObjectType<ArgsValidator>) => Return;
}) {
  return def;
}
