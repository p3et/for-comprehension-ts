import {MonadType, Monad, MonadReturnValue, isMonad} from "./monad";

type OptionType = MonadType & "option";

type Option<A> = Monad<OptionType, A>;

export class Some<A> implements Option<A> {
    readonly monadType = "option";

    private constructor(readonly value: A) {
    }

    public static of<A>(value: A) {
        return new Some(value);
    }

    unwrap(): A {
        return this.value;
    }

    async _<B>(fun: () => MonadReturnValue<OptionType, B>): Promise<Monad<OptionType, B>> {
        const value = await fun();
        if (isMonad(value))
            return value;
        return Some.of(value as B);
    }
}

export class None<A> implements Option<A> {
    readonly monadType = "option";

    public static of<A>(): None<A> {
        return new None();
    }

    unwrap(): A | undefined {
        return undefined;
    }

    async _<B>(fun: () => MonadReturnValue<OptionType, B>): Promise<Monad<OptionType, B>> {
        return None.of();
    }
}

export function isPresent(option: Option<any>): boolean {
    return option.unwrap() !== undefined;
}
