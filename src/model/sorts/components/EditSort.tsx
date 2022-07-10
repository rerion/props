import { Stack, TextField, Button } from "@mui/material";

import { domainSet } from "../sorts.reducer";
import { useDispatch, useSelector } from "../../../hooks";
import { useForm } from "../../../generic/hooks";

type Props = {
    onSubmit?: () => void;
    sortId?: string; // if not present assume it's new sort
}


// TODO: modifying is broken, probably have to change reducer too
// temporarily disabling editing name
export default function EditSort(props: Props) {
    const dispatch = useDispatch();
    const sorts = useSelector(state => state.sorts);

    const ownSort = props.sortId ? sorts[props.sortId] : null;

    const form = useForm({
        controls: {
            id: {
                disabled: !!ownSort,
                initialValue: ownSort ? ownSort.id : '',
                validate: s => {
                    if (s.length === 0) {
                        return 'Name cannot be empty';
                    }
                    if (s.length > 15) {
                        return 'Name is too long';
                    }
                    if (sorts[s] && s !== props.sortId) {
                        return 'Sort already exists';
                    }
                }
            },
            size: {
                initialValue: ownSort ? ownSort.size.toString() : '5',
                readValue: s => !isNaN(+s) ? s : undefined,
                validate: s => {
                    const n = +s;
                    if (n > 100) {
                        return 'Size is too large';
                    }
                }
            },
        },
        submit: values => {
            if (props.onSubmit) {
                props.onSubmit();
            }
            dispatch(domainSet({
                id: values.id,
                size: +values.size
            }));
        }
    });

    return (
        <Stack sx={{
            padding: '15px'
        }}
            spacing={2}
        >
            <TextField
                {...form.controlProps.id}
                size="small"
                label="Sort name"
                placeholder="Enter name"
            ></TextField>
            <TextField
                {...form.controlProps.size}
                size="small"
                label="Sort size"
                placeholder="Enter size"
            ></TextField>
            <Button onClick={form.onSubmit}>confirm</Button>
        </Stack>
    );
}