import {For} from "./for"
import {success, failure, isSuccess, isFailure} from "./result";

test('should concat sync and async strings', async done =>
  For._("a", () => success("foo"))
     ._("b", () => success("bar"))
     ._("c", () => Promise.resolve(success("baz")))
     .yield(({a, b, c}) => a + b + c)
     .then(result => {
       if (isSuccess(result)) expect(result.value).toBe("foobarbaz")
       else fail()
     })
     .then(() => done())
)

let executed = false
test('should be none and skip subsequent code', async done =>
  For._("a", () => success("foo"))
     ._("b", () => failure("Ooops!"))
     ._("b", () => {
       executed = true
       return success("baz")
     })
     .yield(({a, b}) => a + b)
     .then(result => {
       if (isFailure(result)) expect(result.error).toBe("Ooops!")
       else fail()
     })     .then(() => done())
)

test('should allow for intermediate combinations', async done =>
  For._("a", () => success("foo"))
     ._("b", ({a}) => success([a, "bar"]))
     ._("c", () => success("baz"))
     .yield(({b, c}) => b.concat(c))
     .then(result => {
       if (isSuccess(result)) expect(result.value).toEqual(["foo", "bar", "baz"])
       else fail()
     })
     .then(() => done())
)