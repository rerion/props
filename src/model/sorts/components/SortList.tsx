import { IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Popover } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { sortsSelectors, useDispatch, useSelector } from "store";
import { usePopover } from "generic/hooks";
import { sortRemoved } from "model/model.reducer";

import EditSort from "./EditSort";

export default function SortList() {
    const dispatch = useDispatch();
    const sorts = useSelector(sortsSelectors.selectAll);

    const { popoverProps, openPopover, closePopover } = usePopover();

    const removeSort = (id: string) => dispatch(sortRemoved(id));

    return (<>
        <List dense>
            {sorts.map(sort =>
                <ListItem key={sort.id} secondaryAction={<>
                    <IconButton size="small" onClick={ev => openPopover(ev.currentTarget, <EditSort onSubmit={closePopover} sortId={sort.id} />)}>
                        <EditIcon fontSize="inherit" />
                        </IconButton>
                    <IconButton size="small" onClick={() => removeSort(sort.id)}><DeleteIcon fontSize="inherit" /></IconButton>
                </>}>
                    <ListItemText primary={sort.id} secondary={`Size: ${sort.size}`}></ListItemText>
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