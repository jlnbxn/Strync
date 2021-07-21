import { useEffect } from "react";
import Loading from "../components/Loading";
import useSpotifyAuth from "../hooks/useSpotifyAuth";

function LoginToSpotify() {
    const code = new URLSearchParams(window.location.search).get("code");
    const accessToken = useSpotifyAuth(code);

    useEffect(() => {
        if (!accessToken) return;
    }, [accessToken]);

    return <Loading />;
}

export default LoginToSpotify;
