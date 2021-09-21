import {Monad} from "./monad"

export type TryType = "try"

export type Try<T> = Ok<T> | Error

interface TryOperators<T> extends Monad<TryType, T> {
  recover(fun: (e: any) => Try<T>): Try<T>
}

class Ok<T> implements TryOperators<T> {

  constructor(readonly value: T) {
  }

  map<O>(fun: (t: T) => O): Try<O> {
    try {
      return ok(fun(this.value))
    } catch (reason: any) {
      return error(reason)
    }
  }

  flatMap<O>(fun: (t: T) => (Try<O>)): Try<O> {
    try {
      return fun(this.value)
    } catch (reason: any) {
      return error(reason)
    }
  }

  flatMapAsync<O>(fun: (t: T) => (Try<O> | Promise<Try<O>>))
    : Try<O> | Promise<Try<O>> {
    try {
      return fun(this.value)
    } catch (reason: any) {
      return error(reason)
    }
  }

  unwrap(): T | null {
    return this.value
  }

  recover(fun: (e: any) => Try<T>): Try<T> {
    return this
  }
}

class Error implements TryOperators<any> {

  constructor(readonly error: any) {
  }

  map<O>(fun: (t: never) => O): Try<O> {
    return this
  }

  flatMap<O>(fun: (t: never) => (Try<O>)): Try<O> {
    return this
  }

  flatMapAsync<O>(fun: (t: never) => (Try<O> | Promise<Try<O>>))
    : Try<O> | Promise<Try<O>> {
    return this
  }

  unwrap(): null {
    return null
  }

  recover(fun: (e: any) => Try<any>): Try<any> {
    return fun(this.error)
  }
}

export function ok<T>(value: T): Ok<T> {
  return new Ok(value)
}

export function error(error: any): Error {
  return new Error(error)
}

export function isOk<T>(_try: Try<T>): _try is Ok<T> {
  return "value" in _try
}

export function isError<T>(_try: Try<T>): _try is Error {
  return "error" in _try
}
