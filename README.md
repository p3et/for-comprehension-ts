# for-comprehension-ts

Programming with monads such as `Option`, `Result` or `Try` is a nice way to write programs that clearly separate domain 
logic and error handling. However, real-world programs typically require large closures which lead to accordingly large 
pyramids of braces. Haskell's do-notation or Scala's for-comprehension are a nice way to solve this problem and provide
context to monad operations.

With this library we provide for-comprehension for Typescript. For example:

```typescript
const result: Result<number, string> =
  For._("dividend", () => success(42))
     ._("divisor", () => success(2))
     ._("divisorVerified", ({divisor}) => divisor > 0 ? success(divisor)
                                                      : failure("Divisor must be > 0!"))
     .yield(({dividend, divisorVerified}) => dividend / divisorVerified)

if (isSuccess(result)) console.log(result.value)
```

is logically the same as the following Scala code:

```scala
val result: Either[String, Int] =
  for {
    dividend <- Right(42)
    divisor <- Right(2)
    divisorVerified <- if (divisor > 0) Right(divisor)
                       else Left("Divisor must be > 0!")
  } yield dividend / divisor

result match {
  case Right(value) => println(value)
}
```

It can be used with all implementations of our `Monad`
interface. Our library already includes implementation for `Option`, `Result` or `Try`

Second, there is our slim syntax which implicitly distinguishes map and flatMap based on the function's signature:

```typescript
For._("a", some(3)) // initializer
   ._("b", () => some(["foo", "bar"])) // sync flatMap
   ._("c", ({a, b}) => b.length + a) // sync map
   ._("d", async ({b}) => some(b[1])) // async flatMap
   ._("e", async ({a, c}) => a * c) // async map
   .yield(({d, e}) => `${d} ${e}`) // execute and map
```

Under the hood, both syntaxes will be executed in exactly the same way. In contrast to pipes this syntax allows programs
to be directed acyclic graphs (DAG) whose vertices are named values (e.g., a = 3) and where edges are monad operations
such as map and flapMap. Programs can be duplicated, branched and repeated.

Before yield is called, there is only a definition of a program. On calling yield, execution will be triggered. After
that, operations wil only be executed until the first failure or empty value occurs. This behavioural aspect depends on
the used monad.
