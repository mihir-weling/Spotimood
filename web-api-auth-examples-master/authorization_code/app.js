/**
 * FAKE
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var rp = require('request-promise');
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var songs_array;

var client_id = 'd155f62db10d422b982be26421f762f3'; // Your client id
var client_secret = 'd00adc9b2e16443480a0eee2ea0b4398'; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

var user_id = '';
var access_token = '';
var token;

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
  .use(cors())
  .use(cookieParser());

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email playlist-read-collaborative playlist-modify-public playlist-read-private playlist-modify-private';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        access_token = body.access_token,
          refresh_token = body.refresh_token;


        //this.access_token = access_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: {
            'Authorization': 'Bearer ' + access_token
          },
          json: true
        };



        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }

      // use the access token to access the Spotify Web API
      rp.get(options, function(error, response, body) {
        user_id = body.id;
        console.log("HIIIII:" + user_id);
      }).then(function() {
        console.log("hiohiohioh")
        const application = new Application();
        application.start(access_token, user_id);
      });
    });
  }
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
    },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

const Application = function() {
  // this.analysis = new Analysis()
  // this.recommend = new Recommend()
  var b64idsecret = 'ZDE1NWY2MmRiMTBkNDIyYjk4MmJlMjY0MjFmNzYyZjM6ZDAwYWRjOWIyZTE2NDQzNDgwYTBlZWUyZWEwYjQzOTg=';
  var redirect_uri = 'http://localhost:8888/callback';
  var encoded_redirect_uri = 'http%3A%2F%2Flocalhost%3A8888%2Fcallback';

  //var scope = 'user-read-private user-read-email playlist-read-collaborative playlist-modify-public playlist-read-private playlist-modify-private';
  //var auth_URL = "https://accounts.spotify.com/authorize?client_id=d155f62db10d422b982be26421f762f3&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A8888%2Fcallback&scope=user-read-private user-read-email playlist-read-collaborative playlist-modify-public playlist-read-private playlist-modify-private";
  //curl -H "Authorization: Basic ZDE1NWY2MmRiMTBkNDIyYjk4MmJlMjY0MjFmNzYyZjM6ZDAwYWRjOWIyZTE2NDQzNDgwYTBlZWUyZWEwYjQzOTg=" -d grant_type=authorization_code -d code=AQC7RYVXsq_pxY2h80MPutmxAwwBlKSsA5PAH8OHjU0qL1iSUJuv3iKRBGZRMi8_xqpHOqyGkiFzPTCEYcK_IBug20EniTIOynOYJlilu47KY-4W_C_qjkPHQvHCjxkb0vi2jScjxEoCa7_dguJOObkIzENusJLHAOFwgwJ__wRRFuqGTn9ln3Jq-3mzErXNYZun6DBifK0_XYqzi_edfj0Fz71eim3o8V2iI3Dml_vxHqXTh9PD8hZoSkbZxcPdTCe2ngU8uj76zlO_SPh7svOb5mIH9htDzLNCphe0RbgH8IP_OaMIvxeBtLXLBXXVHLjOQOuu75G5PyS1J1Q4I12QF0TQ7emkvLJ4sdeM3cM5tRMTun-OmyLBIB4C -d redirect_uri=encoded_redirect_uri https://accounts.spotify.com/api/token

}

Application.prototype.start = function(a, u) {
    //const promise = startUp(a,u,successCallback, failureCallback);
    //  promise.then(successCallback, failureCallback);

    var a_token = a;
    var u_id = u;
    songs_array = [];
    //curl - X GET "https://api.spotify.com/v1/me/playlists" - H "Authorization: Bearer {your access token}"
    token = "Bearer " + a_token;
    var playlists_api_url = "https://api.spotify.com/v1/users/" + u_id + "/playlists?limit=50";
    console.log(playlists_api_url);

    rp({
        url: playlists_api_url,
        headers: {
          "Authorization": token
        }
      },
      function(err, res) {
        if (res) {
          var playlists = JSON.parse(res.body); //all of user's playlists
          console.log("Number of playlists: " + playlists.items.length);
          var i = 0;
          while (i < playlists.items.length) {
            var playlist_url = playlists.items[i].href;
                request({
                    url: playlist_url,
                    headers: {
                      "Authorization": token
                    }
                  },
                  function(err, res) {
                    if (res) {
                      var each_playlist = JSON.parse(res.body);

                      for (var j = 0; j < each_playlist.tracks.items.length; j++) {
                        songs_array.push(each_playlist.tracks.items[j]);
                      }
                    }
                  });
                i++;
          }
      }
    }).then(function() {
      setTimeout(successCallback,5000)
  }).catch(function(err) {
        console.log("ERROR");
  });
}

function successCallback () {
    console.log("Songs length: " + songs_array.length);
    this.analysis.initPlaylist(songs_array, user_id, token);
}
console.log('Listening on 8888');
app.listen(8888);
