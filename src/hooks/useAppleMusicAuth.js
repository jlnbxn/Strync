import { useContext, useEffect, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth';
import { FirebaseContext } from '../contexts/FirebaseContext'

function useAppleMusicAuth() {
    const [userToken, setUserToken] = useState()
    const { state: { auth, firebase } } = useContext(FirebaseContext)
    const [user] = useAuthState(auth);


    useEffect(() => {
        if (!user) return
        const appleMusicCredentials = firebase.database().ref("users/" + auth.currentUser.uid + "/appleMusic")
        appleMusicCredentials.on('value', (snapshot) => {
            const appleMusicData = snapshot.val();
            if (appleMusicData === null) return
            setUserToken(appleMusicData.userToken)
        })
    }, [user])

    return userToken
}

export default useAppleMusicAuth
