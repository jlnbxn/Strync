import React, { useContext, useEffect, useState } from "react";
import TextField from "@material-ui/core/TextField";
import Layout from "../components/Layout";
import Box from "@material-ui/core/Box";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";
import Stack from "@material-ui/core/Stack";
import Switch from "@material-ui/core/Switch";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import { FirebaseContext } from "../contexts/FirebaseContext";
import { useNavigate } from "react-router-dom";
import Page from "../components/Page";

function Create() {
    const { state } = useContext(FirebaseContext);
    const {
        firebase,
        auth,
        deezerApi,
        spotifyApi,
        appleMusicApi,
        connectedServices,
    } = state;
    const [sourcePlaylists, setSourcePlaylists] = useState();
    const [targetPlaylists, setTargetPlaylists] = useState();
    const navigate = useNavigate();
    const [data, setData] = useState({
        watch: false,
    });

    useEffect(() => { });

    const handleChange = (event) => {
        const name = event.target.name;
        if (name === "source_playlist" || name === "target_playlist") {
            setData({
                ...data,
                [name]: {
                    name: event.target.options[event.target.selectedIndex].innerText,
                    id: event.target.value,
                },
            });
            return;
        }
        setData({
            ...data,
            [name]: event.target.value,
        });
    };

    useEffect(() => {
        switch (data.source_service) {
            case "Spotify":
                spotifyApi.getUserPlaylists().then((res) => setSourcePlaylists(res));
                break;
            case "Deezer":
                deezerApi.getUserPlaylists().then((res) => setSourcePlaylists(res));
                break;
            case "Apple Music":
                appleMusicApi.getUserPlaylists().then((res) => setSourcePlaylists(res));
                break;
        }
    }, [data.source_service]);

    useEffect(() => {
        switch (data.target_service) {
            case "Spotify":
                if (!spotifyApi.access_token) return;
                spotifyApi
                    .getUserPlaylists({ isOwner: true })
                    .then((res) => setTargetPlaylists(res));
                break;
            case "Deezer":
                if (!deezerApi.access_token) return;
                deezerApi.getUserPlaylists().then((res) => setTargetPlaylists(res));
                break;
            case "Apple Music":
                if (!appleMusicApi.user_token) return;
                appleMusicApi.getUserPlaylists().then((res) => setTargetPlaylists(res));
                break;
        }
    }, [data.target_service]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(data);
        const stryncsRef = firebase
            .database()
            .ref("users/" + auth.currentUser.uid + "/strync");
        let newStryncRef = stryncsRef.push();
        newStryncRef
            .set({
                name: data.name,
                watch: data.watch,
                source: {
                    service: data.source_service,
                    playlistId: data.source_playlist.id,
                    playlistName: data.source_playlist.name,
                },
                target: {
                    service: data.target_service,
                    playlistId: data.target_playlist.id,
                    playlistName: data.target_playlist.name,
                },
            })
            .then(() => navigate("/"));
    };
    return (
        <Layout>
            <Page title="Create Strync | Strync">
                <Container maxWidth="xl">
                    <Box sx={{ pb: 5 }}>
                        <Typography variant="h4">Create Strync</Typography>
                    </Box>
                    <form autoComplete="off" onSubmit={(e) => handleSubmit(e)}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Card sx={{ p: 3 }}>
                                    <Stack spacing={3}>
                                        <Stack
                                            direction={{ xs: "column", sm: "row" }}
                                            spacing={{ xs: 3, sm: 2 }}
                                        >
                                            <TextField
                                                fullWidth
                                                required
                                                name="name"
                                                label="Name"
                                                onChange={handleChange}
                                            />
                                        </Stack>
                                        <Stack
                                            direction={{ xs: "column", sm: "row" }}
                                            spacing={{ xs: 3, sm: 2 }}
                                        >
                                            <TextField
                                                select
                                                fullWidth
                                                required
                                                name="source_service"
                                                label="Source"
                                                placeholder="Spotify"
                                                onChange={handleChange}
                                                SelectProps={{ native: true }}
                                            >
                                                <option value="" />
                                                <option
                                                    disabled={!connectedServices.deezer ? true : false}
                                                    value={"Deezer"}
                                                >
                                                    Deezer
                                                </option>
                                                <option
                                                    disabled={!connectedServices.spotify ? true : false}
                                                    value={"Spotify"}
                                                >
                                                    Spotify
                                                </option>
                                                <option
                                                    disabled={
                                                        !connectedServices.appleMusic ? true : false
                                                    }
                                                    value={"Apple Music"}
                                                >
                                                    Apple Music
                                                </option>
                                            </TextField>
                                            <TextField
                                                select
                                                fullWidth
                                                required
                                                disabled={!data.source_service ? true : false}
                                                label="Playlist"
                                                name="source_playlist"
                                                onChange={handleChange}
                                                placeholder="Playlist"
                                                SelectProps={{ native: true }}
                                            >
                                                <option value="" />
                                                {sourcePlaylists &&
                                                    sourcePlaylists.map((playlist) => (
                                                        <option key={playlist.id} value={playlist.id}>
                                                            {playlist.name}
                                                        </option>
                                                    ))}
                                            </TextField>
                                        </Stack>

                                        <Stack
                                            direction={{ xs: "column", sm: "row" }}
                                            spacing={{ xs: 3, sm: 2 }}
                                        >
                                            <TextField
                                                select
                                                fullWidth
                                                required
                                                label="Target"
                                                name="target_service"
                                                onChange={handleChange}
                                                placeholder="Apple Music"
                                                SelectProps={{ native: true }}
                                            >
                                                <option value="" />
                                                <option
                                                    disabled={!connectedServices.deezer ? true : false}
                                                    value={"Deezer"}
                                                >
                                                    Deezer
                                                </option>
                                                <option
                                                    disabled={!connectedServices.spotify ? true : false}
                                                    value={"Spotify"}
                                                >
                                                    Spotify
                                                </option>
                                                <option
                                                    disabled={
                                                        !connectedServices.appleMusic ? true : false
                                                    }
                                                    value={"Apple Music"}
                                                >
                                                    Apple Music
                                                </option>
                                            </TextField>
                                            <TextField
                                                select
                                                required
                                                onChange={handleChange}
                                                fullWidth
                                                disabled={!data.target_service ? true : false}
                                                name="target_playlist"
                                                label="Playlist"
                                                placeholder="Playlist"
                                                SelectProps={{ native: true }}
                                            >
                                                <option value="" />
                                                {targetPlaylists &&
                                                    targetPlaylists.map((playlist) => (
                                                        <option key={playlist.id} value={playlist.id}>
                                                            {playlist.name}
                                                        </option>
                                                    ))}
                                            </TextField>
                                        </Stack>
                                        <FormControlLabel
                                            labelPlacement="start"
                                            control={
                                                <Switch
                                                    name="watch"
                                                    onChange={(e) => {
                                                        handleChange({
                                                            target: {
                                                                name: e.target.name,
                                                                value: e.target.checked,
                                                            },
                                                        });
                                                    }}
                                                />
                                            }
                                            label={
                                                <>
                                                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                                                        Watch
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{ color: "text.secondary" }}
                                                    >
                                                        Syncs your playlists automagically.
                                                    </Typography>
                                                </>
                                            }
                                            sx={{ mx: 0, width: 1, justifyContent: "space-between" }}
                                        />
                                        <Box
                                            sx={{
                                                mt: 3,
                                                display: "flex",
                                                justifyContent: "flex-end",
                                            }}
                                        >
                                            <Button variant="contained" type="submit">
                                                Submit
                                            </Button>
                                        </Box>
                                    </Stack>
                                </Card>
                            </Grid>
                        </Grid>
                    </form>
                </Container>
            </Page>
        </Layout>
    );
}

export default Create;
