$(document).ready(function() {
  var text;

  //Get hightlighted text from browser
  chrome.tabs.executeScript( {
    code: "window.getSelection().toString();"
  }, function(selection) {
    text = selection[0];
  });
  
  // $.ajax({
  //   url: 'http://127.0.0.1:3003/api/users',
  //   type: 'GET',
  //   success: (data) => {
  //     console.log(data);
  //   },
  //   error: (data) => {
  //     console.log('Did not receive:' + data);
  //   }
  // });

  $("#button").on("click", function(){
  
    var fake = {name: 'Kevin', password: 'Nguyen', uri: 'www.google.com', notes: text};
    console.log(JSON.stringify(fake));

    $.ajax({
      type: 'POST',
      contentType: 'application/json',
      url: 'http://127.0.0.1:3003/api/users',
      data: JSON.stringify(fake),
      success: (data) => {
        console.log(data);
      },
      error: (data) => {
        console.log('Did not receive:' + data);
      }
    });
  });
});
