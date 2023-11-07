require('dotenv').config();

const express = require('express');
const hbs = require('hbs');

// require spotify-web-api-node package here:

const app = express();

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

// setting the spotify-api goes here:
const SpotifyWebApi = require('spotify-web-api-node');
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET

const spotifyAPI = new SpotifyWebApi({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET
})

spotifyAPI.clientCredentialsGrant()
    .then((data) => {
        spotifyAPI.setAccessToken(data.body['access_token']) //data.body is the content of the request, we need to access the property named 'access_token'
        console.log(data.body['access_token'])  ///Retrieving access token
    })
    .catch((error) => console.log('Something went wrong when retrieving an access token', error));

// Our routes go here:

app.get("/", (req, res) => {

    res.render("index")
})

app.get("/artist-search", (req, res) => {
    const artistName = req.query.searchArtist

    spotifyAPI.searchArtists(artistName)
        .then((data) => {
            /* console.log('The received data from the API:', data.body.artists.items); */
            const artists = data.body.artists.items
            /* console.log(artists[0].images[0]) */
            return artists
        })
        .then((artists) => {
            res.render("artist-search-results", { artists: artists })
            ///the first artist is just the name I gave to the results I got from the searchArtists()
        })
        .catch((error) => console.log(error));
})

app.get("/albums/:artistId", (req, res, next) => {
    const artistID = req.params.artistId
    spotifyAPI.getArtistAlbums(artistID)

        .then((albums) => {
            let selectedAlbum = []

            const albumsFound = albums.body.items
            albums.body.items.forEach(album => {
                if(album.artists[0].id === artistID){

                    selectedAlbum.push(album)
                }

            });

        })        
           return res.render("albums", { album: selectedAlbum })      
})

/* app.get("/tracks/") */



app.listen(3000, () => console.log('My Spotify project running on port 3000 🎧 🥁 🎸 🔊'));
