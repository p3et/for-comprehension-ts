import {MonadValue} from "./monad"

export type Option = "option"

export type OptionValue<T> = MonadValue<Option, T>

class Some<T> implements OptionValue<T> {

  constructor(readonly value: T) {
  }

  map<O>(fun: () => O): MonadValue<Option, O> {
    return some(fun());
  }

  unwrap(): T | null {
    return this.value;
  }

}

class None implements OptionValue<any> {

  static instance: None = new None()

  private constructor() {
  }

  map<O>(fun: () => O): MonadValue<Option, O> {
    return this;
  }

  unwrap(): null {
    return null;
  }

}

export function some<T>(value: T): OptionValue<T> {
  return new Some<T>(value)
}

export function none<T>(): OptionValue<T> {
  return None.instance;
}

export function isSome<T>(optionValue: OptionValue<T>): optionValue is Some<T> {
  return "value" in optionValue;
}

export function isNone<T>(optionValue: OptionValue<T>): optionValue is None {
  return ! ("value" in optionValue);
}

