

export type Monad = string;

export interface MonadValue<M extends Monad, T> {
  map<O>(fun: () => O): MonadValue<M, O>
  unwrap() : T | null
}
