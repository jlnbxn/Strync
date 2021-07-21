import React, { useEffect, useState } from "react";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import CardHeader from "@material-ui/core/CardHeader";
import Avatar from "@material-ui/core/Avatar";
import Box from "@material-ui/core/Box";
import AvatarGroup from "@material-ui/core/AvatarGroup";
import IconButton from "@material-ui/core/IconButton";
import CircularProgress from "@material-ui/core/CircularProgress";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import { DeleteOutline, MoreVertRounded } from "@material-ui/icons";
import { useContext } from "react";
import { FirebaseContext } from "../contexts/FirebaseContext";
import { Icon } from "@iconify/react";
import spotifyIcon from "@iconify-icons/fa-brands/spotify";
import deezerIcon from "@iconify-icons/fa-brands/deezer";
import appleMusicIcon from "@iconify-icons/fa-brands/itunes-note";
import { green, deepPurple, red } from "@material-ui/core/colors";
import { makeStyles, styled } from "@material-ui/styles";
import { v4 as uuidv4 } from "uuid";
import { usePrompt } from "react-router-dom";
import { Checkbox, FormControlLabel, Stack, Switch } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    green: {
        color: theme.palette.getContrastText(green[700]),
        backgroundColor: green[700],
    },
    purple: {
        color: theme.palette.getContrastText(deepPurple[500]),
        backgroundColor: deepPurple[500],
    },
    red: {
        color: theme.palette.getContrastText(red[500]),
        backgroundColor: red[500],
    },
    progressBackground: {
        barColorPrimary: {
            backgroundColor: "#eeeeee",
        },
    },
}));

