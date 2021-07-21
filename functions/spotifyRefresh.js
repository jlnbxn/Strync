const fetch = require("node-fetch");


exports.handler = async (event, context) => {

    const client_id = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
    const redirect_uri = process.env.REACT_APP_SPOTIFY_REDIRECT_URI;
    const client_secret = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;

    const refresh_token = event.body
    try {

        // const response = await fetch('https://oauth2.googleapis.com/token', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/x-www-form-urlencoded'
        //     },
        //     body: `grant_type=refresh_token&refresh_token=${refreshToken}&client_id=${clientId}&client_secret=${clientSecret}`
        // }).then(res => res.json())

        const { access_token, expires_in } = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            body: `grant_type=refresh_token&refresh_token=${refresh_token}&redirect_uri=${redirect_uri}`,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization:
                    "Basic " +
                    Buffer.from(client_id + ":" + client_secret).toString("base64"),
            },
        }).then((res) => res.json());





        return {
            statusCode: 200,
            body: JSON.stringify({
                access_token,
                expires_in,
            })
        };
    } catch (error) {
        console.log(error);

        return {
            statusCode: 500,
            body: JSON.stringify(error),
        };
    }
};
