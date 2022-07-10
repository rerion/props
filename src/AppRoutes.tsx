import { Box, CssBaseline, AppBar, Toolbar, Button } from "@mui/material";
import { Outlet, Route, Routes, } from "react-router-dom";
import Model from "./model/Model";
import RelationGrid from "./model/relations/components/RelationGrid";

const mainLayout = (
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position='fixed' sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <Button color="inherit" href="/model">Model</Button>
            <Button color="inherit" href="/formulas">Formulas</Button>
          </Toolbar>
        </AppBar>
        <Outlet />
      </Box>
);

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/"  element={mainLayout}>
                {/* <Route index element={<Model />} /> */}
                <Route path="model" element={<Model />}>
                    <Route path="relation/:id" element={<RelationGrid />}></Route>

                </Route>
            </Route>
        </Routes>
    );
}