# for-comprehension-ts

Programming with monads such as Option, Result or Try is a nice way to write programs that focus on domain logic rather
than error handling. However, real-world programs typically require large closures which lead to accordingly large
pyramids of braces. Haskell's do-notation or Scala's for-comprehension are a nice way to solve this problem and provide
context to monad operations.

With this repository we try to find a way that allows for an according notation in Typescript. Further on, our solution
shall be fully capable to handle async code.

We provide two interfaces in different flavours. First, there is an explicit syntax the distinguishes explicitly between
map and operations:

```typescript
For.init("a", some(3))
   .flatMap("b", () => some(["foo", "bar"]))
   .map("c", ({a, b}) => b.length + a)
   .flatMap("d", async ({b}) => some(b[1]))
   .map("e", async ({a, c}) => a * c)
   .yield(({d, e}) => `${d} ${e}`)
```

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
