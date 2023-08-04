import {Monad} from "../monad/common";
import {none, some} from "../monad/option";

type FlatMapFunction<M extends string> = (i: any) => Promise<Monad<M, any>>

type Step<M extends string> = {
  key: string,
  fun: FlatMapFunction<M>
}

type Program<M extends string, I extends Record<string, any>> = {
  steps: Step<M>[]
  flatMap<K extends string, V>(key: I extends { [_ in K]: V } ? never : K, fun: (i: I) => Promise<Monad<M, V>>): Program<M, I & { [_ in K]: V }>
  evaluate<T>(fun: (i: I) => T): Promise<Monad<M, T>>
}

function program<M extends string, I>(steps: Step<M>[]): Program<M, I>
{
  return {
    steps: steps,
    flatMap<K extends string, V>(key: I extends { [_ in K]: V } ? never : K, fun: (i: I) => Promise<Monad<M, V>>): Program<M, I & { [_ in K]: V }>
    {
      return flatMap(this, key, fun);
    },
    evaluate<T>(fun: (i: I) => T): Promise<Monad<M, T>>
    {
      return evaluate(this, fun);
    }
  }
}

function init<M extends string, K extends string, V>(
  key: K,
  fun: () => Promise<Monad<M, V>>
): Program<M, { [_ in K]: V }>
{
  return program([{key: key, fun: fun}])
}

function flatMap<M extends string, I, K extends string, V>(
  oldProgram: Program<M, I>,
  key: I extends { [_ in K]: V } ? never : K,
  fun: (i: I) => Promise<Monad<M, V>>): Program<M, I & { [_ in K]: V }>
{
  return program(oldProgram.steps.concat({key: key, fun: fun}))
}
async function evaluate<M extends string, I, T>(program: Program<M, I>, fun: (i: I) => T): Promise<Monad<M, T>>
{
  const head = program.steps[0]

  const headMonad = await head.fun({})
  let input = headMonad.map((value) => ({[head.key]: value}))

  const tail = program.steps.slice(1)

  for (const step of tail)
  {
    const result = await input.flatMapAsync((i) => step.fun(i))
    input = input.flatMap((i) => result.map((v) => ({...i, ...{[step.key]: v}})))
  }

  return input.map(fun);
}

const x =
  init("foo", async () => some(1))
  .flatMap("bar", async (i) => some(i.foo * 2))
  .evaluate((i) => i);

x.then(console.log);