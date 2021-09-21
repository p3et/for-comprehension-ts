import {Monad} from "./monad"

export type ResultType = "result"

export type Result<T, E> = Monad<ResultType, T> & ResultOperators<T, E>

interface ResultOperators<T, E> {
  recover(fun: (e: E) => Result<T, E>): Result<T, E>
}

class Success<T> implements Result<T, any> {

  constructor(readonly value: T) {
  }

  map<O>(fun: (t: T) => O): Monad<ResultType, O> {
    return success(fun(this.value));
  }

  flatMap<O>(fun: (t: T) => (Monad<ResultType, O>)): Monad<ResultType, O> {
    return fun(this.value);
  }

  flatMapAsync<O>(fun: (t: T) => (Monad<ResultType, O> | Promise<Monad<ResultType, O>>))
    : Monad<ResultType, O> | Promise<Monad<ResultType, O>> {
    return fun(this.value);
  }

  unwrap(): T | null {
    return this.value;
  }

  recover(fun: (e: any) => Result<T, any>): Result<T, any> {
    return this;
  }
}

class Failure<E> implements Result<any, E> {

  constructor(readonly error: E) {
  }

  map<O>(fun: (t: never) => O): Monad<ResultType, O> {
    return this;
  }

  flatMap<O>(fun: (t: never) => (Monad<ResultType, O>)): Monad<ResultType, O> {
    return this;
  }

  flatMapAsync<O>(fun: (t: never) => (Monad<ResultType, O> | Promise<Monad<ResultType, O>>))
    : Monad<ResultType, O> | Promise<Monad<ResultType, O>> {
    return this;
  }

  unwrap(): null {
    return null;
  }

  recover(fun: (e: E) => Result<any, E>): Result<any, E> {
    return fun(this.error);
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
