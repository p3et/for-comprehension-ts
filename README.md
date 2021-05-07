# for-comprehension-ts
Programming with monads such as Option, Result or Try is a nice way to write programs that focus on domain logic rather
than error handling. However, real-world programs typically require large closures which lead to accordingly large
pyramids of braces. Haskell's do-notation or Scala's for-comprehension are a nice way to solve this problem and provide
context to monad operations.

With this repository we try to find a way that allows for an according notation in Typescript. Further on, our solution
shall be fully capable to handle async code:

```typescript
For._("a", some(1))
   ._("b", () => some("two"))
   ._("c", () => Promise.resolve(3))
   ._("d", ({a, c}) => Promise.resolve(some([c, a])))
   .yield(({a, b, c, d}) => (a + b.length + c) * d.sort()[0])
   .then(option => {
       if (isSome(option)) expect(option.value).toBe(7);
       else fail();
   })
```
