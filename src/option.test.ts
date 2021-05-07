import {isPresent, None, Option, Some} from "./option";
import {For} from "./for";

test('should be some 7', async done =>
    For._("a", Some.of(1))
       ._("b", () => Some.of("two"))
       ._("c", () => Promise.resolve(3))
       ._("d", ({a, c}) => Promise.resolve(Some.of([c, a])))
       .yield(({a, b, c, d}) => (a + b.length + c) * d.sort()[0])
       .then(option => {
           expect(isPresent(option)).toBeTruthy();
           expect(option.unwrap()).toBe(7);
       })
       .then(() => done())
)

test('should be none', async done =>
    For._("a", Some.of(1))
       ._("b", () => None.of<string>())
       ._("c", () => Promise.resolve(3))
       ._("d", ({a, c}) => Promise.resolve(Some.of([c, a])))
       .yield(({a, b, c, d}) => (a + b.length + c) * d.sort()[0])
       .then(option => expect(isPresent(option)).toBeFalsy())
       .then(() => done())
)
