var user;
var userID;
var allNotes;
var currentUri;

chrome.tabs.getSelected(null, (tab) => {
  currentUri = tab.url;
});

var SELECT_VALUE = 'select';
var ALL_VALUE = 'all';

//Load event listener for dropdown
function optionChange () {
  $('#dropdown').change(function() {
    var value = $(this).val();
    var changes = {
      textToHighlight: [],
      textToUnhighlight: []
    };

    //unHighlight all notes
    $('#dropdown').find('option').each(function(index,element){
      if (element.text) {
        changes.textToUnhighlight.push(element.text);
      }
    });

    //If selecting --all-- in dropdown
    if (value === ALL_VALUE) {
      $('#dropdown').find('option').each(function(index,element){
        if (element.text) {
          changes.textToHighlight.push(element.text);
        }
      });
    } //If selecting anything, but --select--
    else if (value !== SELECT_VALUE) {
      var $currentOption = $('#dropdown option[value=' + value + ']');
      var text = $currentOption.text();
      changes.textToHighlight.push(text);
    }

    //Send object of text to highlight
    commitChanges(changes, userID, currentUri);

    //Set currentTextIndex back to 0
    chrome.storage.local.set({
      currentTextIndex: 0
    });
  });
}

//Set a change object on chrome local storage
function commitChanges(changes, userID, currentUri) {
  console.log(changes);
  chrome.storage.local.set({
    'changes': {'changes': changes, 'userID': userID, 'url': currentUri}
  }, function() {
    chrome.tabs.executeScript({
      file: "highlight.js"
    });
  })
}

//Load event listner for Scroll Button
function scroll() {
  $('#next').on('click', function(){
    chrome.tabs.executeScript({
      file: "scroll.js"
    });
  });
}

//Make call to server to get User
function getUsers () {
  $.ajax({
    url: `${env.URL}${userID}`,
    type: 'GET',
    success: (data) => {
      renderOption(data);
    },
    error: (data) => {
      console.log('Did not receive:' + data);
    }
  });
};

//Load event listner for "Noted" button
function notedButton() {
  $("#addNote").on("click", function() {

    //Get hightlighted text from browser
    chrome.tabs.executeScript({
      code: "window.getSelection().toString();"
    }, (selection) => {

      var text = selection[0];
      var note = {name: user, uri: currentUri, note: text};

      $.ajax({
        type: 'POST',
        contentType: 'application/json',
        url: `${env.URL}notes`,
        data: JSON.stringify(note),
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

//Checks if user is login for Auth0
function isLoggedIn(token) {
  // The user is logged in if their token isn't expired
  return jwt_decode(token).exp > Date.now() / 1000;
}

//Log out user by clearing the local storage
function logout() {
  // Remove the idToken from storage
  localStorage.clear();
  main();
}

//Render drop downlist
function renderOption(data) {
  var $dropdown = $('#dropdown');
  $dropdown.find('option').remove().end();

  chrome.tabs.getSelected(null, (tab) => {
    $dropdown.append($("<option/>", {
      label: "--Select--",
      value: SELECT_VALUE
    }));

    $dropdown.append($("<option/>", {
      label: "--All--",
      value: ALL_VALUE
    }));

    if(data.length !== 0) {
      data[0].urls.forEach(function(url) {
        if(url.name === tab.url) {
          url.pins.forEach(function(note, index) {
            $dropdown.append($("<option/>", {
              label: `Pin ${index + 1}: ${note.content.slice(0, 15)}...`,
              value: index,
              text: note.content
            }));
          });
        }
      });
    }
  });
}

//Render the Main App
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
    user = profile.email;
    userID = profile.user_id;
    getUsers();

    $('.loading').addClass('hidden');
    $('.note').removeClass('hidden');
    $('.logout-button').get(0).addEventListener('click', logout);
  });
}

//Render the login page
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

//Injects Jquery, Jquery.highlight, and CSS into current tab

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.init === 'init') {
      var authResult = JSON.parse(localStorage.authResult || '{}');
      var senderUri = sender.tab.url;
      sendResponse({
        url: senderUri,
        authResult: authResult
      });
    }
  }
);

document.addEventListener("DOMContentLoaded", () => {
  var authResult = JSON.parse(localStorage.authResult || '{}');
  const token = authResult.id_token;

  if (token && isLoggedIn(token)) {
    renderProfileView(authResult);
  } else {
    renderDefaultView();
  }

  notedButton();
  optionChange();
  scroll();

});