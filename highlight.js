chrome.storage.local.get('changes', function(results) {
  var changes = results.changes;
  var userID = results.userID;
  var tab = results.currentUri;

  changes.textToUnhighlight.forEach((value) => {
    $('body').unhighlight(value);
  });

  changes.textToHighlight.forEach((value) => {
    $('body').highlight(value);
  });

  $('body').find('.annotate').remove();
  $('body').append(`<h1 class="annotate">Test</h1>`);

  $('.highlightAnnotations').on('click', function() {
    if ( $(this).hasClass("highlightAnnotations") ) {
      var span = $(this);
      $(this).removeClass('highlightAnnotations');
      $(this).addClass('annotate');
      var elementPositionTop = $(this).offset().top;
      var elementPositionLeft = $(this).offset().left;

      var annotationDiv = $('<div class="annotation"><form><textarea row="1" col="20"></textarea><input type="submit" value="Submit"><button class="exit">Exit</button></form><br></div>')

      annotationDiv.css({
        'top': elementPositionTop,
        'left': elementPositionLeft
      })

      // Add annotations to annotation container

      $(this).prepend(annotationDiv);
      $(this).find('form').on('submit', function(event) {
        event.preventDefault();

        // Send annotation to database
        var annotation = postAnnotation(($(this).find('textarea').val()), userID, tab);
        $(this).after(annotation);
      });

      $('.exit').on('click', function() {
        $(this).parent().parent().remove();
        span.removeClass('annotate');
        setTimeout(function() { span.addClass('highlightAnnotations'); }, 0);
      });
    }
  });

  chrome.storage.local.remove('changes');
});

function postAnnotation(annotation, userID, url) {
  // Ajax call to annotations
  var annotationData = { 'name': userID, 'url': url, 'annotation': JSON.stringify(annotation) };

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