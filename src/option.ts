import {Monad} from "./monad"

export type OptionType = "option"

export type Option<T> = Some<T> | None

class Some<T> implements Monad<OptionType, T> {

  constructor(readonly value: T) {
  }

  map<O>(fun: () => O): Monad<OptionType, O> {
    return some(fun());
  }

  flatMap<O>(fun: () => (Monad<OptionType, O> | Promise<Monad<OptionType, O>>)): Monad<OptionType, O> | Promise<Monad<OptionType, O>> {
    return fun();
  }

  unwrap(): T | null {
    return this.value;
  }
}

class None implements Monad<OptionType, any> {

  static instance: None = new None()

  private constructor() {
  }

  map<O>(fun: () => O): Monad<OptionType, O> {
    return this;
  }

  flatMap<O>(fun: () => (Monad<OptionType, O> | Promise<Monad<OptionType, O>>)): Monad<OptionType, O> | Promise<Monad<OptionType, O>> {
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

