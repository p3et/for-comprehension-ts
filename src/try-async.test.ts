import {error, isError, isOk, Try, ok} from "./try"
import {AsyncFor} from "./async-for";

test('should concat sync and async strings', async () => {
  const _try: Try<string> = await
    AsyncFor._("a", () => Promise.resolve(ok("foo")))
            ._("b", () => ok("bar"))
            ._("c", () => ok("baz"))
            .yield(({a, b, c}) => a + b + c)

  if (isOk(_try)) expect(_try.value).toBe("foobarbaz")
  else fail()
})

test('should be error and skip subsequent code', async () => {
  let executed: boolean = false

  const _try: Try<string> = await
    AsyncFor._("a", () => Promise.resolve(ok("foo")))
            ._("b", () => error("Oops!"))
            ._("c", () => {
              executed = true
              return ok("baz")
            })
            .yield(({a, b}) => a + b)

  if (isError(_try)) {
    expect(executed).toBe(false)
    expect(_try.error).toBe("Oops!")
  } else fail()
})

test('should allow for intermediate combinations', async () => {
  const _try: Try<string[]> = await
    AsyncFor._("a", () => Promise.resolve(ok("foo")))
            ._("b", ({a}) => ok([a, "bar"]))
            ._("c", () => ok("baz"))
            .yield(({b, c}) => b.concat(c))

  if (isOk(_try)) expect(_try.value).toEqual(["foo", "bar", "baz"])
  else fail()
})