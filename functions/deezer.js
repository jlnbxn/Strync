const fetch = require("node-fetch");

exports.handler = async (event, context) => {
    let code = event.body;

    const client_id = process.env.REACT_APP_DEEZER_CLIENT_ID;
    const redirect_uri = process.env.REACT_APP_DEEZER_REDIRECT_URI;
    const client_secret = process.env.REACT_APP_DEEZER_CLIENT_SECRET;

    try {
        const { access_token } = await fetch(`https://connect.deezer.com/oauth/access_token.php?app_id=${client_id}&secret=${client_secret}&code=${code}&output=json`, {
            method: "POST",
            body: `grant_type=authorization_code&code=${code}&redirect_uri=${redirect_uri}`,
            // headers: {
            //     "Content-Type": "application/x-www-form-urlencoded",
            //     Authorization:
            //         "Basic " +
            //         Buffer.from(client_id + ":" + client_secret).toString("base64"),

            //     }
            //     ,
        }).then((res) => res.json());

        const { id } = await fetch(`https://api.deezer.com/user/me?access_token=${access_token}`).then(res => res.json())





        // 
        return {
            statusCode: 200,
            body: JSON.stringify({
                access_token,
                id
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
