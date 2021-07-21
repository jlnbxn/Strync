import React, { useContext, useState } from "react";
import Layout from "../components/Layout";
import Page from "../components/Page";
import { FirebaseContext } from "../contexts/FirebaseContext";
import CancelIcon from "@material-ui/icons/Cancel";
import {
    Card,
    Table,
    TableRow,
    TableHead,
    IconButton,
    TableBody,
    Box,
    TableCell,
    Container,
    Typography,
    TableContainer,
} from "@material-ui/core";
import { useList } from "react-firebase-hooks/database";

function Notifications() {
    const { state } = useContext(FirebaseContext);
    const { auth, firebase } = state;

    const [snapshots] = useList(
        firebase
            .database()
            .ref("users/" + auth.currentUser.uid + "/" + "notifications")
    );

    console.log(snapshots);

    const getTimeAndDate = (epochTime) => {
        const date = new Date(epochTime).toLocaleDateString("en-US")
        const time = new Date(epochTime).toLocaleTimeString("en-US")
        return `${date}, ${time}`
    }

    return (
        <Layout>
            <Page title="Notifications | Strync">
                <Container>
                    <Box sx={{ pb: 5 }}>
                        <Typography variant="h4">Notifications</Typography>
                    </Box>
                    <TableContainer component={Card}>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Title</TableCell>
                                    <TableCell align="right">Strync</TableCell>
                                    <TableCell align="right">Time</TableCell>
                                    <TableCell align="right">Delete</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {snapshots.map((v) => (
                                    <TableRow
                                        key={v.key}
                                        sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row">
                                            {v.val().title}
                                        </TableCell>
                                        <TableCell align="right">{v.val().strync}</TableCell>
                                        <TableCell align="right">{getTimeAndDate(v.val().time)}</TableCell>
                                        <TableCell align="right">
                                            <IconButton onClick={() => v.ref.remove()}>
                                                <CancelIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Container>
            </Page>
        </Layout>
    );
}

export default Notifications;
