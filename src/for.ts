import {AddField, WithField} from "./for/common";

declare function execute<
    Input,
    InputKeys extends (keyof Input)[],
    OutputKey extends string,
    Output,
>(
    input: Input,
    inputKeys: InputKeys,
    outputKey: Input extends WithField<OutputKey, any> ? never : OutputKey,
    fun: (i: Pick<Input, Extract<typeof inputKeys[number], keyof Input>>) => Output,
): AddField<Input, OutputKey, Output>


const x = {x: 1, y: 2};

const y = execute(x, ['y'], 'z', (i) => i.y)
