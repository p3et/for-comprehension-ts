import {Monad, MonadType} from "../monad/common";
import {none, some} from "../monad/option";

type AsyncFlatMapFunction<M extends MonadType> = (i: any) => Promise<Monad<M, any>>

type Step<M extends MonadType> = {
  key: string,
  fun: AsyncFlatMapFunction<M>
}

type Program<M extends MonadType, I extends Record<string, any>> = {
  steps: Step<M>[]
  _<OK extends string, IK extends (keyof I)[], OV>(
    outputKey: I extends { [_ in OK]: OV } ? never : OK,
    inputKeys : IK,
    fun: (i: Pick<I, typeof inputKeys[number]>) => Promise<Monad<M, OV>>
  ): Program<M, I & { [_ in OK]: OV }>
  yield<V>(fun: (i: I) => V): Promise<Monad<M, V>>
}

function program<M extends MonadType, I>(steps: Step<M>[]): Program<M, I>
{
  return {
    steps: steps,
    _<OK extends string, IK extends (keyof I)[], OV>(
      key: I extends { [_ in OK]: OV } ? never : OK,
      inputKeys : IK,
      fun: (i: Pick<I, typeof inputKeys[number]>) => Promise<Monad<M, OV>>): Program<M, I & { [_ in OK]: OV }>
    {
      return flatMap(this, key, fun);
    },
    yield<T>(fun: (i: I) => T): Promise<Monad<M, T>>
    {
      return evaluate(this, fun);
    }
  }
}

export function forAsync<M extends MonadType, K extends string, V>(
  key: K,
  fun: () => Promise<Monad<M, V>>
): Program<M, { [_ in K]: V }>
{
  return program([{key: key, fun: fun}])
}

function flatMap<M extends MonadType, I, K extends string, V>(
  oldProgram: Program<M, I>,
  key: I extends { [_ in K]: V } ? never : K,
  fun: (i: I) => Promise<Monad<M, V>>): Program<M, I & { [_ in K]: V }>
{
  return program(oldProgram.steps.concat({key: key, fun: fun}))
}
async function evaluate<M extends MonadType, I, V>(program: Program<M, I>, fun: (i: I) => V): Promise<Monad<M, V>>
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
  forAsync("foo", async () => some(1))
  ._("bar", [], async (i) => some(i.foo * 2))
  .yield((i) => i);

x.then(console.log);