/**
 * RAM SOLUTIONS
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

const Application = function() {
  // this.analysis = new Analysis();
  // this.recommend = new Recommend();
  var b64idsecret = 'ZDE1NWY2MmRiMTBkNDIyYjk4MmJlMjY0MjFmNzYyZjM6ZDAwYWRjOWIyZTE2NDQzNDgwYTBlZWUyZWEwYjQzOTg=';
  var redirect_uri = 'http://localhost:8888/callback';
  var encoded_redirect_uri = 'http%3A%2F%2Flocalhost%3A8888%2Fcallback';
}

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

app.use(express.static(__dirname))
  .use(cors())
  .use(cookieParser());

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  console.log("Test");

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
        //console.log("HIIIII:" + user_id);
      }).then(function() {
        //console.log("hiohiohioh")
        const application = new Application();
        //console.log(application)
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



//var scope = 'user-read-private user-read-email playlist-read-collaborative playlist-modify-public playlist-read-private playlist-modify-private';
//var auth_URL = "https://accounts.spotify.com/authorize?client_id=d155f62db10d422b982be26421f762f3&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A8888%2Fcallback&scope=user-read-private user-read-email playlist-read-collaborative playlist-modify-public playlist-read-private playlist-modify-private";
//curl -H "Authorization: Basic ZDE1NWY2MmRiMTBkNDIyYjk4MmJlMjY0MjFmNzYyZjM6ZDAwYWRjOWIyZTE2NDQzNDgwYTBlZWUyZWEwYjQzOTg=" -d grant_type=authorization_code -d code=AQC7RYVXsq_pxY2h80MPutmxAwwBlKSsA5PAH8OHjU0qL1iSUJuv3iKRBGZRMi8_xqpHOqyGkiFzPTCEYcK_IBug20EniTIOynOYJlilu47KY-4W_C_qjkPHQvHCjxkb0vi2jScjxEoCa7_dguJOObkIzENusJLHAOFwgwJ__wRRFuqGTn9ln3Jq-3mzErXNYZun6DBifK0_XYqzi_edfj0Fz71eim3o8V2iI3Dml_vxHqXTh9PD8hZoSkbZxcPdTCe2ngU8uj76zlO_SPh7svOb5mIH9htDzLNCphe0RbgH8IP_OaMIvxeBtLXLBXXVHLjOQOuu75G5PyS1J1Q4I12QF0TQ7emkvLJ4sdeM3cM5tRMTun-OmyLBIB4C -d redirect_uri=encoded_redirect_uri https://accounts.spotify.com/api/token



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
        // console.log("Number of playlists: " + playlists.items.length);
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
    setTimeout(successCallback, 5000)
  }).catch(function(err) {
    console.log("ERROR");
  });

  function successCallback() {
    // console.log("Songs length: " + songs_array.length);
    console.log("hit")
    // this.analysis.initPlaylist(songs_array, user_id, token);
    initPlaylist(songs_array, user_id, token);
  }
}

console.log('Listening on 8888');
app.listen(8888);





/////////////////////////ANALYSIS////////////////////////////////

var acousticness;
var instrumentalness;
var tempo;
var danceability;
var energy;
var mood;

var acousticness_song;
var instrumentalness_song;
var tempo_song;
var danceability_song;
var energy_song;
var mood_song;

var rp = require('request-promise');

var user_id;
var token;
var playlist_id;

var current_song;

var final_playlist_array = [];
var final_playlist_array_ids = [];
var real_final_playlist_array = [];



/** This is the master function for making the first playlist. */
function initPlaylist(songs_array, user_id1, token1) {
  // iterate through first 3 songs and make recommend Object
  // call on thumbs up thumbs down function and see if
  user_id = user_id1;
  token = token1;
  for (var i = 0; i < songs_array.length; i++) {
    songAnalyzer(songs_array[i]);
    if (i < 20) {
      real_final_playlist_array.push(songs_array[i]);
      console.log(songs_array[i].track.name);
    }
  }
  for (var i = 0; i < real_final_playlist_array.length; i++) {
    final_playlist_array_ids.push(real_final_playlist_array[i].id);
  }
  const baseUrl = `https://embed.spotify.com/?theme=white&uri=spotify:trackset:A New Playlist:${
    final_playlist_array_ids.join()}`;

  $('.playlist').html(`<iframe src="${baseUrl}" height="400"></iframe>`);
  console.log("Songs done traversing. Here is final playlist: ");
  // for (var j = 0; j < real_final_playlist_array; j++) {
  //     console.log(real_final_playlist_array[j].name);
  // }
}

