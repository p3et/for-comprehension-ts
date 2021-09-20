export type MonadType = string;

export interface Monad<M extends MonadType, T> {
  map<O>(fun: () => O): Monad<M, O>
  flatMap<O>(fun: () => Monad<M, O> | Promise<Monad<M, O>>): Monad<M, O> | Promise<Monad<M, O>>
  unwrap() : T | null
}
