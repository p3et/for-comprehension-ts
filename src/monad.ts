export type MonadType = string;

export type MapFunction<P extends [any] | [], B> = (...params: P) => B | Promise<B>;
export type FlatMapFunction<P extends [any] | [], M extends MonadType, B> = (...params: P) => Monad<M, B> | Promise<Monad<M, B>>;

export interface Monad<M extends MonadType, A> {
    readonly monadType: M,

    unwrap(): A | undefined;

    _<B>(fun: FlatMapFunction<[], M, B> | MapFunction<[], B>): Promise<Monad<M, B>>
}

export function isMonad(value: any): value is Monad<any, any> {
    const valueAsMonad = value as Monad<any, any>;
    return valueAsMonad.monadType !== undefined && valueAsMonad._ !== undefined;
}
