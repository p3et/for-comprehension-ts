import {MonadType, Monad} from "./monad";

type OptionType = MonadType & "option";

type Option<A> = Monad<OptionType, A>;

export class Some<A> implements Option<A> {
    readonly type: OptionType;

    private constructor(readonly value: A) {
    }

    public static of<A>(value: A) {
        return new Some(value);
    }

    unwrap(): A {
        return this.value;
    }

    async map<B>(fun: () => (Promise<B> | B)): Promise<Monad<OptionType, B>> {
        return Some.of(await fun());
    }

    async flatMap<B>(fun: () => (Monad<OptionType, B> | Promise<Monad<OptionType, B>>)): Promise<Monad<OptionType, B>> {
        return fun();
    }

}

export class None<T> implements Option<T> {
    readonly type: OptionType;

    public static of<T>(): None<T> {
        return new None();
    }

    unwrap(): T | undefined {
        return undefined;
    }

    async map<B>(fun: () => (Promise<B> | B)): Promise<Monad<OptionType, B>> {
        return None.of();
    }

    async flatMap<B>(fun: () => (Monad<OptionType, B> | Promise<Monad<OptionType, B>>)): Promise<Monad<OptionType, B>> {
        return None.of();
    }
}

export function isPresent(option: Option<any>): boolean {
    return option.unwrap() !== undefined;
}
