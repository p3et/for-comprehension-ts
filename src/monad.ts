export type MonadType = string;

export type MapFunction<P extends [any] | [], B> = (...params: P) => B | Promise<B>;
export type FlatMapFunction<P extends [any] | [], M extends MonadType, E, B> = (...params: P) => Monad<M, E, B> | Promise<Monad<M, E, B>>;

export interface Monad<M extends MonadType, E, T> {
    readonly monadType: M,

    unwrap(): T | undefined;

    _<B>(fun: FlatMapFunction<[], M, E, B> | MapFunction<[], B>): Promise<Monad<M, E, B>>
}

export function isMonad<M extends MonadType, E, T>(value: T | Monad<M, E, T>): value is Monad<M, E, T> {
    return (value as Monad<M, E, T>).monadType !== undefined;
}
