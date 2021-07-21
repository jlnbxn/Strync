
import { useState, useEffect, useContext } from 'react'
import { FirebaseContext } from '../contexts/FirebaseContext'
import { useNavigate } from 'react-router'
import { useAuthState } from 'react-firebase-hooks/auth'

function useDeezerAuth(code) {
    const [accessToken, setAccessToken] = useState()
    const navigate = useNavigate()
    const { state: { auth, firebase } } = useContext(FirebaseContext)
    const [user] = useAuthState(auth);


    useEffect(() => {
        if (!code || !user) return
        fetch(`/.netlify/functions/deezer`, {
            method: "POST",
            body: code
        })
            .then(res => res.json())
            .then(res => {
                console.log(res);
                console.log('hello from the other side')
                const deezerCredentials = firebase.database().ref("users/" + auth.currentUser.uid + "/deezer")
                deezerCredentials.set({
                    accessToken: res.access_token,
                    userId: res.id
                }).then(() => console.log("success"))
                    .catch(err => console.log(err))
                setAccessToken(res.accessToken)
                navigate("/");
            })
            .catch((error) => {
                console.log(error)

            })
    }, [code, user])

    useEffect(() => {
        if (auth.currentUser === null || code) return
        const deezerCredentials = firebase.database().ref("users/" + auth.currentUser.uid + "/deezer")
        deezerCredentials.on('value', (snapshot) => {
            const deezerData = snapshot.val();
            if (deezerData === null) return
            setAccessToken(deezerData.accessToken)
        })
    }, [user])

    return accessToken

}

export default useDeezerAuth
