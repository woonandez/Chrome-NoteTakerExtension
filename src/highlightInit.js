var AUTH0_DOMAIN = 'xosk.auth0.com';
var AUTH0_CLIENT_ID = 'gLvvvwQlgFMIhedyBZDIjsGrb1Oa47oZ';
var URL = 'https://study-buddy-.herokuapp.com/api/users/';

function findAnnotations(container, userID, tabUrl, content) {
  $.ajax({
    url: `${URL}${userID}`,
    type: 'GET',
    success: (data) => {
      if(data.length !== 0) {
        data[0].urls.forEach(function(url) {
          if (url.name === tabUrl) {
            url.pins.forEach( (pin) => {
              if ( pin.content === content ) {
                pin.annotations.forEach((annotation) => {
                  var newAnnotation = $('<div>').addClass('annotation').text(annotation);
                  container.after(newAnnotation);
                });
              }
            });
          }
        });
      }
    }
  });
}

function postAnnotation(annotation, userID, url, content) {
  // Ajax call to annotations
  var annotationData = JSON.stringify({ 'name': userID, 'uri': url, 'annotation': annotation, 'note': content });

  $.ajax({
    url: `${URL}annotations`,
    contentType: 'application/json',
    type: 'POST',
    data: annotationData,
    success: (data) => {
      console.log('Received data!')
    },
    error: (data) => {
      console.log('Did not receive:', data)
    }
  });

  return $('<div>').text(annotation);
}

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
                $('body').highlight(note.content);
              });
            }
          });
        }

        // Open Annotation Box
        $('.highlightAnnotations').on('click', function() {
          if ( $(this).hasClass("highlightAnnotations") ) {
            var span = $(this);
            var pinContent = span.html();
            $(this).removeClass('highlightAnnotations');
            $(this).addClass('annotate');
            var elementPositionTop = $(this).offset().top;
            var elementPositionLeft = $(this).offset().left;

            var annotationDiv = $('<div class="annotations"><form><textarea row="1" col="20"></textarea><input type="submit" value="Submit"><button class="exit">Exit</button></form><br></div>')
            annotationDiv.css({
              'top': elementPositionTop,
              'left': elementPositionLeft
            })
            $(this).prepend(annotationDiv);

            // Add annotations to annotation container
            findAnnotations(($(this).find('form')), userID, tab, pinContent);

            // Create Annotations
            $(this).find('form').on('submit', function(event) {
              event.preventDefault();
              // Send annotation to database
              var annotation = postAnnotation(($(this).find('textarea').val()), userID, tab, pinContent);
              $(this).after(annotation);
            });

            $('.exit').on('click', function() {
              $(this).parent().parent().remove();
              span.removeClass('annotate');
              setTimeout(function() { span.addClass('highlightAnnotations'); }, 0);
            });
          }
        });
      },
      error: (data) => {
        console.log('Did not receive:' + data);
      }
    });
  });
});
