import {Monad} from "./monad"

export type OptionType = "option"

export type Option<T> = Monad<OptionType, T>

class Some<T> implements Option<T> {

  constructor(readonly value: T) {
  }

  map<O>(fun: (t: T) => O): Monad<OptionType, O> {
    return some(fun(this.value));
  }

  flatMap<O>(fun: (t: T) => (Monad<OptionType, O>)): Monad<OptionType, O> {
    return fun(this.value);
  }

  flatMapAsync<O>(fun: (t: T) => (Monad<OptionType, O> | Promise<Monad<OptionType, O>>))
    : Monad<OptionType, O> | Promise<Monad<OptionType, O>> {
    return fun(this.value);
  }

  unwrap(): T | null {
    return this.value;
  }
}

class None implements Option<any> {

  static instance: None = new None()

  private constructor() {
  }

  map<O>(fun: (t: never) => O): Monad<OptionType, O> {
    return this;
  }

  flatMap<O>(fun: (t: never) => (Monad<OptionType, O>)): Monad<OptionType, O> {
    return this;
  }

  flatMapAsync<O>(fun: (t: never) => (Monad<OptionType, O> | Promise<Monad<OptionType, O>>))
    : Monad<OptionType, O> | Promise<Monad<OptionType, O>> {
    return this;
  }

  unwrap(): null {
    return null;
  }
}

export function some<T>(value: T): Option<T> {
  return new Some(value)
}

export function none<T>(): Option<T> {
  return None.instance;
}

export function isSome<T>(option: Option<T>): option is Some<T> {
  return "value" in option;
}

export function isNone<T>(option: Option<T>): option is None {
  return !("value" in option);
}

