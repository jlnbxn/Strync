import { useContext, useEffect, useState } from "react";
import { FirebaseContext } from "../contexts/FirebaseContext";
import useDeezerAuth from "../hooks/useDeezerAuth";
import useSpotifyAuth from "../hooks/useSpotifyAuth";
import Grid from "@material-ui/core/Grid";
import Fab from "@material-ui/core/Fab";
import Box from "@material-ui/core/Box";
import AddIcon from "@material-ui/icons/Add";
import Strync from "../components/Strync";
import Container from "@material-ui/core/Container";
import { useNavigate } from "react-router";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import Layout from "../components/Layout";
import SignIn from "./SignIn";
import { useAuthState } from "react-firebase-hooks/auth";
import Loading from "../components/Loading";
import LinearProgress from "@material-ui/core/LinearProgress";
import useAppleMusicAuth from "../hooks/useAppleMusicAuth";
import Page from "../components/Page";

const useStyles = makeStyles((theme) => ({
  fab: {
    position: "fixed",
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
}));

export default function Home() {
  const { state, dispatch } = useContext(FirebaseContext);
  const {
    firebase,
    auth,
    database,
    deezerApi,
    spotifyApi,
    appleMusicApi,
    filter,
  } = state;
  const [myStryncs, setMyStryncs] = useState();
  const navigate = useNavigate();
  // usePrompt("Some Stryncs are still running. Are you sure you want to leave?", converting);

  const classes = useStyles();

  useEffect(() => {
    appleMusicApi.getUserLibrary().then(res => console.log(res))
    if (!auth.currentUser) return;

    const myStryncsRef = firebase
      .database()
      .ref("users/" + auth.currentUser.uid + "/strync");
    myStryncsRef.on("value", (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      setMyStryncs(data);
    });
  }, [auth.currentUser]);



  return (
    <Layout>
      <Page title="My Stryncs | Strync">
        <Container maxWidth="xl">
          <Box sx={{ pb: 5 }}>
            <Typography variant="h4">My Stryncs</Typography>
          </Box>
          <Grid container spacing={3}>
            {myStryncs ? (
              Object.entries(myStryncs)
                .filter(([key, value]) => {
                  return (
                    value.name.toLowerCase().includes(filter) ||
                    value.source.playlistName.toLowerCase().includes(filter) ||
                    value.target.playlistName.toLowerCase().includes(filter)
                  );
                })
                .map(([key, value]) => (
                  <Strync name={key} value={value} key={key} />
                ))
            ) : (
              <LinearProgress />
            )}
          </Grid>

          <Fab
            color="primary"
            className={classes.fab}
            aria-label="add"
            onClick={() => navigate("/create")}
          >
            <AddIcon />
          </Fab>
        </Container>
      </Page>
    </Layout>
  );
}
