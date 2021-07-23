export default class SpotifyApi {
    constructor({ client_id, redirect_uri, scopes }) {
        this.client_id = client_id;
        this.scopes = scopes;
        this.redirect_uri = redirect_uri;
        this.loggedIn = false;
    }

    setLoggedIn(bool) {
        this.loggedIn = bool;
    }

    setAccessToken(access_token) {
        this.access_token = access_token;
    }

    getLoginUrl() {
        return (
            "https://accounts.spotify.com/authorize?client_id=" +
            this.client_id +
            "&redirect_uri=" +
            encodeURIComponent(this.redirect_uri) +
            "&scope=" +
            encodeURIComponent(this.scopes.join(" ")) +
            "&response_type=code"
        );
    }

    async getCurrentUser() {
        const user = await fetch("https://api.spotify.com/v1/me", {
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + this.access_token,
            },
        }).then((res) => res.json());
        // Important in checking for playlist ownership because of changes in spotify API that only allows for owners to add to playlists
        this.user_id = user.id;
        return user;
    }

    async getAlbumById(album_id) {
        const album = await fetch(`https://api.spotify.com/v1/albums/${album_id}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + this.access_token,
            },
        }).then((res) => res.json());
        return album;
    }

    async getTrackById(track_id) {
        const track = await fetch(`https://api.spotify.com/v1/tracks/${track_id}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + this.access_token,
            },
        }).then((res) => res.json());
        return track;
    }
    async getTrackByIsrc(isrc) {
        const response = await fetch(
            `https://api.spotify.com/v1/search?q=isrc:${isrc}&type=track`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + this.access_token,
                },
            }
        ).then((res) => res.json());
        return response;
    }

    async getUserPlaylists(isOwner) {
        let playlists = [];
        let response = await fetch(`https://api.spotify.com/v1/me/playlists`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + this.access_token,
            },
        }).then((res) => res.json());

        playlists = playlists.concat(response.items.map((item) => item));

        while (response.next !== null) {
            console.log(response.next);
            response = await fetch(response.next, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + this.access_token,
                },
            }).then((res) => res.json());

            playlists = playlists.concat(response.items.map((item) => item));
        }

        if (isOwner) {
            // Owner has to be account holder, otherwise one can't add tracks to the playlist (Todo: Only matters for target playlist, not for source)
            playlists = playlists.filter(
                (playlist) => playlist.owner.id === this.user_id
            );
        }

        // Make the playlist object uniform
        playlists = playlists.map((item) => ({ name: item.name, id: item.id }));
        // Add "My Saved Tracks" as a playlist, so users can use their library for transfers
        playlists.unshift({ name: "My Saved Tracks", id: "library" });
        return playlists;
    }

    async getPlaylistTracks(playlist_id) {
        if (playlist_id === "library") {
            const playlistTracks = await this.getUserLibrary();

            return playlistTracks;
        }

        const response = await fetch(
            `https://api.spotify.com/v1/playlists/${playlist_id}/tracks?fields=next,items(is_local,track(id,external_ids))`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + this.access_token,
                },
            }
        ).then((res) => res.json());
        console.log(response.items);
        let next = response.next;
        let offset = 100;
        let tracks = response.items;

        while (next !== null) {
            const response = await fetch(
                `https://api.spotify.com/v1/playlists/${playlist_id}/tracks?offset=${offset}&fields=next,items(is_local,track(id,external_ids))`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + this.access_token,
                    },
                }
            ).then((res) => res.json());
            offset += 100;
            next = response.next;
            let filteredTracks = response.items.filter(
                (item) => item.is_local === false
            );
            tracks = tracks.concat(filteredTracks);
        }
        response.items = tracks;

        console.log(
            response.items.map((item) => ({
                trackId: item.track.id,
                isrc: item.track.external_ids.isrc,
                trackName: item.track.name,
            }))
        );

        return response.items.map((item) => ({
            trackId: item.track.id,
            isrc: item.track.external_ids.isrc,
            trackName: item.track.name,
        }));
    }

    async addTrackToPlaylist(playlist_id, track_id) {
        const response = await fetch(
            `https://api.spotify.com/v1/playlists/${playlist_id}/tracks?uris=spotify:track:${track_id}`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + this.access_token,
            },
        }
        ).then((res) => res.json());
        return response;
    }


    async getUserLibrary() {
        try {
            const response = await fetch(
                `https://api.spotify.com/v1/me/tracks?fields=items(is_local,track(id,external_ids))`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + this.access_token,
                    },
                }
            ).then((res) => res.json());
            let next = response.next;
            let offset = 20;
            let tracks = response.items;

            while (next !== null) {
                const response = await fetch(
                    `https://api.spotify.com/v1/me/tracks?offset=${offset}&items(is_local,track(id,external_ids))`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: "Bearer " + this.access_token,
                        },
                    }
                ).then((res) => res.json());

                offset += 20;
                next = response.next;
                let filteredTracks = response.items.filter(
                    (item) => item.track.is_local === false
                );
                tracks = tracks.concat(filteredTracks);
            }
            response.items = tracks;
            console.log(response.items);

            const ids = response.items.map((item) => ({
                trackId: item.track.id,
                isrc: item.track.external_ids.isrc,
                trackName: item.track.name,
            }));
            return ids;
        } catch (error) {
            console.log(error);
        }
    }

    async findEquivalent(targetService, targetApi, trackId) {
        const sourceTrack = await this.getTrackById(trackId);
        const albumName = sourceTrack.album.name;
        const albumId = sourceTrack.album.id;
        const artistName = sourceTrack.artists[0].name;
        const durationMs = sourceTrack.duration_ms;
        const trackName = sourceTrack.name;
        const discNumber = sourceTrack.disc_number;
        const trackNumber = sourceTrack.track_number;
        const isrc = sourceTrack.external_ids.isrc;
        switch (targetService) {
            case "Apple Music": {
                try {
                    let appleMusicTrackId;
                    // Since Apple Music's search by ISRC often returns "No longer available" tracks, we have to use the UPC method.
                    let {
                        external_ids: { upc },
                    } = await this.getAlbumById(albumId);
                    const searchResults = await targetApi.getAlbumByUpc(upc);

                    // Filtering by track and disc numbers in order to ensure that the album is the same
                    // const filtered = searchResults.data.filter((item) => item.attributes.discNumber === discNumber && item.attributes.trackNumber === trackNumber)
                    if (searchResults.data.length === 0) {
                        throw "No Album found with this UPC.";
                    }
                    appleMusicTrackId =
                        searchResults.data[0].relationships.tracks.data[trackNumber - 1].id;

                    const result = {
                        targetTrackId: appleMusicTrackId,
                        trackName,
                    };

                    return appleMusicTrackId;
                } catch {
                    // Fallback method in case upc search doesn't work; searches by terms and filters by ISRC
                    let appleMusicTrackId;
                    const searchResults = await targetApi.search(
                        trackName,
                        artistName,
                        albumName
                    );
                    if (
                        searchResults.results &&
                        Object.keys(searchResults.results).length === 0 &&
                        searchResults.results.constructor === Object
                    )
                        return false;
                    const filtered = searchResults.results.songs.data.filter(
                        (song) => song.attributes.isrc === isrc
                    );
                    if (filtered.length === 0) return false;
                    appleMusicTrackId = filtered[0].id;
                    return appleMusicTrackId;
                }
            }
            case "Deezer": {
                const {
                    external_ids: { upc },
                } = await this.getAlbumById(albumId);
                try {
                    let deezerAlbum;
                    // The following tries to deal with the inconsistent scheme of the UPC codes between services. Some are prefixed with two zeros, some japanese releases with '05', etc.
                    if (upc.substring(0, 2) === "00") {
                        deezerAlbum = await targetApi.getAlbumByUpc(upc.substring(2));
                    } else if (upc.substring(0, 2) === "05") {
                        deezerAlbum = await targetApi.getAlbumByUpc(upc.substring(1));
                    } else {
                        deezerAlbum = await targetApi.getAlbumByUpc(upc);
                    }
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
                    if (!searchResults || searchResults.data.length === 0) return false;
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
}
