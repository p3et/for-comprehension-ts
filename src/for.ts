import {Monad, MonadValue} from "./monad"

type MapFunction<M extends Monad, I, O> = (i: I) => O
type FlatMapFunction<M extends Monad, P extends [any] | [], O> = (...params: P) => MonadValue<M, O> | Promise<MonadValue<M, O>>
type Step<M extends Monad> = { readonly key: string, readonly flatMapFunction: FlatMapFunction<M, any, any> }

/**
 * Representation of for-comprehension steps, execution and constructors.
 */
export class For<M extends Monad, C> {

  private constructor(private readonly steps: Step<M>[]) {
  }

  /**
   * Slim syntax constructor.
   * @param fun contains the initial wrapped value
   * @param key refers to the initial wrapped value within the context
   */
  public static _<M extends Monad, K extends string, O>(key: K, fun: FlatMapFunction<M, [], O>): For<M, { [T in K]: O }> {
    return new For([{key: key, flatMapFunction: fun}])
  }

  /**
   * Slim syntax map or flatMap operator.
   * @param fun will be applied to the context
   * @param key refers to the resulting wrapped value within the context
   */
  public _<K extends string, O>(key: K, fun: FlatMapFunction<M, [c: C], O>): For<M, C & { [T in K]: O }> {
    return new For(this.steps.concat({key: key, flatMapFunction: fun}))
  }

  /**
   * Trigger execution and yield a resulting value.
   * @param mapFunction
   */
  public async yield<O>(mapFunction: MapFunction<M, C, O>): Promise<MonadValue<M, O>> {
    const context: any = {}
    var monadValue: MonadValue<M, any> = undefined

    for (const {key, flatMapFunction} of this.steps) {
      monadValue = await flatMapFunction(context)

      const unwrapped: any = monadValue.unwrap()

      if (unwrapped === null) break

      context[key] = monadValue.unwrap()
    }

    return monadValue.map(() => mapFunction(context))
  }
}
