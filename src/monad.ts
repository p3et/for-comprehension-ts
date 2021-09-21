export type MonadType = string;

export interface Monad<M extends MonadType, T> {
  map<O>(fun: (t: T) => O): Monad<M, O>

  flatMap<O>(fun: (t: T) => Monad<M, O>): Monad<M, O>

  flatMapAsync<O>(fun: (t: T) => Monad<M, O> | Promise<Monad<M, O>>): Monad<M, O> | Promise<Monad<M, O>>

  unwrap(): T | null
}
