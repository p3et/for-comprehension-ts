import {Monad} from "./monad"

export type ResultType = "result"

export type Result<T, E> = Success<T> | Failure<E>

class Success<T> implements Monad<ResultType, T> {

  constructor(readonly value: T) {
  }

  map<O>(fun: () => O): Monad<ResultType, O> {
    return success(fun());
  }

  flatMap<O>(fun: () => (Monad<ResultType, O> | Promise<Monad<ResultType, O>>)): Monad<ResultType, O> | Promise<Monad<ResultType, O>> {
    return fun();
  }

  unwrap(): T | null {
    return this.value;
  }
}

class Failure<E> implements Monad<ResultType, any> {

  constructor(readonly error: E) {
  }

  map<O>(fun: () => O): Monad<ResultType, O> {
    return this;
  }

  flatMap<O>(fun: () => (Monad<ResultType, O> | Promise<Monad<ResultType, O>>)): Monad<ResultType, O> | Promise<Monad<ResultType, O>> {
    return this;
  }

  unwrap(): null {
    return null;
  }
}

export function success<S>(value: S): Success<S> {
  return new Success(value)
}

export function failure<F>(error: F): Failure<F> {
  return new Failure(error);
}

export function isSuccess<T, E>(result: Result<T, E>): result is Success<T> {
  return "value" in result;
}

export function isFailure<T, E>(result: Result<T, E>): result is Failure<E> {
  return !("value" in result);
}

