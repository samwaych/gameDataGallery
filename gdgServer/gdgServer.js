// server to handle requests from GDG site to RAWG and Steam Store

var express = require('express');
var cors = require('cors');
var app = express();
app.use(cors())
var request = require('request');

var rawgKey = "8881e08db1df45ea9a122d358156e2e1";

var steamKey = "BB52EBAB7849A0A6549F5CAC68D60F0E";

var url = `https://api.steampowered.com/ISteamApps/GetAppList/v2/`;

var urlApp = `https://store.steampowered.com/api/appdetails/?l=english&appids=`;

var urlRevs = `https://store.steampowered.com/appreviews/`;

app.get('/steam/list', function(httpRequest, httpResponse) {
  // Calculate the Steam API URL we want to use
  request.get(url, function(error, steamHttpResponse, steamHttpBody) {
      // Once we get the body of the steamHttpResponse, send it to our client
      // as our own httpResponse
      httpResponse.setHeader('Content-Type', 'application/json');
      httpResponse.send(steamHttpBody);
  });
});

app.get('/steam/info/:appid', function(httpRequest, httpResponse) {
  // Calculate the Steam API URL we want to use
  const appid = httpRequest.params.appid;
  request.get(urlApp + appid, function(error, steamHttpResponse, steamHttpBody) {
      httpResponse.setHeader('Content-Type', 'application/json');
      httpResponse.send(steamHttpBody);
  });
});

app.get('/steam/reviews/:appid', function(httpRequest, httpResponse) {
  // Calculate the Steam API URL we want to use
  const appid = httpRequest.params.appid;
  request.get(urlRevs + appid + '?json=1', function(error, steamHttpResponse, steamHttpBody) {
      httpResponse.setHeader('Content-Type', 'application/json');
      httpResponse.send(steamHttpBody);
  });
});

var port = 4000;
var server = app.listen(port, ()=> {
  console.log(`Server is running on port: ${port}`);
});