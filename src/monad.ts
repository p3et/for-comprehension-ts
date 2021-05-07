export type MonadType = string;

export type MapFunction<P extends [any] | [], B> = (...params: P) => B | Promise<B>;
export type FlatMapFunction<P extends [any] | [], M extends MonadType, B> = (...params: P) => Monad<M, B> | Promise<Monad<M, B>>;

export interface Monad<M extends MonadType, A> {
    readonly monadType: M,

    unwrap(): A | undefined;

    _<B>(fun: FlatMapFunction<[], M, B> | MapFunction<[], B>): Promise<Monad<M, B>>
}

export function isMonad<M extends MonadType, T>(value: T | Monad<M, T>): value is Monad<M, T> {
    return (value as Monad<M, T>).monadType !== undefined;
}
