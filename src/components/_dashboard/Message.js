import React, { useContext, useState, useEffect } from "react";
import { FirebaseContext } from "../../contexts/FirebaseContext";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/core/Alert";

function Message() {
    const { state, dispatch } = useContext(FirebaseContext);
    const { runningStryncs, messages } = state;
    const [open, setOpen] = useState(false);

    const [snackPack, setSnackPack] = useState([]);

    const [messageInfo, setMessageInfo] = useState(undefined);

    useEffect(() => {
        if (messages.length === 0) return;

        setSnackPack((prev) => [
            ...prev,
            {
                message: messages[0].content,
                key: new Date().getTime(),
                id: messages[0].id,
            },
        ]);
    }, [messages]);

    useEffect(() => {
        if (snackPack.length && !messageInfo) {
            // Set a new snack when we don't have an active one
            setMessageInfo({ ...snackPack[0] });
            setSnackPack((prev) => prev.slice(1));
            setOpen(true);
        } else if (snackPack.length && messageInfo && open) {
            // Close an active snack when a new one is added
            setOpen(false);
        }
    }, [snackPack, messageInfo, open]);

    const handleClose = (reason) => {
        if (reason === "clickaway") {
            return;
        }
        console.log("closed");
        dispatch({ type: "DELETE_MESSAGE", index: messageInfo.message.id });
        setOpen(false);
    };
    const onExited = () => {
        setMessageInfo(undefined);
        console.log("closed");
    };

    return (
        <Snackbar
            key={messageInfo ? messageInfo.key : undefined}
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
            }}
            open={open}
            autoHideDuration={6000}
            onClose={handleClose}
            TransitionProps={{ onExited }}
            message={messageInfo ? messageInfo.message : undefined}
        >
            <Alert onClose={handleClose} severity="success">
                {messageInfo ? messageInfo.message : undefined}
            </Alert>
        </Snackbar>
    );
}

export default Message;
