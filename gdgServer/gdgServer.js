// server to handle requests from GDG site to RAWG and Steam Store

var express = require('express');
var cors = require('cors');
var app = express();
app.use(cors())
var request = require('request');

var rawgKey = "8881e08db1df45ea9a122d358156e2e1";

var steamKey = "BB52EBAB7849A0A6549F5CAC68D60F0E"; // not currently needed

var urlRAWG = 'https://rawg.io/api/games/';

var urlSteam = `https://api.steampowered.com/ISteamApps/GetAppList/v2/`;

var urlApp = `https://store.steampowered.com/api/appdetails/?l=english&appids=`;

var urlRevs = `https://store.steampowered.com/appreviews/`;

// Get game list from query from RAWG
// `https://rawg.io/api/games?key=${key}${platform}${genre}${players}${order}${game}&page=${pageNum}&page_size=40`; format for reference*/
app.get('/RAWG/gameQuery/:pageNum/:platform?/:genre?/:players?/:order?/:game?', function(httpRequest, httpResponse) {
  // Calculate the RAWG API URL we want to use
  let platform;
  (httpRequest.params.platform ? platform = httpRequest.params.platform : platform = "");
  let genre;
  (httpRequest.params.genre ? genre = httpRequest.params.genre : genre = "");
  let players;
  (httpRequest.params.players ? players = httpRequest.params.players : players = "");
  let order;
  (httpRequest.params.order ? order = httpRequest.params.order : order = "");
  let game;
  (httpRequest.params.game ? game = httpRequest.params.game : game = "");
  const pageNum = httpRequest.params.pageNum;

  request.get(urlRAWG + '?key=' + rawgKey + '&page=' + pageNum + platform + genre + players + order + game + 
     '&page_size=40', function(error, rawgHttpResponse, rawgHttpBody) {
      httpResponse.setHeader('Content-Type', 'application/json');
      httpResponse.send(rawgHttpBody);
  });
});

// Get RAWG game details
app.get('/RAWG/gameDescr/:appid', function(httpRequest, httpResponse) {
  // Calculate the RAWG API URL we want to use
  const appid = httpRequest.params.appid;
  request.get(urlRAWG + appid + '?key=' + rawgKey + '&description', function(error, rawgHttpResponse, rawgHttpBody) {
      httpResponse.setHeader('Content-Type', 'application/json');
      httpResponse.send(rawgHttpBody);
  });
});

// Get Steam Store app list
app.get('/steam/list', function(httpRequest, httpResponse) {
  // Calculate the Steam API URL we want to use
  request.get(urlSteam, function(error, steamHttpResponse, steamHttpBody) {
      // Once we get the body of the steamHttpResponse, send it to our client
      // as our own httpResponse
      httpResponse.setHeader('Content-Type', 'application/json');
      httpResponse.send(steamHttpBody);
  });
});

// Get Steam Store details based on appID
app.get('/steam/info/:appid', function(httpRequest, httpResponse) {
  // Calculate the Steam API URL we want to use
  const appid = httpRequest.params.appid;
  request.get(urlApp + appid, function(error, steamHttpResponse, steamHttpBody) {
      httpResponse.setHeader('Content-Type', 'application/json');
      httpResponse.send(steamHttpBody);
  });
});

// Get Steam Store review data based on appID
app.get('/steam/reviews/:appid', function(httpRequest, httpResponse) {
  // Calculate the Steam API URL we want to use
  const appid = httpRequest.params.appid;
  request.get(urlRevs + appid + '?json=1&purchase_type=all', function(error, steamHttpResponse, steamHttpBody) {
      httpResponse.setHeader('Content-Type', 'application/json');
      httpResponse.send(steamHttpBody);
  });
});

var port = 4000;
var server = app.listen(port, ()=> {
  console.log(`Server is running on port: ${port}`);
});