require('dotenv').config();  ///hide sensitive data

const express = require('express');
const hbs = require('hbs');

// require spotify-web-api-node package here:

const app = express(); //run the server

// ------ CONFOGURAITON AND MIDDLEWARE ------ 
app.set('view engine', 'hbs'); //display views from the server
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

// setting the spotify-api goes here:
const SpotifyWebApi = require('spotify-web-api-node');  ///store in variable and create connection with API
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET

const spotifyAPI = new SpotifyWebApi({   ///Initialize 
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET
})

spotifyAPI.clientCredentialsGrant()  ///I give you passwords so you give me another password
    .then((data) => {
        spotifyAPI.setAccessToken(data.body['access_token']) //data.body is the content of the request, we need to access the property named 'access_token'
        //console.log(data.body['access_token'])  ///Retrieving access token
    })
    .catch((error) => console.log('Something went wrong when retrieving an access token', error));

// Our routes go here:

app.get("/", (req, res) => {

    res.render("index")
})
///If my form is sending a request to that url /artist-search, we need to create the route (artist-search)
app.get("/artist-search", (req, res) => {
    const artistName = req.query.searchArtist

    spotifyAPI.searchArtists(artistName)
        .then((data) => {
            /* console.log('The received data from the API:', data.body.artists.items); */
            const artistsArray = data.body.artists.items
            //I can send the data body to see its content res.send(data.body)
            /* console.log(artists[0].images[0]) */   //artistsArray[0].name and artistsArray[0].images[0].url
            return artistsArray
        })
        .then((artistsArray) => {
            res.render("artist-search-results", { artistsArray }) //I am creating an object to send to the page
            ///the first artist is just the name I gave to the results I got from the searchArtists()
            // The curly braces allow its content to be sent to the hbs as an object, so we can later access its elements
        })
        .catch((error) => console.log(error));
})

app.get("/albums/:artistId", (req, res, next) => {
    const artistId = req.params.artistId
    spotifyAPI.getArtistAlbums(artistId)

        .then((albums) => {
            //res.send(artistId) //to see what I am returning and passing inside the then
            /* TEST TO CHECK IF PATH IS CORRECT
            const albumTitle = albums.body.items[0].name
            const albumImage = albums.body.items[0].image[0] */
            const albumsArray = albums.body.items
            //res.send(albumsArray)
            
            res.render("albums", { albumsArray})
            
        })  
        
        .catch((error) => console.log(error))
               
});

app.get("/tracks/:albumId", (req, res) => {
    const albumId = req.params.albumId
    spotifyAPI.getAlbumTracks(albumId)
    .then((data) =>{
        /* TEST TO CHECK IF PATH IS CORRECT
        const trackName = data.body.items[0].name
        const previewUrl = data.body.items[0].preview_url
        res.send({trackName, previewUrl}) */
        const tracksArray = data.body.items
        //res.send({tracksArray})
       res.render("tracks", {tracksArray})
       console.log(tracksArray); //it is an array and need to be an object to be valid for hbs
    })
    .catch((error) => console.log(`You're missing something:`, error))
    
});





app.listen(3000, () => console.log('My Spotify project running on port 3000 🎧 🥁 🎸 🔊'));
