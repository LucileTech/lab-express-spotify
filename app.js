require("dotenv").config();

const express = require("express");
const hbs = require("hbs");

// require spotify-web-api-node package here:
const SpotifyWebApi = require("spotify-web-api-node");

const app = express();

app.set("view engine", "hbs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));

// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

// Retrieve an access token
spotifyApi
  .clientCredentialsGrant()
  .then((data) => spotifyApi.setAccessToken(data.body["access_token"]))
  .catch((error) =>
    console.log("Something went wrong when retrieving an access token", error)
  );

// Our routes go here:
app.get("/", (req, res) => {
  res.render("homepage");
  console.log(req.body);
});

app.get("/artist-search", (req, res) => {
  spotifyApi
    .searchArtists(req.query.artistname)
    .then((data) => {
      console.log("The received data from the API: ", data.body.artists.items);
      const itemsArtists = data.body.artists.items;
      const imageAlbum = itemsArtists.images;

      // ----> 'HERE WHAT WE WANT TO DO AFTER RECEIVING THE DATA FROM THE API'
      res.render("artist-search-results", { itemsArtists, imageAlbum });
    })
    .catch((err) =>
      console.log("The error while searching artists occurred: ", err)
    );
});

app.get("/albums/:id", (req, res, next) => {
  // .getArtistAlbums() code goes here
  const numId = req.params.id;
  console.log(numId);
  spotifyApi.getArtistAlbums(`${numId}`).then(
    function (data) {
      console.log("Artist albums", data.body.items);
      const artistAlbum = data.body.items;
      res.render("album", { artistAlbum });
    },
    function (err) {
      console.error(err);
    }
  );
});

app.get("/tracks/:id", (req, res, next) => {
  const numId = req.params.id;
  console.log(numId);
  spotifyApi.getAlbumTracks(`${numId}`, { limit: 5, offset: 1 }).then(
    function (data) {
      console.log("Tracks", data.body.items[0].preview_url);
      const trackAlbum = data.body.items;
      res.render("tracks", { trackAlbum });
    },
    function (err) {
      console.log("Something went wrong!", err);
    }
  );
});

app.listen(3000, () =>
  console.log("My Spotify project running on port 3000 🎧 🥁 🎸 🔊")
);
