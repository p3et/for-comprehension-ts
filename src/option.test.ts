import {isNone, isSome, none, some} from "./option";
import {For} from "./for";
import {isSuccess} from "./result";

test('should be some 7', async done =>
    For._("a", some(1))
       ._("b", () => some("two"))
       ._("c", () => Promise.resolve(3))
       ._("d", ({a, c}) => Promise.resolve(some([c, a])))
       .yield(({a, b, c, d}) => (a + b.length + c) * d.sort()[0])
       .then(option => {
           if (isSome(option)) expect(option.value).toBe(7);
           else fail();
       })
       .then(() => done())
)

test('should be none', async done =>
    For._("a", some(1))
       ._("b", () => none<string>())
       ._("c", () => Promise.resolve(3))
       ._("d", ({a, c}) => Promise.resolve(some([c, a])))
        // @ts-ignore
       .yield(({a, b, c, d}) => (a + b.length + c) * d.sort()[0])
       .then(option => expect(isNone(option)).toBe(true))
       .then(() => done())
)
