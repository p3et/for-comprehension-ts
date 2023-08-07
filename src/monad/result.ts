import {Monad} from "./common"

type ResultType = "result"

export type Result<T, E> = Success<T, E> | Failure<T, E>

type ResultOperators<T, E> = {
    recover(fun: (e: E) => Result<T, E>): Result<T, E>
}

type Success<T, E> = { readonly value: T } & Monad<ResultType, T> & ResultOperators<T, E>
type Failure<T, E> = { readonly error: E } & Monad<ResultType, T> & ResultOperators<T, E>

export function success<T, E>(value: T): Success<T, E> {
    return {
        type: "result",

        value: value,

        map<O>(fun: (t: T) => O): Result<O, E> {
            return success(fun(this.value))
        },

        flatMap<O>(fun: (t: T) => Result<O, E>): Result<O, E> {
            return fun(this.value)
        },

        async flatMapAsync<O>(fun: (t: T) => Result<O, E> | Promise<Result<O, E>>): Promise<Result<O, E>> {
            return fun(this.value)
        },

        recover(fun: (e: any) => Result<T, E>): Result<T, E> {
            return this
        },
    }
}

export function failure<T, E>(error: E): Failure<T, E> {
    return {
        type: "result",

        error: error,

        map<O>(fun: (t: never) => O): Result<O, E> {
            return this
        },

        flatMap<O>(fun: (t: never) => Result<O, E>): Result<O, E> {
            return this
        },

        async flatMapAsync<O>(fun: (t: never) => Result<O, E> | Promise<Result<O, E>>): Promise<Result<O, E>> {
            return this
        },

        recover(fun: (e: E) => Result<T, E>): Result<T, E> {
            return fun(this.error)
        },
    }
}

export function isSuccess<T, E>(result: Result<T, E>): result is Success<T, E> {
    return "value" in result
}

export function isFailure<T, E>(result: Result<T, E>): result is Failure<T, E> {
    return "error" in result
}