const Strync = ({ name, value }) => {
    const { state, dispatch } = useContext(FirebaseContext);
    const {
        firebase,
        auth,
        runningStryncs,
        deezerApi,
        spotifyApi,
        appleMusicApi,
    } = state;
    const classes = useStyles();

    const handleChange = async (name, value) => {
        console.log(name);
        const strync = firebase
            .database()
            .ref("users/" + auth.currentUser.uid + "/strync/" + name);
        await strync.update({
            ...value,
            watch: !value.watch,
        });
    };

    let sourceAvatar =
        value.source.service === "Spotify" ? (
            <Avatar className={classes.green}>
                <Icon icon={spotifyIcon} />
            </Avatar>
        ) : value.source.service === "Deezer" ? (
            <Avatar className={classes.purple}>
                <Icon icon={deezerIcon} />
            </Avatar>
        ) : value.source.service === "Apple Music" ? (
            <Avatar className={classes.red}>
                <Icon icon={appleMusicIcon} />
            </Avatar>
        ) : (
            ""
        );
    let targetAvatar =
        value.target.service === "Spotify" ? (
            <Avatar className={classes.green}>
                <Icon icon={spotifyIcon} />
            </Avatar>
        ) : value.target.service === "Deezer" ? (
            <Avatar className={classes.purple}>
                <Icon icon={deezerIcon} />
            </Avatar>
        ) : value.target.service === "Apple Music" ? (
            <Avatar className={classes.red}>
                <Icon icon={appleMusicIcon} />
            </Avatar>
        ) : (
            ""
        );

    const runStrync = async (key, value) => {
        dispatch({
            type: "SET_PROGRESS",
            payload: {
                key: key,
                progress: {
                    converting: true,
                    name: value.name,
                    numberOfNewSongs: 0,
                    numberOfConvertedSongs: 0,
                },
            },
        });

        let sourceApi, sourceMethod, targetApi, targetMethod;
        switch (value.source.service) {
            case "Spotify":
                sourceApi = spotifyApi;
                break;
            case "Deezer":
                sourceApi = deezerApi;
                break;
            case "Apple Music":
                sourceApi = appleMusicApi;
                break;
        }

        switch (value.target.service) {
            case "Spotify":
                targetApi = spotifyApi;
                break;
            case "Deezer":
                targetApi = deezerApi;
                break;
            case "Apple Music":
                targetApi = appleMusicApi;
                break;
        }

        const sourceList = await sourceApi.getPlaylistTracks(
            value.source.playlistId
        );
        const targetList = await targetApi.getPlaylistTracks(
            value.target.playlistId
        );
        const notificationsRef = await firebase
            .database()
            .ref("users/" + auth.currentUser.uid + "/notifications");
        const ignoreRef = await firebase
            .database()
            .ref("users/" + auth.currentUser.uid + "/strync/" + key + "/ignore");

        const ignoreList = await ignoreRef.once("value").then((snapshot) => {
            const data = snapshot.val();
            if (data === null) return [];
            return Object.keys(data).map((key) => data[key].trackId);
        });

        // Add option to cancel ignore list

        // Test whether based on IRC the track is already on the target playlist
        const newSongs = sourceList
            .filter(
                (item) =>
                    !targetList.map((element) => element.isrc).includes(item.isrc) &&
                    !ignoreList.includes(item.trackId)
            )
            .map((item) => ({ trackId: item.trackId, trackName: item.trackName }));

        let progressValue = 0;
        for (let i = 0; i < newSongs.length; i++) {
            const { trackId, trackName } = newSongs[i];
            const equivalent = await sourceApi.findEquivalent(
                value.target.service,
                targetApi,
                trackId
            );

            progressValue = progressValue + 100 / newSongs.length;

            if (equivalent && targetList.includes(equivalent)) {
                console.log("Song already on the list.");
            }
            if (equivalent) {

                targetApi.addTrackToPlaylist(value.target.playlistId, equivalent);
            }
            if (!equivalent) {
                console.log(`Failed to convert "${trackName}"`);
                notificationsRef.push({
                    type: "failed",
                    title: `Failed to convert "${trackName}"`,
                    strync: value.name,
                    time: Date.now(),
                    isUnRead: true,
                });
                ignoreRef.push({
                    trackId,
                });
            }

            dispatch({
                type: "SET_PROGRESS",
                payload: {
                    key: key,
                    progress: {
                        numberOfNewSongs: sourceList.length,
                        numberOfConvertedSongs: sourceList.length - newSongs.length + i + 1,
                        progressValue,
                    },
                },
            });
        }

        dispatch({ type: "RESET_PROGRESS", key });
        dispatch({
            type: "SET_MESSAGE",
            message: {
                key,
                content: `Successfully converted ${value.name}`,
                id: uuidv4(),
            },
        });
    };

    const deleteStrync = async (name) => {
        const myStryncsRef = firebase
            .database()
            .ref("users/" + auth.currentUser.uid + "/strync");
        myStryncsRef.child(name).remove();
    };

    return (
        <>
            <Grid item xs={12}>
                <Card variant="outlined">
                    <CardHeader
                        avatar={
                            <AvatarGroup max={2}>
                                {sourceAvatar}
                                {targetAvatar}
                            </AvatarGroup>
                        }
                        title={value.name}
                        subheader={`From ${value.source.service} to ${value.target.service}`}
                        action={
                            runningStryncs[name] && runningStryncs[name].converting ? (
                                <CircularProgress
                                    variant="determinate"
                                    value={runningStryncs[name].progressValue}
                                    className={classes.progressBackground}
                                />
                            ) : (
                                <IconButton
                                    aria-label="delete"
                                    onClick={() => deleteStrync(name)}
                                >
                                    <DeleteOutline />
                                </IconButton>
                            )
                        }
                    />

                    <CardContent>
                        <Stack
                            direction={{ xs: "column", sm: "column" }}
                            spacing={{ xs: 3, sm: 2 }}
                        >
                            <Box>
                                <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    component="p"
                                    fontWeight="bold"
                                >
                                    Source:
                                </Typography>
                                <Typography variant="body2" color="textSecondary" component="p">
                                    {value.source.playlistName}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    component="p"
                                    fontWeight="bold"
                                >
                                    Target:
                                </Typography>
                                <Typography variant="body2" color="textSecondary" component="p">
                                    {value.target.playlistName}
                                </Typography>
                            </Box>
                        </Stack>
                    </CardContent>
                    <CardActions sx={{ paddingTop: 0, justifyContent: 'space-between' }}>
                        {runningStryncs[name] && runningStryncs[name].converting ? (
                            <>
                                <Box sx={{ px: 2, py: 1 }}>
                                    {/* <CircularProgress variant="determinate" value={progress.value} /> */}
                                    <Typography
                                        variant="body1"
                                        color="textSecondary"
                                        component="p"
                                    >
                                        {runningStryncs[name].numberOfNewSongs === 0
                                            ? "Loading Tracks..."
                                            : `Converting ${runningStryncs[name].numberOfConvertedSongs} of ${runningStryncs[name].numberOfNewSongs}`}
                                    </Typography>

                                </Box>
                                <Box sx={{ marginLeft: "auto" }}>
                                    <Checkbox
                                        name="watch"
                                        icon={<VisibilityOffIcon />}
                                        checkedIcon={<VisibilityIcon />}
                                        checked={value.watch}
                                        onChange={() => handleChange(name, value)}
                                    />
                                </Box>




                            </>
                        ) : (
                            <>
                                <Button color="primary" onClick={() => runStrync(name, value)}>
                                    Run
                                </Button>
                                <Box >
                                    <Checkbox
                                        name="watch"
                                        icon={<VisibilityOffIcon />}
                                        checkedIcon={<VisibilityIcon />}
                                        checked={value.watch}
                                        onChange={() => handleChange(name, value)}
                                    />
                                </Box>

                            </>
                        )}

                    </CardActions>
                </Card>
            </Grid>
        </>
    );
};

export default Strync;
