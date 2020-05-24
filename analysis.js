const Analysis = function() {

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


// Template.myTemplate.rendered = function(){
  document.getElementById("InputId1").oninput = function() {
      this.myFunction1()
  };
  document.getElementById("InputId2").oninput = function() {
      this.myFunction2()
  };
  document.getElementById("InputId3").oninput = function() {
      this.myFunction3()
  };
  document.getElementById("InputId4").oninput = function() {
      this.myFunction4()
  };
  document.getElementById("InputId5").oninput = function() {
      this.myFunction5()
  };
  document.getElementById("InputId6").oninput = function() {
      this.myFunction6()
  };
// }

}


Analysis.prototype.myFunction1 = function() {
   acousticness = document.getElementById("InputId1").value/100 //gets the oninput value
   document.getElementById('OutputId1').innerHTML = acousticness //displays this value to the html page
}

Analysis.prototype.myFunction2 = function() {
     instrumentalness = document.getElementById("InputId2").value/100 //gets the oninput value
   document.getElementById('OutputId2').innerHTML = instrumentalness //displays this value to the html page
}

Analysis.prototype.myFunction3 = function() {
     tempo = document.getElementById("InputId3").value //gets the oninput value
   document.getElementById('OutputId3').innerHTML = tempo //displays this value to the html page
}

Analysis.prototype.myFunction4 = function() {
   danceability = document.getElementById("InputId4").value/100 //gets the oninput value
   document.getElementById('OutputId4').innerHTML = danceability //displays this value to the html page
}

Analysis.prototype.myFunction5 = function() {
   energy = document.getElementById("InputId5").value/100 //gets the oninput value
   document.getElementById('OutputId5').innerHTML = energy //displays this value to the html page
}

Analysis.prototype.myFunction6 = function() {
   mood = document.getElementById("InputId6").value/100 //gets the oninput value
   document.getElementById('OutputId6').innerHTML = mood //displays this value to the html page
}

//Analysis.apiUrl = 'https://api.spotify.com/v1/'

//allow the user to enter some songs
// Analysis.events = function (){
//   $('form').on('submit', function(e){
//     e.preventDefault();
//     let songs = $('input[type=search]').val();
//     console.log(songs);
//     console.log('HI HOW ARE YA');
//     songs = songs.split(',');
//     let search = songs.map(songName => Analysis.searchSongs(songName));
//     console.log(search);
//   });
// };

//search has to find the song from that songs_array
// Analysis.searchSongs = (songName) => $.ajax({
//   url: `${Analysis.apiUrl}search`,
//   method: 'GET',
//   dataType: 'json',
//   data: {
//     q: songName,
//     type: 'song'
//   }
// });
//from those songs obtain artists and Generates
//default limit to 50
//plug in token
//get resulting list of songs
//create playlist from songs if they were in the original songs array


/** This is the master function for making the first playlist. */
Analysis.prototype.initPlaylist = function(songs_array, user_id1, token1) {
  // iterate through first 3 songs and make recommend Object
  // call on thumbs up thumbs down function and see if
  user_id = user_id1;
  token = token1;
  for (var i = 0; i < songs_array.length; i++){
    this.songAnalyzer(song[i]);
  }
  console.log("Songs done traversing");
}

/** This is the where each song is analyzed individually. */
Analysis.prototype.songAnalyzer = function (song) {
  current_song = song;

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

  rp.get(options, function(error, response, body) {
    acousticness_song = body.acousticness;
    instrumentalness_song = body.instrumentalness;
    tempo_song = body.tempo;
    danceability_song = body.danceability;
    energy_song = body.energy;
    mood_song = body.valence;
  }).then(function() {
    //console.log("hiohiohioh")
    setTimeout(this.successCallback,2000);
  }).catch(function(err) {
        console.log("ERROR");
  });
}

Analysis.prototype.createPlaylist = function () {
  var playlists_api_url = "https://api.spotify.com/v1/users/"+ user_id +"/playlists?limit=50";

  var options = {
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
    console.log("playlist created: " + body.id);
    playlist_id = body.id;
  }).then(function() {
    //console.log("hiohiohioh")
    setTimeout(this.successCallback1,1000);
    for (var i = 0; i < final_playlist_array.length; i++) {
      final_playlist_array_ids.push(final_playlist_array[i].id);
    }
    const baseUrl = `https://embed.spotify.com/?theme=white&uri=spotify:trackset:A New Playlist:${
      final_playlist_array_ids.join()}`;

    $('.playlist').html(`<iframe src="${baseUrl}" height="400"></iframe>`);

  }).catch(function(err) {
        console.log("ERROR");
  });
}

Analysis.prototype.successCallback function() {
  var counter = 0;
  if(Math.abs(acousticness-acousticness_song)<0.1){
    counter++;
  }
  if(Math.abs(instrumentalness-instrumentalness_song)<0.1){
    counter++;
  }
  if(Math.abs(tempo-tempo_song)<10){
    counter++;
  }
  if(Math.abs(danceability-danceability_song)<0.1){
    counter++;
  }
  if(Math.abs(energy-energy_song)<0.1){
    counter++;
  }
  if(Math.abs(mood-mood_song)<0.1){
    counter++;
  }
  if(counter >= 4) {
    final_playlist_array.push(current_song);
    console.log(current_song.track.name + " ...was added.");
  }
}

Analysis.prototype.successCallback1 function() {
  var playlists_api_url = "https://api.spotify.com/v1/playlists/"+ playlist_id +"/tracks";

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

// Analysis.init = function(){
//   Analysis.events();
// };
