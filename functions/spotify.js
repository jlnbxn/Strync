const fetch = require("node-fetch");

exports.handler = async (event) => {
    let code = event.body;
    const client_id = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
    const redirect_uri = process.env.REACT_APP_SPOTIFY_REDIRECT_URI;
    const client_secret = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;

    try {
        const { access_token, refresh_token, expires_in } = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            body: `grant_type=authorization_code&code=${code}&redirect_uri=${redirect_uri}`,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization:
                    "Basic " +
                    Buffer.from(client_id + ":" + client_secret).toString("base64"),
            },
        }).then((res) => res.json());



        // 
        return {
            statusCode: 200,
            body: JSON.stringify({
                access_token,
                refresh_token,
                expires_in
            }),
        };
    } catch (error) {
        console.log(error);

        return {
            statusCode: 500,
            body: JSON.stringify(error),
        };
    }
};