/** This is the where each song is analyzed individually. */
function songAnalyzer(song) {
  current_song = song;
  //console.log(song.track.name);
  acousticness_song = 0;
  instrumentalness_song = 0;
  tempo_song = 0;
  danceability_song = 0;
  energy_song = 0;
  mood_song = 0;
  //console.log("Id: " + each_playlist.tracks.items[0].track.id);
  var song_api_url = "https://api.spotify.com/v1/audio-features/" + song.track.id;

  //console.log(playlists_api_url);

  var options = {
    url: song_api_url,
    headers: {
      'Authorization': token
    },
    json: true
  };
  if (typeof document !== 'undefined') {

    // Template.myTemplate.rendered = function(){
    document.getElementById("InputId1").oninput = function() {
      myFunction1();
    };
    document.getElementById("InputId2").oninput = function() {
      myFunction2();
    };
    document.getElementById("InputId3").oninput = function() {
      myFunction3();
    };
    document.getElementById("InputId4").oninput = function() {
      myFunction4();
    };
    document.getElementById("InputId5").oninput = function() {
      myFunction5();
    };
    document.getElementById("InputId6").oninput = function() {
      myFunction6();
    };
    // }


    function myFunction1() {
      // acousticness = document.getElementById("InputId1").value / 100 //gets the oninput value
      acousticness = 0.5;
      document.getElementById('OutputId1').innerHTML = acousticness //displays this value to the html page
    }

    function myFunction2() {
      // instrumentalness = document.getElementById("InputId2").value / 100 //gets the oninput value
      instrumentalness = 0.5;
      document.getElementById('OutputId2').innerHTML = instrumentalness //displays this value to the html page
    }

    function myFunction3() {
      tempo = 75;
      // tempo = document.getElementById("InputId3").value //gets the oninput value
      document.getElementById('OutputId3').innerHTML = tempo //displays this value to the html page
    }

    function myFunction4() {
      danceability = 0.5;
      // danceability = document.getElementById("InputId4").value / 100 //gets the oninput value
      document.getElementById('OutputId4').innerHTML = danceability //displays this value to the html page
    }

    function myFunction5() {
      energy = 0.5;
      // energy = document.getElementById("InputId5").value / 100 //gets the oninput value
      document.getElementById('OutputId5').innerHTML = energy //displays this value to the html page
    }

    function myFunction6() {
      mood = 0.5;
      // mood = document.getElementById("InputId6").value / 100 //gets the oninput value
      document.getElementById('OutputId6').innerHTML = mood //displays this value to the html page
    }
  }
  rp.get(options, function(error, response, body) {
    if (typeof body !== 'undefined') {
      if (typeof body.acousticness !== 'undefined') {
        acousticness_song = body.acousticness;
      }
      if (typeof body.instrumentalness !== 'undefined') {
        instrumentalness_song = body.instrumentalness;
      }
      if (typeof body.tempo !== 'undefined') {
        tempo_song = body.tempo;
      }
      if (typeof body.danceability !== 'undefined') {
        danceability_song = body.danceability;
      }
      if (typeof body.energy !== 'undefined') {
        energy_song = body.energy;
      }
      if (typeof body.valence !== 'undefined') {
        mood_song = body.valence;
      }
    }

  }).then(function() {
    //console.log("hiohiohioh")
    setTimeout(successCallback2, 2000);
  }).catch(function(err) {
    // console.log("ERROR");
  });
}

function createPlaylist() {
  console.log(final_playlist_array)
  var playlists_api_url = "https://api.spotify.com/v1/users/" + user_id + "/playlists?limit=50";

  $.ajax({
        type: 'POST',
        url: playlists_api_url,
        data: JSON.stringify({
             "name": "A New Playlist | Spotimood",
            "description": "Your favourite tracks generated on Spotimood"

         }),
        headers: {
          'Authorization': 'Bearer ' + access_token,
          'Content-Type': 'application/json'
        },
        success: function(result) {
          console.log("playlist created: " + result.id);
          playlist_id = result.id;
        },
        error: function() {
          console.log('Error! :(');
        }
      })

      setTimeout(successCallback1, 1000);
      console.log(final_playlist_array);


  // var options = {
  //   url: playlists_api_url,
  //   headers: {
  //     'Authorization': token
  //     'Content-Type': 'application/json'
  //   },
  //   data: JSON.stringify({
  //        "name": "A New Playlist | Spotimood",
  //       "description": "Your favourite tracks generated on Spotimood"
  //
  //    }),
  //   json: true
  // };

  // rp.post(options, function(error, response, body) {
  //   console.log("playlist created: " + body.id);
  //   playlist_id = body.id;
  // }).then(function() {
  //   //console.log("hiohiohioh")
  //   setTimeout(successCallback1, 1000);
  //   console.log(final_playlist_array);
  //   for (var i = 0; i < final_playlist_array.length; i++) {
  //     final_playlist_array_ids.push(final_playlist_array[i].id);
  //   }
  //   const baseUrl = `https://embed.spotify.com/?theme=white&uri=spotify:trackset:A New Playlist:${
  //     final_playlist_array_ids.join()}`;
  //
  //   $('.playlist').html(`<iframe src="${baseUrl}" height="400"></iframe>`);
  //
  // }).catch(function(err) {
  //   console.log("ERROR");
  // });
}

function successCallback2() {
  var counter = 0;
  // console.log(acousticness_song);
  if (Math.abs(acousticness - acousticness_song) < 0.5) {
    counter++;
  }
  if (Math.abs(instrumentalness - instrumentalness_song) < 0.5) {
    counter++;
  }
  if (Math.abs(tempo - tempo_song) < 50) {
    counter++;
  }
  if (Math.abs(danceability - danceability_song) < 0.5) {
    counter++;
  }
  if (Math.abs(energy - energy_song) < 0.5) {
    counter++;
  }
  if (Math.abs(mood - mood_song) < 0.5) {
    counter++;
  }
  if (counter >= 2) {
    final_playlist_array.push(current_song);
    console.log(current_song.track.name + " ...was added.");
  }
}

function successCallback1() {
  var playlists_api_url = "https://api.spotify.com/v1/playlists/" + playlist_id + "/tracks";

  //console.log(playlists_api_url);

  /*var options = {
    url: playlists_api_url,
    headers: {
      'Authorization': token
      'Content-Type': application/json
    },
    data: {
      'name': "A New Playlist"
      'public': false
    },
    json: true
  };

  rp.post(options, function(error, response, body) {
    console.log("playlist created");

  }).then(function() {
    //console.log("hiohiohioh")
    setTimeout(successCallback1,1000);
  }).catch(function(err) {
        console.log("ERROR");
  });*/
}
