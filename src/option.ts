import {FlatMapFunction, isMonad, MapFunction, Monad} from "./monad";

export type OptionType = "option";
export type Option<T> = Monad<OptionType, never, T>;
export type None<T> = Option<T>;
export type Some<T> = Option<T> & { value: T };

export function isNone<T>(optionValue: Option<T>): optionValue is None<T> {
    return (optionValue as Some<T>).value === undefined;
}

export function isSome<T>(optionValue: Option<T>): optionValue is Some<T> {
    return (optionValue as Some<T>).value !== undefined;
}

const noneInstance: None<any> = {
    monadType: "option",
    unwrap: () => undefined,
    _: async () => noneInstance
}

export function none<T>(): None<T> {
    return noneInstance;
}

export function some<T>(value: T): Some<T> {
    return {
        monadType: "option",
        value: value,
        unwrap: () => value,
        async _<B>(fun: FlatMapFunction<[], OptionType, never, B> | MapFunction<[], B>): Promise<Option<B>> {
            const b: B | Option<B> = await fun();

            if (isMonad(b)) {
                return b;
            }

            return some(b);
        }
    };
}
