import { IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Popover } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { usePopover } from "../../../generic/hooks";
import { useDispatch, useSelector } from "../../../hooks";
import { domainRemoved } from "../sorts.reducer";

import EditSort from "./EditSort";

export default function SortList() {
    const dispatch = useDispatch();
    const sorts = useSelector(state => state.sorts);
    const sortsList = Object.entries(sorts);

    const { popoverProps, openPopover, closePopover } = usePopover();

    const removeDomain = (id: string) => dispatch(domainRemoved({ id }));

    return (<>
        <List dense>
            {sortsList.map(([id, sort]) =>
                <ListItem key={id} secondaryAction={<>
                    <IconButton size="small" onClick={ev => openPopover(ev.currentTarget, <EditSort onSubmit={closePopover} sortId={id} />)}>
                        <EditIcon fontSize="inherit" />
                        </IconButton>
                    <IconButton size="small" onClick={() => removeDomain(id)}><DeleteIcon fontSize="inherit" /></IconButton>
                </>}>
                    <ListItemText primary={id} secondary={`Size: ${sort.size}`}></ListItemText>
                </ListItem>
            )}
            <ListItem disablePadding>
                <ListItemButton onClick={ev => openPopover(ev.currentTarget, <EditSort onSubmit={closePopover} />)}>
                    <ListItemIcon>
                        <AddIcon />
                    </ListItemIcon>
                    <ListItemText primary="Add sort"></ListItemText>
                </ListItemButton>
            </ListItem>
        </List>
        <Popover {...popoverProps} />
    </>);
}