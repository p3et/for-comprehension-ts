# for-comprehension-ts

Programming with monads such as `Result`, `Either` or `Try` aka Railway Oriented Programming is an elegant way to write 
programs that clearly separate domain logic from error handling. With *for-comprehension-ts* we aim to overcome 
three major limitations that we found in the application of this approach to real-world programs with TypeScript:

### 1. Improved code readability
Typical applications such as validation of complex data objects. Such scenarios may have 10 or more steps and the 
output of the first steps is required in multiple further steps. Implementing this with method chaining
`am.flatMap((a) => bm.flatMap((b) => ...)` quickly leads to large closures and according accordingly large pyramids of 
braces. We also think that pipes `pipe(result, (a) => success([a, a + 1]), ([a, b]) => ...)` are no elegant solution to this 
problem as parameters must be explicitly passed along functions.  

In other programming languages there are language features such as Haskell's do-notation or Scala's for-comprehension 
that provide a solution to this problem. For example, Scala's for-comprehension looks like this:

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

With *for-comprehension-ts* we provide a similar syntax for TypeScript:

```typescript
const result = For
    .result<string>()
    .sync("dividend", () => success(42))
    .fm("divisor", () => success(2))
    .fm("divisorVerified", ({divisor}) =>
        divisor > 0
            ? success(divisor)
            : failure<number, string>("Divisor must be > 0!"))
    .yield(({dividend, divisorVerified}) => dividend / divisorVerified)

console.log(isSuccess(result) ? result.value : result.error)
```

We think that *for-comprehension-ts* improves readability of railway oriented code. We start with `For.result<E>()` to 
set a custom error type `E`. With each of the following lines (constructor `sync` or flatMap `fm`) we add a value to 
a parameter object that is available to all following steps. The field name is set by passing a string as first 
parameter. By destructuring its easy to see where these values are read later on. 
Finally, by passing a map function to the `yield` operator, a single value is derived from all intermediate ones. 
Of course, the programm will only be executed until the first step results into failure. 
Besides this, our programm declaration is fully type-safe and requires only few type hints. 

In the first version of this library, we tried to make for-comprehension generic to support custom monads. 
However, due to the missing support for [higher kinded types](https://github.com/microsoft/TypeScript/issues/1213) we failed to do this in a way that is both 
easy to read and without the need for excessive type hints. Thus, we focussed on a `Result<T, E>` monad as , 
from our experience, it is most important in real-word applications. 

### 2. No unboxing of promises

Another major problem we were facing while working with Monads in TypeScript was the permanent dealing with 
`Promise<Result<T, E>>`. With *for-comprehension-ts*, we provide a seamless integration of regular and async functions 
using the same syntax:

```typescript
const result = await For
    .result<string>()
    .async("dividend", async () => success(42))
    .fm("divisor", () => success(2))
    .fm("divisorVerified", ({divisor}) =>
        divisor > 0
            ? success(divisor)
            : failure<number, string>("Divisor must be > 0!"))
    .yield(({dividend, divisorVerified}) => dividend / divisorVerified)

console.log(isSuccess(result) ? result.value : result.error)
```

The only differences are:
- alternative constructor `async<E>`
- support for async functions for both constructor `async` and flatMap `fm` 
- `yield<T>` will result into a `Promise<Result<T, E>>`.

### 3. Optimization of async programs

There are scenarios where the simultaneous execution of multiple promises will lead to faster execution of programs, 
for example, if waiting times for external services do not add up. To allow for such optimizations we provide `fmp`, a 
variant of flatMap where required input fields of the parameter object must be whitelisted. Such programs form a
directed acyclic graphs (DAG) whose vertices are named values (e.g., a = 3) and where edges are asynchronous flatMap 
operations. Based on this information, we can optimize promise execution. However, although it is possible to declare such 
programs, the actual optimization is not implemented yet. We hope to add this feature soon.

```typescript
const result = await For
    .result<string>()
    .async("a", () => serviceA())
    .fmp("b", ["a"], ({a}) => serviceB(a))
    .fmp("c", ["a"], ({a}) => serviceC(a))
    .yield(({b, c}) => b + c)
```

### Contribution

If you like for-comprehension-ts, please feel free to contribute in any way!