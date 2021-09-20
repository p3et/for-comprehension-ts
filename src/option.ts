import {Monad} from "./monad"

export type OptionType = "option"

export type Option<T> = Monad<OptionType, T>

class Some<T> implements Option<T> {

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

class None implements Option<any> {

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
  return new Some<T>(value)
}

export function none<T>(): Option<T> {
  return None.instance;
}

export function isSome<T>(optionValue: Option<T>): optionValue is Some<T> {
  return "value" in optionValue;
}

export function isNone<T>(optionValue: Option<T>): optionValue is None {
  return !("value" in optionValue);
}

