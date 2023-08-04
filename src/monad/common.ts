export type MonadType = string

/**
 * representation of a monad that is compatible with our for-comprehension
 * @param M monad type
 * @param T value type
 */
export interface Monad<MT extends MonadType, T> {

  map<O>(fun: (t: T) => O): Monad<MT, O>

  flatMap<O>(fun: (t: T) => Monad<MT, O>): Monad<MT, O>

  flatMapAsync<O>(fun: (t: T) => Promise<Monad<MT, O>>): Promise<Monad<MT, O>>
}
