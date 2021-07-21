export const firebaseReducer = (state, action) => {
    switch (action.type) {
        case "SET_SPOTIFY_USER":
            return {
                ...state,
                connectedServices: {
                    ...state.connectedServices,
                    spotify: action.loggedIn,
                },
            };
        case "SET_DEEZER_USER":
            return {
                ...state,
                connectedServices: {
                    ...state.connectedServices,
                    deezer: action.loggedIn,
                },
            };
        case "SET_APPLE_MUSIC_USER":
            return {
                ...state,
                connectedServices: {
                    ...state.connectedServices,
                    appleMusic: action.loggedIn,
                },
            };
        case "SET_NOTIFICATIONS":
            return { ...state, notifications: action.notifications };
        case "SET_FILTER":
            return { ...state, filter: action.filter };
        case "CANCEL":
            return { ...state, cancel: action.cancel };
        case "SET_STRYNC":
            return { ...state, runningStryncs: { [action.key]: {} } };
        case "SET_PROGRESS":
            return {
                ...state,
                runningStryncs: {
                    ...state.runningStryncs,
                    [action.payload.key]: {
                        ...state.runningStryncs[action.payload.key],
                        ...action.payload.progress,
                    },
                },
            };
        case "RESET_PROGRESS":
            return {
                ...state,
                runningStryncs: {
                    ...state.runningStryncs,
                    [action.key]: {
                        ...state.runningStryncs[action.key],
                        progressValue: 0,
                        numberOfConvertedSongs: 0,
                        numberOfNewSongs: 0,
                        converting: false,
                    },
                },
            };
        case "SET_MESSAGE":
            return { ...state, messages: [...state.messages, action.message] };
        case "DELETE_MESSAGE": {
            return {
                ...state,
                messages: [...state.messages.filter((item) => item.id === action.id)],
            };
        }
    }
};
