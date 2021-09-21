import {MonadType, Monad} from "./monad"

type MapFunction<I, O> = (i: I) => O

type FlatMapFunction<M extends MonadType, P extends [any] | [], O> = (...params: P) => Monad<M, O>
type Step<M extends MonadType> = { readonly key: string, readonly flatMapFunction: FlatMapFunction<M, any, any> }

type AsyncFlatMapFunction<M extends MonadType, P extends [any] | [], O> = (...params: P) => Monad<M, O> | Promise<Monad<M, O>>
type AsyncStep<M extends MonadType> = { readonly key: string, readonly flatMapFunction: AsyncFlatMapFunction<M, any, any> }

/**
 * Representation of for-comprehension steps, execution and constructors.
 */
export class For<MT extends MonadType, M extends Monad<MT, any>, C> {

  private constructor(private readonly steps: Step<MT>[]) {
  }

  /**
   * Slim syntax constructor.
   * @param fun contains the initial wrapped value
   * @param key refers to the initial wrapped value within the context
   */
  public static _<MT extends MonadType, M extends Monad<MT, any>, K extends string, O>(
    key: K,
    fun: FlatMapFunction<MT, [], O>
  ): For<MT, M, { [T in K]: O }> {
    return new For([{key: key, flatMapFunction: fun}])
  }

  /**
   * Slim syntax map or flatMap operator.
   * @param fun will be applied to the context
   * @param key refers to the resulting wrapped value within the context
   */
  public _<K extends string, O>(
    key: K,
    fun: FlatMapFunction<MT, [c: C], O>
  ): For<MT, M, C & { [T in K]: O }> {
    return new For(this.steps.concat({key: key, flatMapFunction: fun}))
  }

  /**
   * Trigger execution and yield a resulting value.
   * @param mapFunction
   */
  public yield<O, MO extends M & Monad<MT, O>>(mapFunction: MapFunction<C, O>): MO {
    const context: any = {}
    const {key, flatMapFunction}: Step<MT> = this.steps[0]
    let monadValue: Monad<MT, any> = flatMapFunction()
    context[key] = monadValue.unwrap()

    for (const {key, flatMapFunction} of this.steps.slice(1)) {
      monadValue = monadValue.flatMap(() => flatMapFunction(context))
      context[key] = monadValue.unwrap()
    }

    return monadValue.map(() => mapFunction(context)) as MO
  }
}

/**
 * Representation of for-comprehension steps, execution and constructors.
 */
export class AsyncFor<MT extends MonadType, M extends Monad<MT, any>, C> {

  private constructor(private readonly steps: AsyncStep<MT>[]) {
  }

  /**
   * Slim syntax constructor.
   * @param fun contains the initial wrapped value
   * @param key refers to the initial wrapped value within the context
   */
  public static _<MT extends MonadType, M extends Monad<MT, any>, K extends string, O>(
    key: K,
    fun: AsyncFlatMapFunction<MT, [], O>
  ): AsyncFor<MT, M, { [T in K]: O }> {
    return new AsyncFor([{key: key, flatMapFunction: fun}])
  }

  /**
   * Slim syntax map or flatMap operator.
   * @param fun will be applied to the context
   * @param key refers to the resulting wrapped value within the context
   */
  public _<K extends string, O>(
    key: K,
    fun: AsyncFlatMapFunction<MT, [c: C], O>
  ): AsyncFor<MT, M, C & { [T in K]: O }> {
    return new AsyncFor(this.steps.concat({key: key, flatMapFunction: fun}))
  }

  /**
   * Trigger execution and yield a resulting value.
   * @param mapFunction
   */
  public async yield<O, MO extends M & Monad<MT, O>>(mapFunction: MapFunction<C, O>): Promise<MO> {
    const context: any = {}
    const {key, flatMapFunction}: AsyncStep<MT> = this.steps[0]
    let monadValue: Monad<MT, any> = await flatMapFunction()
    context[key] = monadValue.unwrap()

    for (const {key, flatMapFunction} of this.steps.slice(1)) {
      monadValue = await monadValue.flatMapAsync(async () => flatMapFunction(context))
      context[key] = monadValue.unwrap()
    }

    return monadValue.map(() => mapFunction(context)) as MO
  }
}
