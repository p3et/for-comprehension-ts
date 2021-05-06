export type MonadType = string;

export interface Monad<M extends MonadType, A> {
    readonly type: M,

    unwrap(): A | undefined;

    map<B>(fun: () => B | Promise<B>): Promise<Monad<M, B>>

    flatMap<B>(fun: () => Monad<M, B> | Promise<Monad<M, B>>): Promise<Monad<M, B>>
}
