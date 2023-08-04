import {Monad} from "./common"

type TryType = "try"

export type Try<T> = Ok<T> | Error<T>

type TryOperators<T> = {
    recover(fun: (e: any) => Try<T>): Try<T>
}

type Ok<T> = { readonly value: T } & Monad<TryType, T> & TryOperators<T>;
type Error<T> = { readonly error: any } & Monad<TryType, T> & TryOperators<T>;

export function ok<T>(value: T): Ok<T> {
    return {
        value: value,

        map<O>(fun: (t: T) => O): Try<O> {
            try {
                return ok(fun(this.value))
            } catch (reason: any) {
                return error(reason)
            }
        },

        flatMap<O>(fun: (t: T) => Try<O>): Try<O> {
            try {
                return fun(this.value)
            } catch (reason: any) {
                return error(reason)
            }
        },

        async flatMapAsync<O>(fun: (t: T) => Try<O> | Promise<Try<O>>): Promise<Try<O>> {
            try {
                return fun(this.value)
            } catch (reason: any) {
                return error(reason)
            }
        },

        recover(fun: (e: any) => Try<T>): Try<T> {
            return this
        },
    }
}

export function error<T>(error: any): Error<T> {
    return {
        error: error,

        map<O>(fun: (t: never) => O): Try<O> {
            return this
        },

        flatMap<O>(fun: (t: never) => (Try<O>)): Try<O> {
            return this
        },

        flatMapAsync<O>(fun: (t: never) => Try<O> | Promise<Try<O>>): Promise<Try<O>> {
            return this
        },

        recover(fun: (e: any) => Try<any>): Try<any> {
            return fun(this.error)
        },
    }
}

export function isOk<T>(_try: Try<T>): _try is Ok<T> {
    return "value" in _try
}

export function isError<T>(_try: Try<T>): _try is Error<T> {
    return "error" in _try
}
