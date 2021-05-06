export type MonadType = string;

export type MonadReturnValue<M extends MonadType, B> = Monad<M, B> | Promise<Monad<M, B>> | B | Promise<B>;

export interface Monad<M extends MonadType, A> {
    readonly monadType: M,

    unwrap(): A | undefined;

    _<B>(fun: () => MonadReturnValue<M, B>): Promise<Monad<M, B>>
}

export function isMonad(value: any): value is Monad<any, any> {
    const valueAsMonad = value as Monad<any, any>;
    return valueAsMonad.monadType !== undefined && valueAsMonad._ !== undefined;
}
