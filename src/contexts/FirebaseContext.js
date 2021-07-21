import { createContext, useReducer } from "react";
import { firebaseReducer } from "../reducers/firebaseReducer";
import firebase from "firebase/app";
import DeezerApi from "../api/deezerApi";
import SpotifyApi from "../api/spotifyApi";
import AppleMusicApi from "../api/appleMusicApi";
import "firebase/auth";
import "firebase/database";

if (firebase.apps.length === 0) {
    firebase.initializeApp({
        apiKey: "AIzaSyCzymSgqyDxKP8ybjw2VUli_Mv3v2cus_4",
        authDomain: "strync-356d1.firebaseapp.com",
        projectId: "strync-356d1",
        storageBucket: "strync-356d1.appspot.com",
        messagingSenderId: "325361008034",
        appId: "1:325361008034:web:16d46becce1603e50cc6fb",
        measurementId: "G-19VPQPKLT0",
    });
}

const auth = firebase.auth();

const deezerApi = new DeezerApi({
    client_id: process.env.REACT_APP_DEEZER_CLIENT_ID,
    redirect_uri: process.env.REACT_APP_DEEZER_REDIRECT_URI,
    scopes: ["basic_access", "email", "offline_access", "manage_library"],
});
const spotifyApi = new SpotifyApi({
    client_id: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
    redirect_uri: process.env.REACT_APP_SPOTIFY_REDIRECT_URI,
    scopes: [
        "user-read-email",
        "playlist-modify-private",
        "playlist-modify-public",
        "streaming",
        "user-library-read",
    ],
});

window.MusicKit.configure({
    developerToken: process.env.REACT_APP_APPLE_MUSIC_DEVELOPER_TOKEN,
    app: {
        name: "Strync",
        build: "0.1",
    },
});

const appleMusicApi = new AppleMusicApi({
    developer_token: process.env.REACT_APP_APPLE_MUSIC_DEVELOPER_TOKEN,
});

export const FirebaseContext = createContext();

const FirebaseContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(firebaseReducer, {
        auth,
        music: window.MusicKit.getInstance(),
        deezerApi,
        spotifyApi,
        appleMusicApi,
        filter: "",
        firebase,
        cancel: false,
        runningStryncs: {},
        notifications: [],
        messages: [],
        connectedServices: { spotify: false, deezer: false, appleMusic: false },
    });

    return (
        <FirebaseContext.Provider value={{ state, dispatch }}>
            {children}
        </FirebaseContext.Provider>
    );
};

export default FirebaseContextProvider;
