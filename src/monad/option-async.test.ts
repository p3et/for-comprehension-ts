import {isNone, isSome, none, Option, some} from "./option"
import {AsyncFor} from "../for/async";

test('should concat sync and async strings', async () => {
  const option: Option<string> = await
    AsyncFor._("a", some("foo"))
            ._("b", () => some("bar"))
            ._("c", () => Promise.resolve(some("baz")))
            .yield(({a, b, c}) => a + b + c)

  if (isSome(option)) expect(option.value).toBe("foobarbaz")
  else fail()
})

test('should be none and skip subsequent code', async () => {
  let executed: boolean = false

  const option: Option<string> = await
    AsyncFor._("a", some("foo"))
            ._("b", () => none())
            ._("c", () => {
              executed = true
              return Promise.resolve(some("baz"))
            })
            .yield(({a, b}) => a + b)

  if (isNone(option)) expect(executed).toBe(false)
  else fail()
})

test('should allow for intermediate combinations', async () => {
  const option: Option<string[]> = await
    AsyncFor._("a", some("foo"))
            ._("b", ({a}) => some([a, "bar"]))
            ._("c", () => Promise.resolve(some("baz")))
            .yield(({b, c}) => b.concat(c))

  if (isSome(option)) expect(option.value).toEqual(["foo", "bar", "baz"])
  else fail()
})