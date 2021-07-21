import { Icon } from "@iconify/react";
import { useContext, useState } from "react";
import searchFill from "@iconify/icons-eva/search-fill";
import { experimentalStyled as styled, alpha } from "@material-ui/core/styles";
import {
  Box,
  Input,
  Slide,
  Button,
  InputAdornment,
  ClickAwayListener,
  IconButton,
} from "@material-ui/core";
import { FirebaseContext } from "../../contexts/FirebaseContext";


const APPBAR_MOBILE = 64;
const APPBAR_DESKTOP = 92;

const SearchbarStyle = styled("div")(({ theme }) => ({
  top: 0,
  left: 0,
  zIndex: 99,
  width: "100%",
  display: "flex",
  position: "absolute",
  alignItems: "center",
  height: APPBAR_MOBILE,
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)", // Fix on Mobile
  padding: theme.spacing(0, 3),
  boxShadow: theme.customShadows.z8,
  backgroundColor: `${alpha(theme.palette.background.default, 0.72)}`,
  [theme.breakpoints.up("md")]: {
    height: APPBAR_DESKTOP,
    padding: theme.spacing(0, 5),
  },
}));

// ----------------------------------------------------------------------

export default function Searchbar() {
  const { state, dispatch } = useContext(FirebaseContext);
  const { firebase, auth, database, deezerApi, spotifyApi, appleMusicApi } =
    state;

  const [isOpen, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen((prev) => !prev);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    console.log(e.target.value);

    dispatch({ type: "SET_FILTER", filter: e.target.value });
  };

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <div>
        {!isOpen && (
          <IconButton onClick={handleOpen}>
            <Icon icon={searchFill} width={20} height={20} />
          </IconButton>
        )}

        <Slide direction="down" in={isOpen} mountOnEnter unmountOnExit>
          <SearchbarStyle>
            <Input
              onChange={handleChange}
              autoFocus
              fullWidth
              disableUnderline
              placeholder="Search…"
              startAdornment={
                <InputAdornment position="start">
                  <Box
                    component={Icon}
                    icon={searchFill}
                    sx={{ color: "text.disabled", width: 20, height: 20 }}
                  />
                </InputAdornment>
              }
              sx={{ mr: 1, fontWeight: "fontWeightBold" }}
            />
            <Button variant="contained" onClick={handleClose}>
              Filter
            </Button>
          </SearchbarStyle>
        </Slide>
      </div>
    </ClickAwayListener>
  );
}
