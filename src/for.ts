import {Monad, MonadType} from "./monad"

type WithField<K extends string, V> = Readonly<{ [_ in K]: V }>
type WithAdditionalField<T, K extends string, V> = T extends WithField<K, any> ? never : T & WithField<K, V>

type MapFunction<I, O> = (i: I) => O

type FlatMapFunction<MT extends MonadType, P extends [any] | [], O> = (...params: P) => Monad<MT, O>
type Step<MT extends MonadType> = { readonly key: string, readonly flatMapFunction: FlatMapFunction<MT, any, any> }

/**
 * representation of for-comprehension steps, execution and constructors
 * @param MT monad type
 * @param M monad
 * @param C context
 */
export class For<MT extends MonadType, M extends Monad<MT, any>, C> {

  private constructor(private readonly steps: Step<MT>[]) {
  }

  /**
   * constructor
   * @param MT monad type
   * @param M monad
   * @param K function output key
   * @param O function output type
   * @param key key of the initial monad's value
   * @param supplier supplier of the initial monad
   */
  public static _<MT extends MonadType, M extends Monad<MT, any>, K extends string, O>(
      key: K,
      supplier: FlatMapFunction<MT, [], O>
  ): For<MT, M, WithField<K, O>> {
    return new For([{key: key, flatMapFunction: supplier}])
  }

  /**
   * flatMap operation
   * @param K function output key
   * @param O function output type
   * @param key key of the function's result value
   * @param flatMapFunction function to be executed on the context
   */
  public _<K extends string, O>(
      key: K,
      flatMapFunction: FlatMapFunction<MT, [c: C], O>
  ): For<MT, M, WithAdditionalField<C, K, O>> {
    return new For(this.steps.concat({key: key, flatMapFunction: flatMapFunction}))
  }

  /**
   * yield operation
   * @param O function output type
   * @param MO output monad
   * @param mapFunction function to be executed on the context
   */
  public yield<O, MO extends M & Monad<MT, O>>(mapFunction: MapFunction<C, O>): MO {
    const values: any = {}
    const {key, flatMapFunction}: Step<MT> = this.steps[0]
    let monadValue: Monad<MT, any> = flatMapFunction()
    values[key] = monadValue.unwrap()

    for (const {key, flatMapFunction} of this.steps.slice(1)) {
      monadValue = monadValue.flatMap(() => flatMapFunction(values))
      values[key] = monadValue.unwrap()
    }

    return monadValue.map(() => mapFunction(values)) as MO
  }
}

type AsyncFlatMapFunction<MT extends MonadType, P extends [any] | [], O> = (...params: P) => Monad<MT, O> | Promise<Monad<MT, O>>
type AsyncStep<MT extends MonadType> = { readonly key: string, readonly flatMapFunction: AsyncFlatMapFunction<MT, any, any> }

/**
 * representation of async for-comprehension steps, execution and constructors
 * @param MT monad type
 * @param M monad
 * @param C context
 */
export class AsyncFor<MT extends MonadType, M extends Monad<MT, any>, C> {

  private constructor(private readonly steps: AsyncStep<MT>[]) {
  }

  /**
   * constructor
   * @param MT monad type
   * @param M monad
   * @param K function output key
   * @param O function output type
   * @param key key of the initial monad's value
   * @param supplier supplier of the initial monad
   */
  public static _<MT extends MonadType, M extends Monad<MT, any>, K extends string, O>(
      key: K,
      supplier: AsyncFlatMapFunction<MT, [], O>
  ): AsyncFor<MT, M, WithField<K, O>> {
    return new AsyncFor([{key: key, flatMapFunction: supplier}])
  }

  /**
   * flatMap operation
   * @param K function output key
   * @param O function output type
   * @param key key of the function's result value
   * @param flatMapFunction function to be executed on the context
   */
  public _<K extends string, O>(
      key: K,
      flatMapFunction: AsyncFlatMapFunction<MT, [c: C], O>
  ): AsyncFor<MT, M, WithAdditionalField<C, K, O>> {
    return new AsyncFor(this.steps.concat({key: key, flatMapFunction: flatMapFunction}))
  }

  /**
   * yield operation
   * @param O function output type
   * @param MO output monad
   * @param mapFunction function to be executed on the context
   */
  public async yield<O, MO extends M & Monad<MT, O>>(mapFunction: MapFunction<C, O>): Promise<MO> {
    const values: any = {}
    const {key, flatMapFunction}: AsyncStep<MT> = this.steps[0]
    let monadValue: Monad<MT, any> = await flatMapFunction()
    values[key] = monadValue.unwrap()

    for (const {key, flatMapFunction} of this.steps.slice(1)) {
      monadValue = await monadValue.flatMapAsync(async () => flatMapFunction(values))
      values[key] = monadValue.unwrap()
    }

    return monadValue.map(() => mapFunction(values)) as MO
  }
}
