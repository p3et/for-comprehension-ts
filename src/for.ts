import {Monad} from "./monad/common";
import {some} from "./monad/option";

declare function evaluate<M extends string, I, T>(program: Program<M, I>, fun: (i: I) => T): Promise<Monad<M, T>>

function flatMap<M extends string, I, K extends string, V>(
    program: Program<M, I>,
    key: I extends { [_ in K]: V } ? never : K,
    fun: (i: I) => Promise<Monad<M, V>>): Program<M, I & { [_ in K]: V }> {
    return {
        flatMap<K, V>(key: I & { [_ in K]: V } extends { [_ in K]: V } ? never : K, fun: <I, V, K>(i: (I & { [_ in K]: V })) => Promise<Monad<M, V>>): Program<M, I & { [_ in K]: V } & { [_ in K]: V }> {
            return undefined;
        },
        steps: undefined,
        yield<T>(fun: <I, V, K>(i: (I & { [_ in K]: V })) => T): Promise<Monad<M, T>> {
            return Promise.resolve(undefined);
        }
    }
}

function init<M extends string, K extends string, V>(
    key: K,
    fun: () => Promise<Monad<M, V>>
): Program<M, { [_ in K]: V }> {
    return {
        // @ts-ignore
        steps: {
            [key.toString()]: fun
        },
        flatMap<L extends string, W>(
            key: { [_ in K]: V } extends { [_ in L]: W } ? never : L,
            fun: (i: { [_ in K]: V }) => Promise<Monad<M, W>>
        ): Program<M, { [_ in K]: V } & { [_ in L]: W }> {
            return flatMap(this, key, fun);
        },
        yield<T>(
            fun: (i: { [_ in K]: V }) => T
        ): Promise<Monad<M, T>> {
            return evaluate(this, fun);
        }
    }
}

type Program<M extends string, I extends Record<string, any>> = {
    steps: { [_ in keyof I]: (i: I) => Promise<Monad<M, any>> }
    flatMap<K extends string, V>(key: I extends { [_ in K]: V } ? never : K, fun: (i: I) => Promise<Monad<M, V>>): Program<M, I & { [_ in K]: V }>
    yield<T>(fun: (i: I) => T): Promise<Monad<M, T>>
}

const x = init("foo", async () => some(1))
    .flatMap("bar", async (i) => some(i.foo * 2))
    .yield((i) => i.foo);

x.then(console.log);