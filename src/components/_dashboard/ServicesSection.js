import { FirebaseContext } from "../../contexts/FirebaseContext";
import { useContext, useState } from "react";
import { Icon } from "@iconify/react";
import spotifyIcon from "@iconify-icons/fa-brands/spotify";
import deezerIcon from "@iconify-icons/fa-brands/deezer";
import appleMusicIcon from "@iconify-icons/fa-brands/itunes-note";
import {
    List,
    ListItem,
    ListItemText,
    ListSubheader,
    ListItemIcon,
} from "@material-ui/core";
import { styled } from "@material-ui/styles";

const ListItemServiceStyle = styled((props) => (
    <ListItem disableGutters {...props} />
))(({ theme }) => ({
    position: "relative",
    userSelect: "none",
    textTransform: "capitalize",
    paddingLeft: theme.spacing(5),
    paddingRight: theme.spacing(2.5),
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

const ListSubheaderStyle = styled((props) => (
    <ListSubheader disableSticky disableGutters {...props} />
))(({ theme }) => ({
    ...theme.typography.overline,
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
    paddingLeft: theme.spacing(4),
    color: theme.palette.text.primary,
}));

const ListItemIconStyle = styled(ListItemIcon)({
    width: 22,
    height: 22,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
});

function ServicesSection() {
    const { state, dispatch } = useContext(FirebaseContext);
    const {
        spotifyApi,
        deezerApi,
        appleMusicApi,
        music,
        firebase,
        auth,
        connectedServices,
    } = state;

    const getIcon = (name) => <Icon icon={name} width={22} height={22} />;

    // Since Apple offers no typical oAuth flow, we have to use their MusicKitJS solution and write the data to firebase in here
    const loginToAppleMusic = () => {
        if (appleMusicApi.loggedIn) return;
        music
            .authorize()
            .then(() => {
                const appleMusicCredentials = firebase
                    .database()
                    .ref("users/" + auth.currentUser.uid + "/appleMusic");
                appleMusicCredentials
                    .set({
                        userToken: music.storekit._userToken,
                    })
                    .then((res) => console.log("success"))
                    .catch((err) => console.log(err));
                appleMusicApi.setUserToken(music.storekit._userToken);
                appleMusicApi
                    .getUserStorefront()
                    .then((res) =>
                        dispatch({ type: "SET_APPLE_MUSIC_USER", loggedIn: !res.errors })
                    );
            })
            .catch((error) => console.log(error));
    };

    const loginToDeezer = () => {
        if (deezerApi.loggedIn) return;
        window.location.href = deezerApi.getLoginUrl();
    };
    const loginToSpotify = () => {
        if (spotifyApi.loggedIn) return;
        window.location.href = spotifyApi.getLoginUrl();
    };

    return (
        <List disablePadding>
            <ListSubheaderStyle>Accounts</ListSubheaderStyle>

            <ListItemServiceStyle button onClick={() => loginToSpotify()}>
                <ListItemIconStyle>{getIcon(spotifyIcon)}</ListItemIconStyle>
                <ListItemText
                    primary={"Spotify"}
                    secondary={
                        connectedServices.spotify ? "Connected" : "Login to Spotify"
                    }
                />
            </ListItemServiceStyle>

            <ListItemServiceStyle button onClick={() => loginToDeezer()}>
                <ListItemIconStyle>{getIcon(deezerIcon)}</ListItemIconStyle>
                <ListItemText
                    primary={"Deezer"}
                    secondary={connectedServices.deezer ? "Connected" : "Login to Deezer"}
                />
            </ListItemServiceStyle>

            <ListItemServiceStyle button onClick={() => loginToAppleMusic()}>
                <ListItemIconStyle>{getIcon(appleMusicIcon)}</ListItemIconStyle>
                <ListItemText
                    primary={"Apple Music"}
                    secondary={
                        connectedServices.appleMusic ? "Connected" : "Login to Apple Music"
                    }
                />
            </ListItemServiceStyle>
        </List>
    );
}

export default ServicesSection;
