import React, { useContext, useEffect, useState } from "react";
import { FirebaseContext } from "../contexts/FirebaseContext";
import { styled } from "@material-ui/core/styles";
import SideBar from "./_dashboard/SideBar";
import Navbar from "./_dashboard/Navbar";
import useSpotifyAuth from "../hooks/useSpotifyAuth";
import useDeezerAuth from "../hooks/useDeezerAuth";
import useAppleMusicAuth from "../hooks/useAppleMusicAuth";
import Message from "./_dashboard/Message";
import { usePrompt } from "react-router-dom";

const APP_BAR_MOBILE = 64;
const APP_BAR_DESKTOP = 92;

const MainStyle = styled("div")(({ theme }) => ({
    flexGrow: 1,
    overflow: "auto",
    minHeight: "100%",
    paddingTop: APP_BAR_MOBILE + 24,
    paddingBottom: theme.spacing(10),
    [theme.breakpoints.up("lg")]: {
        paddingTop: APP_BAR_DESKTOP + 24,
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
    },
}));

const RootStyle = styled("div")({
    display: "flex",
    minHeight: "100%",
    overflow: "hidden",
});

function Layout({ children }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const spotifyAccessToken = useSpotifyAuth();
    const deezerAccessToken = useDeezerAuth();
    const appleMusicUserToken = useAppleMusicAuth();


    const [isBlocking, setIsBlocking] = useState(false)


    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const { state, dispatch } = useContext(FirebaseContext);
    const { deezerApi, spotifyApi, appleMusicApi, runningStryncs } = state;


    useEffect(() => {

        if (Object.values(runningStryncs).map(item => item).filter(item => item.converting).length !== 0) {
            setIsBlocking(true)
        }
        else {
            setIsBlocking(false)
        }

    }, [runningStryncs])
    usePrompt("There are still some running Stryncs -- Are you sure you want to leave?", isBlocking);

    console.log('oeuoe')
    useEffect(() => {
        if (!spotifyAccessToken) return;

        spotifyApi.setAccessToken(spotifyAccessToken);
        spotifyApi
            .getCurrentUser()
            .then((res) =>
                dispatch({ type: "SET_SPOTIFY_USER", loggedIn: !res.error })
            );
        // Spotify currently doesn't seem to remove an access tokens validity; at least not immediately, that is.
    }, [spotifyAccessToken]);

    useEffect(() => {
        if (!deezerAccessToken) return;
        deezerApi.setAccessToken(deezerAccessToken);
        deezerApi
            .getCurrentUser()
            .then((res) =>
                dispatch({ type: "SET_DEEZER_USER", loggedIn: !res.error })
            );
    }, [deezerAccessToken]);

    useEffect(() => {
        if (!appleMusicUserToken) return;
        appleMusicApi.setUserToken(appleMusicUserToken);
        // Check if user is logged in by checking their storefront, since no user info API is provided by Apple Music.

        appleMusicApi
            .getUserStorefront()
            .then((res) =>
                dispatch({ type: "SET_APPLE_MUSIC_USER", loggedIn: !res.errors })
            );
    }, [appleMusicUserToken]);

    return (
        <RootStyle>
            <Navbar handleDrawerToggle={handleDrawerToggle} />
            <SideBar
                handleDrawerToggle={handleDrawerToggle}
                mobileOpen={mobileOpen}
                setMobileOpen={() => setMobileOpen(false)}
            />
            <MainStyle>{children}</MainStyle>
            <Message />
        </RootStyle>
    );
}

export default Layout;
