import {Monad} from "./common"

export type OptionType = "option"

export type Option<T> = Some<T> | None

class Some<T> implements Monad<OptionType, T> {

    constructor(readonly value: T) {
    }

    map<O>(fun: (t: T) => O): Option<O> {
        return some(fun(this.value))
    }

    flatMap<O>(fun: (t: T) => (Option<O>)): Option<O> {
        return fun(this.value)
    }

    flatMapAsync<O>(fun: (t: T) => (Promise<Option<O>>)): Promise<Option<O>> {
        return fun(this.value)
    }

}

class None implements Monad<OptionType, any> {

    static instance: None = new None()

    private constructor() {
    }

    map<O>(fun: (t: never) => O): Option<O> {
        return this
    }

    flatMap<O>(fun: (t: never) => (Option<O>)): Option<O> {
        return this
    }

    flatMapAsync<O>(fun: (t: never) => (Promise<Option<O>>)): Promise<Option<O>> {
        return Promise.resolve(this)
    }

}

export function some<T>(value: T): Option<T> {
    return new Some(value)
}

export function none<T>(): Option<T> {
    return None.instance
}

export function isSome<T>(option: Option<T>): option is Some<T> {
    return "value" in option
}

export function isNone<T>(option: Option<T>): option is None {
    return !("value" in option)
}

