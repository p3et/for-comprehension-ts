import {MonadType, Monad} from "./monad"

type MapFunction<M extends MonadType, I, O> = (i: I) => O
type FlatMapFunction<M extends MonadType, P extends [any] | [], O> = (...params: P) => Monad<M, O> | Promise<Monad<M, O>>
type Step<M extends MonadType> = { readonly key: string, readonly flatMapFunction: FlatMapFunction<M, any, any> }

/**
 * Representation of for-comprehension steps, execution and constructors.
 */
export class For<M extends MonadType, C> {

  private constructor(private readonly steps: Step<M>[]) {
  }

  /**
   * Slim syntax constructor.
   * @param fun contains the initial wrapped value
   * @param key refers to the initial wrapped value within the context
   */
  public static _<M extends MonadType, K extends string, O>(key: K, fun: FlatMapFunction<M, [], O>): For<M, { [T in K]: O }> {
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
  public async yield<O>(mapFunction: MapFunction<M, C, O>): Promise<Monad<M, O>> {
    const context: any = {}
    const {key, flatMapFunction}: Step<M> = this.steps[0];
    var monadValue: Monad<M, any> = await flatMapFunction();
    context[key] = monadValue.unwrap()

    for (const {key, flatMapFunction} of this.steps.slice(1)) {
      monadValue = await monadValue.flatMap(async () => flatMapFunction(context))
      context[key] = monadValue.unwrap()
    }

    return monadValue.map(() => mapFunction(context))
  }
}
