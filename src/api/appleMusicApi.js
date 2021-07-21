export default class AppleMusicApi {
    constructor({ developer_token, user_token }) {
        this.developer_token = developer_token;
        this.storefront = "";
        this.loggedIn = false;
    }

    setUserToken(user_token) {
        this.user_token = user_token;
    }

    setLoggedIn(bool) {
        this.loggedIn = bool;
    }

    async getUserStorefront() {
        const response = await fetch(
            "https://api.music.apple.com/v1/me/storefront",
            {
                headers: {
                    Authorization: "Bearer " + this.developer_token,
                    "Music-User-Token": this.user_token,
                },
            }
        ).then((res) => res.json());

        this.storefront = response.data[0].id;
        return response;
    }

    async getUserLibrary() {
        const response = await fetch(
            "https://api.music.apple.com/v1/me/library/songs",
            {
                headers: {
                    Authorization: "Bearer " + this.developer_token,
                    "Music-User-Token": this.user_token,
                },
            }
        ).then((res) => res.json());

        return response;
    }

    async getAlbumByUpc(upc, isrc, title, positionInAlbum) {
        const response = await fetch(
            `https://api.music.apple.com/v1/catalog/${this.storefront}/albums?filter[upc]=${upc}`,
            {
                headers: {
                    Authorization: "Bearer " + this.developer_token,
                },
            }
        ).then((res) => res.json());

        return response;
    }

    async getTrackById(track_id) {
        const response = await fetch(
            `https://api.music.apple.com/v1/catalog/${this.storefront}/songs/${track_id}`,
            {
                headers: {
                    Authorization: "Bearer " + this.developer_token,
                },
            }
        ).then((res) => res.json());

        return response;
    }

    async getAlbumById(album_id) {
        const response = await fetch(
            `https://api.music.apple.com/v1/catalog/${this.storefront}/albums/${album_id}`,
            {
                headers: {
                    Authorization: "Bearer " + this.developer_token,
                },
            }
        ).then((res) => res.json());

        return response;
    }

    async getTrackByIsrc(isrc) {
        const response = await fetch(
            `https://api.music.apple.com/v1/catalog/${this.storefront}/songs?filter[isrc]=${isrc}`,
            {
                headers: {
                    Authorization: "Bearer " + this.developer_token,
                    "Music-User-Token": this.user_token,
                },
            }
        ).then((res) => res.json());

        return response;
    }

    async getUserPlaylists() {
        const response = await fetch(
            "https://api.music.apple.com/v1/me/library/playlists",
            {
                headers: {
                    Authorization: "Bearer " + this.developer_token,
                    "Music-User-Token": this.user_token,
                },
            }
        ).then((res) => res.json());
        console.log(response);

        const playlists = response.data.map((playlist) => {
            return { name: playlist.attributes.name, id: playlist.id };
        });

        return playlists;
    }

    async addTrackToPlaylist(playlist_id, track_id) {
        const tracks = {
            data: [
                {
                    id: track_id,
                    type: "songs",
                },
            ],
        };
        const response = await fetch(
            `https://api.music.apple.com/v1/me/library/playlists/${playlist_id}/tracks`,
            {
                method: "POST",
                headers: {
                    Authorization: "Bearer " + this.developer_token,
                    "Music-User-Token": this.user_token,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(tracks),
            }
        );

        console.log(response);
    }

    async search(trackName, albumName, artistName) {
        let term = `${trackName}+${albumName}+${artistName}`;
        term = term.replace(/&/g, "");
        term = term.split(" ").join("+");

        const response = await fetch(
            `https://api.music.apple.com/v1/catalog/${this.storefront}/search?term=${term}&types=songs`,
            {
                headers: {
                    Authorization: "Bearer " + this.developer_token,
                    "Music-User-Token": this.user_token,
                },
            }
        ).then((res) => res.json());
        return response;
    }

    async findEquivalent(targetService, targetApi, trackId) {
        const sourceTrack = await this.getTrackById(trackId);
        if (sourceTrack.errors) return false;
        const albumName = sourceTrack.data[0].attributes.albumName;
        const albumId = sourceTrack.data[0].relationships.albums.data[0].id;
        const artistName = sourceTrack.data[0].attributes.artistName;
        const durationMs = sourceTrack.data[0].attributes.durationInMillis;
        const trackName = sourceTrack.data[0].attributes.name;
        const discNumber = sourceTrack.data[0].attributes.discNumber;
        const trackNumber = sourceTrack.data[0].attributes.trackNumber;
        const isrc = sourceTrack.data[0].attributes.isrc;
        switch (targetService) {
            case "Spotify": {
                let spotifyTrackId;
                try {
                    const searchResults = await targetApi.getTrackByIsrc(isrc);

                    // Filtering by track and disc numbers in order to ensure that the album is the same
                    const filtered = searchResults.tracks.items.filter(
                        (item) =>
                            item.disc_number === discNumber &&
                            item.track_number === trackNumber
                    );
                    if (filtered.length === 0)
                        throw "No Track by ISRC and correct Album found.";
                    spotifyTrackId = filtered[0].id;
                    return spotifyTrackId;
                } catch {
                    // todo: add fallback search
                    return false;
                }
            }
            case "Deezer": {
                const sourceAlbum = await this.getAlbumById(albumId);
                if (sourceAlbum.errors) return false;
                const upc = sourceAlbum.data[0].attributes.upc;
                try {
                    let deezerAlbum = await targetApi.getAlbumByUpc(upc);
                    if (deezerAlbum.error) {
                        throw "UPC not found.";
                    }
                    const deezerTrackId = deezerAlbum.tracks.data[trackNumber - 1].id;
                    return deezerTrackId;
                } catch {
                    // If the above method didn't work, try deezer's strict search and filter for spotify's track duration (since that is all deezer offers of additional data useful for comparsions).
                    const searchResults = await targetApi.searchAdvanced(
                        trackName,
                        artistName,
                        albumName
                    );
                    const filtered = searchResults.data.filter(
                        (item) =>
                            item.duration === Math.floor(durationMs / 1000) ||
                            item.duration === Math.ceil(durationMs / 1000)
                    );
                    if (filtered.length === 0) {
                        return false;
                    }
                    const deezerTrackId = filtered[0].id;
                    return deezerTrackId;
                }
            }
        }
    }

    async getPlaylistTracks(playlist_id, options) {
        let playlistTracks = [];
        let response = await fetch(
            `https://api.music.apple.com/v1/me/library/playlists/${playlist_id}/tracks?&include=catalog`,
            {
                headers: {
                    Authorization: "Bearer " + this.developer_token,
                    "Music-User-Token": this.user_token,
                },
            }
        ).then((res) => res.json());

        playlistTracks = playlistTracks.concat(response.data);

        while (response.next) {
            response = await fetch(
                "https://api.music.apple.com" + response.next + "&include=catalog",
                {
                    headers: {
                        Authorization: "Bearer " + this.developer_token,
                        "Music-User-Token": this.user_token,
                    },
                }
            ).then((res) => res.json());
            playlistTracks = playlistTracks.concat(response.data);
        }

        let filteredTracks = playlistTracks.filter(
            (track) =>
                track.attributes.playParams &&
                track.relationships.catalog.data.length !== 0
        );

        playlistTracks = filteredTracks.map((track) => ({
            trackId: track.attributes.playParams.catalogId,
            isrc: track.relationships.catalog.data[0].attributes.isrc,
            trackName: track.attributes.name,
        }));

        return playlistTracks;
    }
}
