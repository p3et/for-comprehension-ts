import {Monad, isMonad, FlatMapFunction, MapFunction} from "./monad";

export type EitherType = "either";

export type Either<E, A> = Monad<EitherType, E | A>;

export class Right<E, A> implements Either<E, A> {
    readonly monadType: EitherType = "either";

    private constructor(readonly value: A) {
    }

    public static of<E, A>(value: A) {
        return new Right(value);
    }

    unwrap(): A {
        return this.value;
    }

    async _<B>(fun: FlatMapFunction<[], EitherType, B> | MapFunction<[], B>): Promise<Monad<EitherType, B>> {
        const value = await fun();
        if (isMonad(value))
            return value;
        return Right.of(value as B);
    }
}

export class Left<E, A> implements Either<E, E> {
    readonly monadType: EitherType = "either";

    private constructor(readonly error: E) {
    }

    public static of<E, A>(error: E): Left<E, A> {
        return new Left(error);
    }

    unwrap(): E | undefined {
        return undefined;
    }

    async _<B>(_fun: FlatMapFunction<[], EitherType, B> | MapFunction<[], B>): Promise<Monad<EitherType, B>> {
        return this as Either<any, any>;
    }
}

export function isLeft<E, A>(either: Either<E, A>): either is Left<E, A> {
    return either.unwrap() === undefined;
}

export function isRight<E, A>(either: Either<E, A>): either is Right<E, A> {
    return either.unwrap() !== undefined;
}

export function unwrapError<E>(either: Either<E, any>): E | undefined {
    return isLeft(either) ? either.error : undefined;
}
