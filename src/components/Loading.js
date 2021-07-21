import { CircularProgress } from "@material-ui/core";
import { styled } from "@material-ui/styles";
import React from "react";

const RootStyle = styled("div")(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    minHeight: "100vh",
}));

function Loading() {
    return (
        <RootStyle>
            <CircularProgress />
        </RootStyle>
    );
}

export default Loading;
