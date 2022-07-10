import { ChangeEventHandler, FocusEventHandler, useState } from "react";

type ControlConfig = {
    initialValue: string | (() => string);
    disabled?: boolean;
    readValue?: (s: string) => string | undefined;
    validate?: (s: string) => string | undefined;
}

type ChangeHandler = ChangeEventHandler<Element & { value: string }>;
type FocusHandler = FocusEventHandler<Element>
export type ControlProps = {
    value: string;
    onChange: ChangeHandler;
    onBlur: FocusHandler;
    error: boolean;
    disabled: boolean;
    helperText: string | undefined;
}

export type ControlsConfig = {
    [key: string]: ControlConfig;
}

type ControlsValues<C extends ControlsConfig> = {
    [key in keyof C]: string;
}
type ControlsProps<C extends ControlsConfig> = {
    [key in keyof C]: ControlProps;
}

export type FormConfig<C extends ControlsConfig, V = ControlsValues<C>> = {
    controls: C;
    valueAdapter?: (c: ControlsValues<C>) => V;
    submit: (v: V) => void;
}

export type FormProps<C extends ControlsConfig> = {
    onSubmit: () => void;
    controlProps: ControlsProps<C>;
}

// TODO: (bug) cannot clear control
export function useForm<C extends ControlsConfig, V = ControlsValues<C>>(cfg: FormConfig<C, V>): FormProps<C> {
    type CKey = keyof C;
    type State = {
        [key in CKey]: {
            value: string;
            setValue: (s: string) => void;
            touched: boolean;
            setTouched: (b: boolean) => void;
        }
    }

    const controlNames = Object.keys(cfg.controls) as CKey[];

    const state = {} as State;
    const controlProps = {} as  ControlsProps<C>;

    for (const name of controlNames) {
        const control = cfg.controls[name];
        const [value, setValue] = useState(control.initialValue);  // eslint-disable-line
        const [touched, setTouched] = useState(false);  // eslint-disable-line
        state[name] = { value, setValue, touched, setTouched }; 

        const onChange: ChangeHandler = ev => {
            setTouched(true);
            const readValue = control.readValue || (s => s);
            const newValue = readValue(ev.target.value);
            if (newValue) {
                setValue(newValue);
            }
        }

        const onBlur: FocusHandler = () => {
            setTouched(true);
        }

        const helperText = control.validate && control.validate(value);
        const error = !!helperText && touched;
        const disabled = !!control.disabled;

        controlProps[name] = {
            value, onChange, onBlur, helperText, error, disabled
        };
    }

    const onSubmit = () => {
        let isValid = true;
        const value = {} as ControlsValues<C>;
        for (const name of controlNames) {
            state[name].setTouched(true);
            value[name] = state[name].value;
            isValid = isValid && !controlProps[name].helperText;
        }
        const valueAdapter = cfg.valueAdapter || (c => c as unknown as V); // DANGEROUS CAST
        if (isValid) {
            cfg.submit(valueAdapter(value));
        }
    }

    return {
        controlProps, onSubmit
    };
}