
import { useState, useEffect, useContext } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useNavigate } from 'react-router'
import { FirebaseContext } from '../contexts/FirebaseContext'


function useSpotifyAuth(code) {
    const [accessToken, setAccessToken] = useState()
    const { state: { auth, firebase } } = useContext(FirebaseContext)
    const navigate = useNavigate()
    const [user] = useAuthState(auth);



    useEffect(() => {
        if (!code || !user) return
        fetch(`/.netlify/functions/spotify`, {
            method: "POST",
            body: code
        })
            .then(res => res.json())
            .then(res => {
                console.log(res);
                console.log('hello from the other side')
                const spotifyCredentials = firebase.database().ref("users/" + auth.currentUser.uid + "/spotify")
                spotifyCredentials.set({
                    expirationDate: Date.now() + res.expires_in * 1000,
                    refreshToken: res.refresh_token,
                    accessToken: res.access_token
                }).then(res => console.log("success"))
                    .catch(err => console.log(err))

                setAccessToken(res.accessToken)
                navigate("/");
            })
            .catch((error) => {
                console.log(error)
                // router.push('./')
            })
    }, [code, user])

    useEffect(() => {
        console.log(user)
        if (!user) return

        const spotifyCredentials = firebase.database().ref("users/" + auth.currentUser.uid + "/spotify")

        spotifyCredentials.on('value', (snapshot) => {
            const spotifyData = snapshot.val();
            if (spotifyData === null) return
            if (spotifyData.expirationDate < new Date()) {
                fetch(`/.netlify/functions/spotifyRefresh`, {
                    method: "POST",
                    body: spotifyData.refreshToken
                })
                    .then(res => res.json())
                    .then(res => {
                        setAccessToken(res.access_token)
                    })
                    .catch(err => console.log(err))
            }
            else {
                setAccessToken(spotifyData.accessToken)
            }
        })
    }, [user])

    return accessToken

}

export default useSpotifyAuth
