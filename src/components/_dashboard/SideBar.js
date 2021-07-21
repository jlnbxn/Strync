import { styled } from "@material-ui/core/styles";
import Hidden from "@material-ui/core/Hidden";
import Drawer from "@material-ui/core/Drawer";
import Box from "@material-ui/core/Box";
import NavSection from "./NavSection";
import sidebarConfig from "./SidebarConfig";
import ServicesSection from "./ServicesSection";

const DRAWER_WIDTH = 280;

const RootStyle = styled("div")(({ theme }) => ({
    [theme.breakpoints.up("lg")]: {
        flexShrink: 0,
        width: DRAWER_WIDTH,
    },
}));

export default function SideBar({
    handleDrawerToggle,
    setMobileOpen,
    mobileOpen,
}) {
    const renderContent = (
        <Box
            sx={{
                height: "100%",
                "& .simplebar-content": {},
            }}
        >
            <Box sx={{ px: 2.5, py: 3 }}>
                <Box component={"h2"} to="/" sx={{ display: "inline-flex" }}>
                    Strync
                </Box>
            </Box>
            <NavSection navConfig={sidebarConfig} />
            <ServicesSection />
        </Box>
    );

    return (
        <RootStyle>
            <Hidden lgUp>
                <Drawer
                    open={mobileOpen}
                    elevation={0}
                    anchor="left"
                    onClose={() => setMobileOpen(false)}
                    PaperProps={{
                        sx: { width: DRAWER_WIDTH },
                    }}
                >
                    <div>{renderContent}</div>
                </Drawer>
            </Hidden>

            <Hidden lgDown>
                <Drawer
                    variant="persistent"
                    open
                    PaperProps={{
                        sx: { width: DRAWER_WIDTH },
                    }}
                >
                    <div>{renderContent}</div>
                </Drawer>
            </Hidden>
        </RootStyle>
    );
}
