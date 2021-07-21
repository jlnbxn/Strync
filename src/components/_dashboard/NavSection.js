import { useState } from "react";
import {
  NavLink as RouterLink,
  matchPath,
  useLocation,
} from "react-router-dom";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  ListItemIcon,
  useTheme,
  alpha,
} from "@material-ui/core";
import { styled } from "@material-ui/styles";

const ListSubheaderStyle = styled((props) => (
  <ListSubheader disableSticky disableGutters {...props} />
))(({ theme }) => ({
  ...theme.typography.overline,
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(2),
  paddingLeft: theme.spacing(5),
  color: theme.palette.text.primary,
}));

const ListItemStyle = styled((props) => (
  <ListItem button component={RouterLink} disableGutters {...props} />
))(({ theme }) => ({
  ...theme.typography.body2,
  height: 48,
  position: "relative",
  textTransform: "capitalize",
  paddingLeft: theme.spacing(5),
  paddingRight: theme.spacing(2.5),
  color: theme.palette.text.secondary,
  "&:before": {
    top: 0,
    right: 0,
    width: 3,
    bottom: 0,
    content: "''",
    display: "none",
    position: "absolute",
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    backgroundColor: theme.palette.primary.main,
  },
}));

const ListItemIconStyle = styled(ListItemIcon)({
  width: 22,
  height: 22,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

function NavItem({ item, active }) {
  const theme = useTheme();
  const isActiveRoot = active(item.path);
  const { title, path, icon, info, children } = item;
  const [open, setOpen] = useState(isActiveRoot);

  const handleOpen = () => {
    setOpen((prev) => !prev);
  };

  const activeRootStyle = {
    color: theme.palette.primary.main + "!important",
    fontWeight: theme.typography.fontWeightMedium + "!important",
    bgcolor: alpha(
      theme.palette.primary.main,
      theme.palette.action.selectedOpacity
    ),
    "&:before": { display: "block!important" },
  };

  const activeSubStyle = {
    color: "text.primary",
    fontWeight: "fontWeightMedium",
  };

  return (
    <ListItemStyle
      to={path}
      sx={{
        ...(isActiveRoot && activeRootStyle),
      }}
    >
      <ListItemIconStyle>{icon && icon}</ListItemIconStyle>
      <ListItemText disableTypography primary={title} />

      {info && info}
    </ListItemStyle>
  );
}

export default function NavSection({ navConfig, ...other }) {
  const { pathname } = useLocation();
  const match = (path) => (path ? !!matchPath({ path }, pathname) : false);

  return (
    <Box {...other}>
      {navConfig.map((list) => {
        const { subheader, items } = list;
        return (
          <List key={subheader} disablePadding>
            <ListSubheaderStyle>{subheader}</ListSubheaderStyle>
            {items.map((item) => (
              <NavItem key={item.title} item={item} active={match} />
            ))}
          </List>
        );
      })}
    </Box>
  );
}
