# for-comprehension-ts

Programming with monads such as `Option`, `Result`, `Either` or `Try` is a nice way to write programs that clearly separate domain 
logic from absence or error handling. However, the application of this approach to real-world programs often leads to large closures and accordingly large 
pyramids of braces. Haskell's do-notation or Scala's for-comprehension are a nice way to solve this problem. For example, Scala's for-comprehension looks like this:
```scala
val result: Either[String, Int] =
  for {
    dividend <- Right(42)
    divisor <- Right(2)
    divisorVerified <- if (divisor > 0) Right(divisor)
                       else Left("Divisor must be > 0!")
  } yield dividend / divisor

println(result match {
  case Right(value) => value
  case Left(error) => error
})
```

With this library we provide a similar for-comprehension for Typescript:

```typescript
const result: Result<number, string> =
  For._("dividend", () => success(42))
     ._("divisor", () => success(2))
     ._("divisorVerified", ({divisor}) => divisor > 0 ? success(divisor)
                                                      : failure("Divisor must be > 0!"))
     .yield(({dividend, divisorVerified}) => dividend / divisorVerified)

console.log(isSuccess(result) ? result.value 
                              : result.error)
```

The equivalent **without** for-comprehension would look like this:

```typescript
const result: Result<number, string> =
  success<number, string>(42)
    .flatMap(dividend => success<number, string>(2)
      .flatMap(divisor => divisor > 0 ? success(divisor)
                                      : failure("Divisor must be > 0!")
      )
      .map(divisorVerified => dividend / divisorVerified)
  )
```

Our for-comprehension improves readability and requires less explicit type hints. Further on, we provide an async 
version that allows for the seamless integration of regular and async functions using the same monads without explicit 
handling of the `Promise`:

```typescript
const result: Result<number, string> =
  await AsyncFor._("dividend", () => Promise.resolve(success(42)))
                ._("divisor", () => success(2))
                ._("divisorVerified", ({divisor}) => divisor > 0 ? success(divisor)
                                                                 : failure("Divisor must be > 0!"))
                .yield(({dividend, divisorVerified}) => dividend / divisorVerified)
```

Our for-comprehension can be used with all implementations of our `Monad`
interface with the operations `map`, `flatMap` and `flatMapAsync`. Our library already includes implementations of the following monads:


| | `Option<T>` | `Result<T, E>` | `Try<T>` |
|----|----------|----------|-------|
|abstraction| presence or<br /> absence | success or <br />explicitly typed failure | success or <br />implicitly caught exception
|constructors|`some(value: T)` <br /> `none()`|`success(value: T)` <br /> `failure(error: E)`|`ok(value: T)` <br /> `error(error: any)`


In contrast to pipes this syntax allows programs to be directed acyclic graphs (DAG) whose vertices are named values (e.g., a = 3) and where edges are functions. The graph will be executed lazily, i.e., before yield is called, there is only a definition of a program. On calling yield, execution will be triggered. Thus, for-comprehension programs can be duplicated, branched and repeated.
that, operations wil only be executed until the first failure or empty value occurs. This behavioural aspect depends on
the used monad.

If you like for-comprehension-ts, please feel free to contribute in any way!