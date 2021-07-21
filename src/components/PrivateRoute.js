import { styled } from "@material-ui/styles";
import React from "react";
import { useContext } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Route, Navigate } from "react-router-dom";
import { FirebaseContext } from "../contexts/FirebaseContext";
import Loading from "./Loading";

const RootStyle = styled("div")(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    minHeight: "100vh",
}));

const PrivateRoute = ({ component: Component, path, ...rest }) => {
    const {
        state: { auth },
    } = useContext(FirebaseContext);
    const [user, loading, error] = useAuthState(auth);

    if (loading) {
        return (
            <RootStyle>
                <Loading />
            </RootStyle>
        );
    }
    if (error) {
        return (
            <div>
                <p>Error: {error}</p>
            </div>
        );
    }
    if (user) {
        return <Route {...rest} render={(props) => <Component {...props} />} />;
    }
    return <Navigate to="/signin" />;
};

export default PrivateRoute;
