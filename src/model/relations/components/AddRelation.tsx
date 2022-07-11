import { Button, Divider, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "generic/hooks";
import { relationsSelectors, sortsSelectors, useDispatch, useSelector } from "store";
import { relationAdded } from "model/model.reducer";


type Props = {
    onSubmit?: () => void;
}

export default function AddRelation(props: Props) {
    const dispatch = useDispatch();
    const sortNames = useSelector(sortsSelectors.selectIds) as string[];
    useEffect(() => console.log(sortNames));
    const relations = useSelector(relationsSelectors.selectEntities);

    const [domain, setDomain] = useState<string[]>([]);

    const clearDomain = () => setDomain([]);
    const pushDomainSort = (s: string) => setDomain([...domain, s]);

    const form = useForm({
        controls: {
            id: {
                initialValue: '',
                validate: s => {
                    if (s.length === 0) {
                        return 'Name cannot be empty';
                    }
                    if (s.length > 15) {
                        return 'Name is too long';
                    }
                    if (relations[s]) {
                        return 'Relation already exists';
                    }
                }
            },
        },
        submit: values => {
            if (props.onSubmit) {
                props.onSubmit();
            }
            dispatch(relationAdded(values.id, domain));
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
                label="Relation name"
                placeholder="Enter name"
            ></TextField>
            <Divider />
            <Typography>Enter domain</Typography>
            <Stack direction="row" spacing="2">
                {sortNames.map(s => 
                    <Button key={s} size="small" onClick={() => pushDomainSort(s)}>{s}</Button>
                )}
                <Button size="small" color="warning" onClick={clearDomain}>Clear</Button>
            </Stack>
            <TextField
                value={domain.join(' × ')}
                size="small"
                label="Domain"
            ></TextField>
            <Button onClick={form.onSubmit}>confirm</Button>
        </Stack>
    );
}