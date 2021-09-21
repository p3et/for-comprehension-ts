export type MonadType = string

/**
 * representation of a monad that is compatible with our for-comprehension
 * @param M monad type
 * @param T value type
 */
export interface Monad<M extends MonadType, T> {
  map<O>(fun: (t: T) => O): Monad<M, O>

  flatMap<O>(fun: (t: T) => Monad<M, O>): Monad<M, O>

  flatMapAsync<O>(fun: (t: T) => Monad<M, O> | Promise<Monad<M, O>>): Monad<M, O> | Promise<Monad<M, O>>

  /**
   * Access a monad's value directly
   * This method is essential for our for-comprehension BUT should not used otherwise
   */
  unwrap(): T | null
}
