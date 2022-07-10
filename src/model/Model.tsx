import { Drawer, Box, Toolbar, Divider } from "@mui/material";
import { Outlet } from "react-router-dom";

import RelationList from "./relations/components/RelationList";
import SortList from "./sorts/components/SortList";

export default function Model() {
    return (<>
        <Drawer variant='permanent' sx={{
            minWidth: 180, maxWidth: 240,
            // eslint-disable-next-line
            ['& .MuiDrawer-paper']: {
                minWidth: 180, maxWidth: 240,
            }
        }}>
          <Box>
            <Toolbar />
            <SortList />
            <Divider />
            <RelationList />
          </Box>
        </Drawer>
        <Box component='main'>
            <Toolbar />
            <Outlet />
        </Box>
    </>);
}