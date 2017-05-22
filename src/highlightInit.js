var AUTH0_DOMAIN = 'xosk.auth0.com';
var AUTH0_CLIENT_ID = 'gLvvvwQlgFMIhedyBZDIjsGrb1Oa47oZ';
var URL = 'http://localhost:3003/api/users/';

chrome.runtime.sendMessage({init: "init"}, function(response) {
  var tab = response.url;
  var authResult = response.authResult;

  fetch(`https://${AUTH0_DOMAIN}/userinfo`, {
    headers: {
      'Authorization': `Bearer ${authResult.access_token}`
    }
  }).then(resp => {
    return resp.json();
  }).then((profile) => {
    var userID = profile.user_id;

    $.ajax({
      url: `${URL}${userID}`,
      type: 'GET',
      success: (data) => {
        allNotes = data;

        if(data.length !== 0) {
          data[0].urls.forEach(function(url) {
            if(url.name === tab) {
              url.pins.forEach(function(note) {
                $('body').highlight(note);
              });
            }
          });
        }
      },
      error: (data) => {
        console.log('Did not receive:' + data);
      }
    });
  });
});

