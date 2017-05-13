var user;
var userID;

function getUsers () {
  console.log(userID)
  $.ajax({
    url: 'http://127.0.0.1:3003/api/users/' + userID,
    type: 'GET',
    success: (data) => {
      console.log(data);
      renderOption(data);
    },
    error: (data) => {
      console.log('Did not receive:' + data);
    }
  });
};

function renderOption(data) {
  var $dropdown = $('#dropdown');
  $dropdown.find('option').remove().end();

  chrome.tabs.getSelected(null, (tab) => {
    console.log('data', data);
    console.log("new", data.urls);
    if(data.length !== 0) {
      data[0].urls.forEach(function(url) {
        if(url.name === tab.url) {
          url.pins.forEach(function(note, index) {
            $dropdown.append($("<option/>", {
              label: `Pin ${index}: ${note.slice(0, 15)}...`,
              value: index,
              text: note
            }));
          });
        }
      });
    }
  });
}

function optionChange () {
  $('#dropdown').change(function() {
    
    var index = $(this).val();
    console.log(index)
    var text = $('#dropdown option[value=' + index + ']').text();
    console.log(text);
    highlightText(text);
  });
}

function highlightText (text) {
   chrome.tabs.executeScript({
      code: "$('body').highlight('"+ text +"');"
   });
}

//get current tab url
function button() {
    $("#button").on("click", function(){
    var currentUri;

    chrome.tabs.getSelected(null, (tab) => {
      currentUri = tab.url;
    });

    //Get hightlighted text from browser
    chrome.tabs.executeScript({
      code: "window.getSelection().toString();"
    }, (selection) => {
    
      var text = selection[0];
      var fake = {name: user, uri: currentUri, note: text};
      console.log(JSON.stringify(fake));

      $.ajax({
        type: 'POST',
        contentType: 'application/json',
        url: 'http://127.0.0.1:3003/api/users/notes',
        data: JSON.stringify(fake),
        success: (data) => {
          console.log('SUCCESS!');
          getUsers();
        },
        error: (data) => {
          console.log('Did not receive:' + data);
        }
      });
    });
  });
}
function isLoggedIn(token) {
  // The user is logged in if their token isn't expired
  return jwt_decode(token).exp > Date.now() / 1000;
}

function logout() {
  // Remove the idToken from storage
  localStorage.clear();
  main();
}

function renderProfileView(authResult) {
  $('.mainPopup').removeClass('hidden');
  $('.default').addClass('hidden');
  $('.loading').removeClass('hidden');
  
  fetch(`https://${env.AUTH0_DOMAIN}/userinfo`, {
    headers: {
      'Authorization': `Bearer ${authResult.access_token}`
    }
  }).then(resp => {
    return resp.json();
  }).then((profile) => {
    console.log(profile);
    user = profile.email;
    userID = profile.user_id;
    getUsers();
  });
    $('.loading').addClass('hidden');
    $('.note').removeClass('hidden');
    $('.logout-button').get(0).addEventListener('click', logout);
}

function renderDefaultView() {
  $('.default').removeClass('hidden');
  $('.note').addClass('hidden');
  $('.loading').addClass('hidden');
  $('.login-button').get(0).addEventListener('click', () => {
  $('.default').addClass('hidden');
  $('.loading').removeClass('hidden');
    chrome.runtime.sendMessage({
      type: "authenticate"
    });
  });
}

function main () {
  const authResult = JSON.parse(localStorage.authResult || '{}');
  const token = authResult.id_token;
  if (token && isLoggedIn(token)) {
    renderProfileView(authResult);
  } else {
    renderDefaultView();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  var result = chrome.tabs.executeScript(null, {file: "jquery-3.2.1.min.js"});
  var result2 = chrome.tabs.executeScript(null, {file: "jquery.highlight.js"});
  chrome.tabs.insertCSS(null, {file:"noteTakerHighlight.css"});

  Promise.all([result, result2]).then(() => {
    main();
    button();
    optionChange();
  });
});

// document.addEventListener('DOMContentLoaded', main);