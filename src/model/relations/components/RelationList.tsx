import { List, ListItem, IconButton, ListItemText, ListItemButton, ListItemIcon, Popover } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";

import { relationsSelectors, useDispatch, useSelector } from "store";
import { usePopover } from "generic/hooks";

import AddRelation from "./AddRelation";
import { Relation, relationRemoved } from "model/model.reducer";


export default function RelationList() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const relationsList = useSelector(relationsSelectors.selectAll);

    const relationDomain = (r: Relation) => r.domain.join(' × ');

    const { popoverProps, openPopover, closePopover } = usePopover();

    const removeDomain = (id: string) => dispatch(relationRemoved(id));
    
    const navigateToRelation = (id: string) => navigate(`relation/${id}`);

    return (<>
        <List dense>
            {relationsList.map(relation =>
                <ListItem key={relation.id} secondaryAction={
                    <IconButton size="small" onClick={() => removeDomain(relation.id)}><DeleteIcon fontSize="inherit" /></IconButton>
                } disablePadding>
                    {/* for some weird reason href doesn't work here and modifying theme does nothing */}
                    <ListItemButton onClick={() => navigateToRelation(relation.id)}>
                        <ListItemText primary={relation.id} secondary={relationDomain(relation) || 'Constant'}></ListItemText>
                    </ListItemButton>
                </ListItem>
            )}
            <ListItem disablePadding>
                <ListItemButton onClick={ev => openPopover(ev.currentTarget, <AddRelation onSubmit={closePopover} />)}>
                    <ListItemIcon>
                        <AddIcon />
                    </ListItemIcon>
                    <ListItemText primary="Add relation"></ListItemText>
                </ListItemButton>
            </ListItem>
        </List>
        <Popover {...popoverProps} />
    </>);
}