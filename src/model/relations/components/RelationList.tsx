import { List, ListItem, IconButton, ListItemText, ListItemButton, ListItemIcon, Popover } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";

import { useDispatch, useSelector } from "../../../hooks";
import { Relation, relationRemoved } from "../relations.reducer";
import { usePopover } from "../../../generic/hooks";

import AddRelation from "./AddRelation";


export default function RelationList() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const relations = useSelector(state => state.relations);
    const relationsList = Object.entries(relations);

    const relationDomain = (r: Relation) => r.domain.join(' × ');

    const { popoverProps, openPopover, closePopover } = usePopover();

    const removeDomain = (id: string) => dispatch(relationRemoved({ id }));
    
    const navigateToRelation = (id: string) => navigate(`relation/${id}`);

    return (<>
        <List dense>
            {relationsList.map(([id, relation]) =>
                <ListItem key={id} secondaryAction={
                    <IconButton size="small" onClick={() => removeDomain(id)}><DeleteIcon fontSize="inherit" /></IconButton>
                } disablePadding>
                    {/* for some weird reason href doesn't work here and modifying theme does nothing */}
                    <ListItemButton onClick={() => navigateToRelation(id)}>
                        <ListItemText primary={id} secondary={relationDomain(relation) || 'Constant'}></ListItemText>
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