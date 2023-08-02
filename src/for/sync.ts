import {Monad, MonadType} from "../monad/common"
import {MapFunction, AddField, WithField} from "./common";

type FlatMapFunction<MT extends MonadType, P extends [any] | [], O> = (...params: P) => Monad<MT, O>
type Step<MT extends MonadType> = { readonly key: string, readonly flatMapFunction: FlatMapFunction<MT, any, any> }

function isMonad(monadOrFlatMap: Monad<any, any> | FlatMapFunction<any, any, any>): monadOrFlatMap is Monad<any, any> {
  return !(monadOrFlatMap instanceof Function)
}

/**
 * representation of for-comprehension steps, execution and constructors
 * @param MT monad type
 * @param M monad
 * @param V values
 */
export class For<MT extends MonadType, M extends Monad<MT, any>, V> {

  private constructor(private readonly steps: Step<MT>[]) {
  }

  /**
   * constructor
   * @param MT monad type
   * @param M monad
   * @param K function output key
   * @param O function output type
   * @param key key of the initial monad's value
   * @param monadOrSupplier (supplier of the) initial monad
   */
  public static _<MT extends MonadType, M extends Monad<MT, any>, K extends string, O>(
      key: K,
      monadOrSupplier: Monad<MT, O> | FlatMapFunction<MT, [], O>
  ): For<MT, M, WithField<K, O>> {
    const flatMap: FlatMapFunction<MT, any, any> = isMonad(monadOrSupplier) ? () => monadOrSupplier : monadOrSupplier

    return new For([{key: key, flatMapFunction: flatMap}])
  }

  /**
   * flatMap operation
   * @param K function output key
   * @param O function output type
   * @param key key of the function's result value
   * @param monadOrFlatMap monad or function to be executed on the values
   */
  public _<K extends string, O>(
      key: K,
      monadOrFlatMap: Monad<MT, O> | FlatMapFunction<MT, [c: V], O>
  ): For<MT, M, AddField<V, K, O>> {
    const flatMap: FlatMapFunction<MT, any, any> = isMonad(monadOrFlatMap) ? () => monadOrFlatMap : monadOrFlatMap

    return new For<MT, M, AddField<V, K, O>>(this.steps.concat({key: key, flatMapFunction: flatMap}))
  }

  /**
   * yield operation
   * @param O function output type
   * @param MO output monad
   * @param mapFunction function to be executed on the values
   */
  public yield<O, MO extends M & Monad<MT, O>>(mapFunction: MapFunction<V, O>): MO {
    const values: any = {}
    const {key, flatMapFunction}: Step<MT> = this.steps[0]
    let monad: Monad<MT, any> = flatMapFunction()
    values[key] = monad.unwrap()

    for (const {key, flatMapFunction} of this.steps.slice(1)) {
      monad = monad.flatMap(() => flatMapFunction(values))
      values[key] = monad.unwrap()
    }

    return monad.map(() => mapFunction(values)) as MO
  }
}