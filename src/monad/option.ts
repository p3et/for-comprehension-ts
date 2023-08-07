import {Monad} from "./common"

type OptionType = "option"

export type Option<T> = Some<T> | None<T>

type Some<T> = { readonly value: T } & Monad<OptionType, T>
type None<T> = Monad<OptionType, T>

export function some<T>(value: T): Option<T> {
    return {
        type: "option",

        value: value,

        map<O>(fun: (t: T) => O): Option<O> {
            return some(fun(this.value))
        },

        flatMap<O>(fun: (t: T) => Option<O>): Option<O> {
            return fun(this.value)
        },

        async flatMapAsync<O>(fun: (t: T) => Option<O> | Promise<Option<O>>): Promise<Option<O>> {
            return fun(this.value)
        },
    }
}

export function none<T>(): Option<T> {
    return {
        type: "option",

        map<O>(fun: (t: never) => O): Option<O> {
            return this
        },

        flatMap<O>(fun: (t: never) => Option<O>): Option<O> {
            return this
        },

        flatMapAsync<O>(fun: (t: never) => Option<O> | Promise<Option<O>>): Promise<Option<O>> {
            return this
        }
    }
}

export function isSome<T>(option: Option<T>): option is Some<T> {
    return "value" in option
}

export function isNone<T>(option: Option<T>): option is None<T> {
    return !("value" in option)
}



