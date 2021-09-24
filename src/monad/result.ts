import {Monad} from "./common"

export type ResultType = "result"

export type Result<T, E> = Success<T, E> | Failure<T, E>

interface ResultOperators<T, E> extends Monad<ResultType, T>{
  recover(fun: (e: E) => Result<T, E>): Result<T, E>
}

class Success<T, E> implements ResultOperators<T, E> {

  constructor(readonly value: T) {
  }

  map<O>(fun: (t: T) => O): Result<O, E> {
    return success(fun(this.value))
  }

  flatMap<O>(fun: (t: T) => (Result<O, E>)): Result<O, E> {
    return fun(this.value)
  }

  flatMapAsync<O>(fun: (t: T) => (Result<O, E> | Promise<Result<O, E>>))
    : Result<O, any> | Promise<Result<O, E>> {
    return fun(this.value)
  }

  unwrap(): T | null {
    return this.value
  }

  recover(fun: (e: any) => Result<T, E>): Result<T, E> {
    return this
  }
}

class Failure<T, E> implements ResultOperators<T, E> {

  constructor(readonly error: E) {
  }

  map<O>(fun: (t: never) => O): Result<O, E> {
    return this
  }

  flatMap<O>(fun: (t: never) => (Result<O, E>)): Result<O, E> {
    return this
  }

  flatMapAsync<O>(fun: (t: never) => (Result<O, E> | Promise<Result<O, E>>))
    : Result<O, E> | Promise<Result<O, E>> {
    return this
  }

  unwrap(): null {
    return null
  }

  recover(fun: (e: E) => Result<T, E>): Result<T, E> {
    return fun(this.error)
  }
}

export function success<T, E>(value: T): Success<T, E> {
  return new Success(value)
}

export function failure<T, E>(error: E): Failure<T, E> {
  return new Failure(error)
}

export function isSuccess<T, E>(result: Result<T, E>): result is Success<T, E> {
  return "value" in result
}

export function isFailure<T, E>(result: Result<T, E>): result is Failure<T, E> {
  return "error" in result
}
