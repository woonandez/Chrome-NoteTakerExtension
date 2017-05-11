$(document).ready(function() {

  document.addEventListener("DOMContentLoaded",function () {
    chrome.tabs.insertCSS(null, {file:"highlight.css"});
    chrome.tabs.executeScript(null, {file: "jquery-3.2.1.min.js"});
    chrome.tabs.executeScript(null, {file: "jquery.highlight.js"});
  });

  function fetch () {
    $.ajax({
      url: 'http://127.0.0.1:3003/api/users',
      type: 'GET',
      success: (data) => {
        //Render the dropdown
        console.log(data)
        $('#dropdown').append($("<option/>", {
          label: "Pin 1",
          value: 0,
          text: 'data[data.length - 1].bookmarks[0].notes[0]'
        }));

        //see text for different options
        console.log($('#dropdown option:eq(1)').text())
      },
      error: (data) => {
        console.log('Did not receive:' + data);
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
      code: "$('body').highlight('Example'); window.getSelection().toString();"
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

  fetch();
});