import {FlatMapFunction, isMonad, MapFunction, Monad} from "./monad";

export type ResultType = "result";
export type Result<E, T> = Monad<ResultType, T>;
export type Failure<E, T> = Result<E, T> & { error: E };
export type Success<E, T> = Result<E, T> & { value: T };

export function isFailure<E, T>(optionValue: Result<E, T>): optionValue is Failure<E, T> {
    return (optionValue as Failure<E, T>).error !== undefined;
}

export function isSuccess<E, T>(optionValue: Result<E, T>): optionValue is Success<E, T> {
    return (optionValue as Success<E, T>).value !== undefined;
}

export function failure<E, T>(error: E): Failure<E, T> {
    return {
        monadType: "result",
        error: error,
        unwrap: () => undefined,
        async _<B>(fun: FlatMapFunction<[], ResultType, B> | MapFunction<[], B>): Promise<Monad<ResultType, B>> {
            return this;
        }
    };
}

export function success<E, T>(value: T): Success<E, T> {
    return {
        monadType: "result",
        value: value,
        unwrap: () => this.value,
        async _<B>(fun: FlatMapFunction<[], ResultType, B> | MapFunction<[], B>): Promise<Monad<ResultType, B>> {
            const b: B | Result<E, B> = await fun();

            if (isMonad(b)) {
                return b;
            }

            return success(b);
        }
    };
}
