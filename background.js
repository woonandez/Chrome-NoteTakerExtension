$('.loading').show();
$('.loaded').hide();

document.addEventListener("DOMContentLoaded", () => {
  var result = chrome.tabs.executeScript(null, {file: "jquery-3.2.1.min.js"});
  var result2 = chrome.tabs.executeScript(null, {file: "jquery.highlight.js"});
  chrome.tabs.insertCSS(null, {file:"noteTakerHighlight.css"});

  Promise.all([result, result2]).then(() => {
    fetch();
    $('.loading').hide();
    $('.loaded').show();  
    button();
    optionChange();
  });
});

function fetch () {
  $.ajax({
    url: 'http://127.0.0.1:3003/api/users',
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
    data[0].urls.forEach(function(url) {
      if(url.name === tab.url) {
        url.pins.forEach(function(pin, index) {
          $dropdown.append($("<option/>", {
            label: `Pin ${index}: ${pin.slice(0, 15)}...`,
            value: index,
            text: pin
          }));
        });
      }
    });
  };

  //get current tab url
  $("#button").on("click", function(){
    var currentUri;

    chrome.tabs.getSelected(null, (tab) => {
      currentUri = tab.url;
    });

    //Get hightlighted text from browser
    chrome.tabs.executeScript({
      code: "$('body').highlight('Hello'); window.getSelection().toString();"
    }, (selection) => {
    
      var text = selection[0];
      var fake = {name: 'Kevin', uri: currentUri, note: text};
      console.log(JSON.stringify(fake));

      $.ajax({
        type: 'POST',
        contentType: 'application/json',
        url: 'http://127.0.0.1:3003/api/users/notes',
        data: JSON.stringify(fake),
        success: (data) => {
          console.log('SUCCESS!');
          fetch();
        },
        error: (data) => {
          console.log('Did not receive:' + data);
        }
      });
    });
  });
}

function optionChange () {
  $('#dropdown').change(function() {
    var index = $(this).val();
    var text = $('#dropdown option[value=' + index + ']').text();
    highlightText(text);
  })
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
      var fake = {name: 'Kevin', uri: currentUri, note: text};
      console.log(JSON.stringify(fake));

      $.ajax({
        type: 'POST',
        contentType: 'application/json',
        url: 'http://127.0.0.1:3003/api/users/notes',
        data: JSON.stringify(fake),
        success: (data) => {
          console.log('SUCCESS!');
          fetch();
        },
        error: (data) => {
          console.log('Did not receive:' + data);
        }
      });
    });
  });
}
