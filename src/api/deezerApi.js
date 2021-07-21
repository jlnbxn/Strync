const baseUri = "/cors-proxy/https://api.deezer.com/";

export default class DeezerApi {
    constructor({ client_id, redirect_uri, scopes }) {
        this.client_id = client_id;
        this.redirect_uri = redirect_uri;
        this.scopes = scopes;
        this.loggedIn = false;
    }

    setLoggedIn(bool) {
        this.loggedIn = bool;
    }

    getLoginUrl() {
        return (
            "https://connect.deezer.com/oauth/auth.php?app_id=" +
            this.client_id +
            "&redirect_uri=" +
            encodeURIComponent(this.redirect_uri) +
            "&perms=" +
            encodeURIComponent(this.scopes.join())
        );
    }

    setAccessToken(access_token) {
        this.access_token = access_token;
    }

    async searchByIsrc(isrc) {
        return await fetch(baseUri + "track/isrc:" + isrc).then((res) =>
            res.json()
        );
    }

    async getUser() {
        return await fetch(
            `/cors-proxy/https://api.deezer.com/user/me?access_token=${this.access_token}`
        ).then((res) => res.json());
    }

    async getCurrentUser() {
        return await fetch(
            `/cors-proxy/https://api.deezer.com/user/me?access_token=${this.access_token}`
        ).then((res) => res.json());
    }

    async getUserPlaylists() {
        const playlists = await fetch(
            `/cors-proxy/https://api.deezer.com/user/me/playlists?access_token=${this.access_token}`
        ).then((res) => res.json());

        const conformedPlaylists = playlists.data.map((playlist) => {
            return { name: playlist.title, id: playlist.id };
        });
        return conformedPlaylists;
    }

    async getUserLibrary() {
        const response = await fetch(
            `/cors-proxy/https://api.deezer.com/user/me/tracks?access_token=${this.access_token}`
        ).then((res) => res.json());
        let deezerLibrary = [];
        for (let track of response.data) {
            const song = await this.getTrackById(track.id);
            const album = await this.getAlbumById(track.album.id);
            deezerLibrary.push({
                [track.id]: {
                    isrc: song.isrc,
                    upc: album.upc,
                    title: track.title,
                    album_name: track.album.title,
                    artist: track.artist.name,
                    duration: track.duration,
                },
            });
        }
        console.log(deezerLibrary);
        return deezerLibrary;
    }
    async getAlbumById(album_id) {
        const response = await fetch(
            `/cors-proxy/https://api.deezer.com/album/${album_id}`
        ).then((res) => res.json());
        return response;
    }

    async getAlbumByUpc(upc, isrc, title, positionInAlbum) {
        const response = await fetch(
            `/cors-proxy/https://api.deezer.com/album/upc:${upc}`
        ).then((res) => res.json());
        return response;
    }

    async searchAdvanced(title, artist, album_name) {
        const response = await fetch(
            `/cors-proxy/https://api.deezer.com/search?strict=on&q=track:"${encodeURIComponent(
                title
            )}" artist:"${encodeURIComponent(artist)}" album:"${encodeURIComponent(
                album_name
            )}"`
        ).then((res) => res.json());
        return response;
    }

    async getTrackById(track_id) {
        const response = await fetch(
            `/cors-proxy/https://api.deezer.com/track/${track_id}`
        ).then((res) => res.json());
        return response;
    }
    async addToPlaylist(track_id, playlist_id) {
        const response = await fetch(
            `/cors-proxy/https://api.deezer.com/playlist/9220096522/tracks?access_token=${this.access_token}&request_method=post&songs=${track_id}`
        ).then((res) => res.json());
        return response;
    }

    async addTrackToLibrary(track_id) {
        const user = await this.getUser();
        const response = await fetch(
            `/cors-proxy/https://api.deezer.com/user/${user.id}/tracks?track_id=${track_id}&access_token=${this.access_token}&request_method=post`
        ).then((res) => res.json());
        console.log(response);

        return response;
    }

    async getPlaylistTracks(playlist_id) {
        let playlistTracks = [];
        let response = await fetch(
            `/cors-proxy/https://api.deezer.com/playlist/${playlist_id}/tracks?access_token=${this.access_token}`
        ).then((res) => res.json());
        playlistTracks = playlistTracks.concat(response.data);
        while (response.next) {
            console.log(response.next);
            response = await fetch("/cors-proxy/" + response.next).then((res) =>
                res.json()
            );
            playlistTracks = playlistTracks.concat(response.data);
        }

        console.log(playlistTracks);
        playlistTracks = playlistTracks.map((track) => track.id.toString());
        console.log(playlistTracks);

        let unified = [];

        for (let trackId of playlistTracks) {
            const { isrc, title } = await this.getTrackById(trackId);
            unified.push({ trackId, isrc, trackName: title });
        }

        return unified;
    }

    async addTrackToPlaylist(playlist_id, track_id) {
        const response = await fetch(
            `/cors-proxy/https://api.deezer.com/playlist/${playlist_id}/tracks?songs=${track_id}&access_token=${this.access_token}&request_method=post`
        ).then((res) => res.json());
        return response;
    }

    async findEquivalent(targetService, targetApi, trackId) {
        const sourceTrack = await this.getTrackById(trackId);
        const albumName = sourceTrack.album.title;
        const albumId = sourceTrack.album.id;
        const artistName = sourceTrack.artist.name;
        const durationMs = sourceTrack.duration * 1000;
        const trackName = sourceTrack.title;
        const discNumber = sourceTrack.disk_number;
        const trackNumber = sourceTrack.track_position;
        const isrc = sourceTrack.isrc;
        switch (targetService) {
            case "Spotify": {
                try {
                    let spotifyTrackId;
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
            case "Apple Music": {
                const sourceAlbum = await this.getAlbumById(albumId);
                if (sourceAlbum.error) return false;
                const upc = sourceAlbum.upc;
                try {
                    let appleMusicAlbum = await targetApi.getAlbumByUpc(upc);
                    if (appleMusicAlbum.data.length === 0) {
                        throw "UPC not found.";
                    }
                    const appleMusicTrackId =
                        appleMusicAlbum.data[0].relationships.tracks.data[trackNumber - 1]
                            .id;
                    return appleMusicTrackId;
                } catch {
                    const searchResults = await targetApi.getTrackByIsrc(isrc);
                    // Filtering by track and disc numbers in order to ensure that the album is the same
                    const filtered = searchResults.data.filter(
                        (item) =>
                            item.attributes.discNumber === discNumber &&
                            item.attributes.trackNumber === trackNumber
                    );
                    if (filtered.length === 0) return false;
                    const appleMusicTrackId = filtered[0].id;
                    return appleMusicTrackId;
                }
            }
        }
    }
}
