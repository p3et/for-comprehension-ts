import {AddField, WithField} from "./for/common";
import {Monad} from "./monad/common";
import {some} from "./monad/option";
import {WithAdditionalField} from "../dist/for/common";

type ProgramStepResult<
    MonadType extends string,
    OutputType
> =
    Promise<Monad<MonadType, OutputType>>

type ProgramFunction<
    MonadType extends string,
    Input extends Record<string, any>,
    OutputType
> =
    (i: Input) => ProgramStepResult<MonadType, OutputType>

interface ProgramStep<
    MonadType extends string,
    Input extends Record<string, any>,
    OutputType,
> {
    inputKeys: (keyof Input)[],
    fun: ProgramFunction<MonadType, Input, OutputType>
}

declare function executeFlatMap<
    MonadType extends string,
    Input extends Record<string, any>,
    InputKeys extends (keyof Input)[],
    OutputKey extends string,
    OutputType,
>(
    input: Input,
    inputKeys: InputKeys,
    outputKey: Input extends WithField<OutputKey, any> ? never : OutputKey,
    fun: ProgramFunction<MonadType, Pick<Input, Extract<typeof inputKeys[number], keyof Input>>, OutputType>,
): AddField<Input, OutputKey, Promise<Monad<MonadType, OutputType>>>

type Program<MonadType extends string, Input extends Record<string, any>> =
    {
        steps: Record<keyof Input, ProgramStep<MonadType, any, any>>,
        flatMap<OutputKey extends string, OutputType>(
            outputKey: string,
            inputKeys: (keyof Input)[],
            fun: ProgramFunction<MonadType, Pick<Input, Extract<typeof inputKeys[number], keyof Input>>, OutputType>
        ): Program<MonadType, AddField<Input, OutputKey, OutputType>>
    };

function init<
    MonadType extends string,
    OutputKey extends string,
    OutputValue
>
(
    key: OutputKey,
    supplier: () => Promise<Monad<MonadType, OutputValue>>
)
    : Program<MonadType, WithField<OutputKey, OutputValue>> {

    const initialStep: ProgramStep<MonadType, Record<string, never>, OutputValue> = {
        inputKeys: [],
        fun(_: Record<string, never>): ProgramStepResult<MonadType, OutputValue> {
            return supplier()
        },
    }

    // @ts-ignore
    return {[key]: initialStep}
}


const program = init('foo', async () => some("bar"))
    .flatMap("bar", [], async (input) => some(input.foo.toUpperCase()))


// declare function declareFlatMap<
//     MonadType extends string,
//     InputProgram extends Program<MonadType>,
//     InputKeys extends (keyof InputProgram)[],
//     OutputKey extends string,
//     OutputType,
// >(
//     input: Program<MonadType, Input, OutputType>,
//     inputKeys: InputKeys,
//     outputKey: InputProgram extends WithField<OutputKey, any> ? never : OutputKey,
//     fun: ProgramFunction<MonadType, Pick<InputProgram, Extract<typeof inputKeys[number], keyof InputProgram>>, OutputType>,
// ): Program<MonadType, Input, OutputType>



var result = executeFlatMap({x: 1}, ['x'], 'y', async (v) => some(v.x));


