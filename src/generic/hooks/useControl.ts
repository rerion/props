import { ChangeEventHandler, FocusEventHandler, useState } from "react";

/**
 * TODO: should refactor this and useForm into something sane
 */

export type UseControlConfig = {
    initialValue: string | (() => string);
    validate?: (s: string) => string | undefined;
    readValue?: (s: string) => string | undefined;
}

type ChangeHandler = ChangeEventHandler<Element & { value: string }>;
type FocusHandler = FocusEventHandler<Element>

export type ControlProps = {
    value: string;
    onChange: ChangeEventHandler<Element & { value: string }>;
    onBlur: FocusEventHandler<Element>;
    error: boolean;
    helperText?: string;
};

export function useControl({
    initialValue, 
    validate = () => undefined,
    readValue = s => s,
} : UseControlConfig): ControlProps {
    const [value, setValue] = useState(initialValue);
    const [touched, setTouched] = useState(false);

    const blurHandler: FocusHandler = ev => {
        setTouched(true);
    }

    const changeHandler: ChangeHandler = ev => {
        setTouched(true);
        const text = readValue(ev.target.value);
        if (text) {
            setValue(text);
        }
    }

    const errorMsg = validate(value);

    return {
        value,
        helperText: errorMsg ? errorMsg : undefined,
        onChange: changeHandler,
        onBlur: blurHandler,
        error: touched && (errorMsg !== undefined)
    };
}