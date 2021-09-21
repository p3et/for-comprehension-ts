import {Monad} from "./monad"

export type OptionType = "option"

export type Option<T> = Monad<OptionType, T>

class Some<T> implements Option<T> {

  constructor(readonly value: T) {
  }

  map<O>(fun: (t: T) => O): Option<O> {
    return some(fun(this.value))
  }

  flatMap<O>(fun: (t: T) => (Option<O>)): Option<O> {
    return fun(this.value)
  }

  flatMapAsync<O>(fun: (t: T) => (Option<O> | Promise<Option<O>>))
    : Option<O> | Promise<Option<O>> {
    return fun(this.value)
  }

  unwrap(): T | null {
    return this.value
  }
}

class None implements Option<any> {

  static instance: None = new None()

  private constructor() {
  }

  map<O>(fun: (t: never) => O): Option<O> {
    return this
  }

  flatMap<O>(fun: (t: never) => (Option<O>)): Option<O> {
    return this
  }

  flatMapAsync<O>(fun: (t: never) => (Option<O> | Promise<Option<O>>))
    : Option<O> | Promise<Option<O>> {
    return this
  }

  unwrap(): null {
    return null
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

