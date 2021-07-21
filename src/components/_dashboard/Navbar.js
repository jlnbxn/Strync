import { Icon } from "@iconify/react";
import menu2Fill from "@iconify/icons-eva/menu-2-fill";
import { styled, useTheme } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Stack from "@material-ui/core/Stack";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Hidden from "@material-ui/core/Hidden";
import AccountPopover from "./AccountPopover";
import NotificationsPopover from "./NotificationsPopover";
import Searchbar from "./Searchbar";
import { useLocation } from "react-router-dom";

const DRAWER_WIDTH = 280;
const APPBAR_MOBILE = 64;
const APPBAR_DESKTOP = 92;

const RootStyle = styled(AppBar)(({ theme }) => ({
    boxShadow: "none",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)", // Fix on Mobile
    [theme.breakpoints.up("lg")]: {
        width: `calc(100% - ${DRAWER_WIDTH + 1}px)`,
    },
}));

const ToolbarStyle = styled(Toolbar)(({ theme }) => ({
    minHeight: APPBAR_MOBILE,
    [theme.breakpoints.up("lg")]: {
        minHeight: APPBAR_DESKTOP,
        padding: theme.spacing(0, 5),
    },
}));

export default function Navbar({ handleDrawerToggle }) {
    const { pathname } = useLocation()
    return (
        <RootStyle color="transparent">
            <ToolbarStyle>
                <Hidden lgUp>
                    <IconButton
                        onClick={handleDrawerToggle}
                        sx={{ mr: 1, color: "text.primary" }}
                    >
                        <Icon icon={menu2Fill} />
                    </IconButton>
                </Hidden>
                {pathname === '/' ? <Searchbar /> : ''}

                <Box sx={{ flexGrow: 1 }} />
                <Stack direction="row" spacing={{ xs: 0.5, sm: 1.5 }}>
                    <NotificationsPopover />
                    <AccountPopover />
                </Stack>
            </ToolbarStyle>
        </RootStyle>
    );
}
