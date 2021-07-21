import { useEffect } from "react";
import Loading from "../components/Loading";
import useDeezerAuth from "../hooks/useDeezerAuth";

function LoginToDeezer() {
    const code = new URLSearchParams(window.location.search).get("code");
    const accessToken = useDeezerAuth(code);

    useEffect(() => {
        if (!accessToken) return;
    }, [accessToken]);

    return <Loading />;
}

export default LoginToDeezer;
