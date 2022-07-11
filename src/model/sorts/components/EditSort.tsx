import { Stack, TextField, Button } from "@mui/material";

import { sortsSelectors, useDispatch, useSelector } from "store";
import { useForm } from "generic/hooks";
import { sortAdded } from "model/model.reducer";

type Props = {
    onSubmit?: () => void;
    sortId?: string; // if not present assume it's new sort
}


// TODO: modifying not implemented, add reducer
export default function EditSort(props: Props) {
    const dispatch = useDispatch();
    const sorts = useSelector(sortsSelectors.selectEntities);
    const ownSort = useSelector(state => sortsSelectors.selectById(state, props.sortId || ""));

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
            dispatch(sortAdded(values.id, +values.size));
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