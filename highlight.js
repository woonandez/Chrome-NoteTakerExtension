chrome.storage.local.get('changes', function(results) {
  var changes = results.changes;

  changes.textToUnhighlight.forEach((value) => {
    $('body').unhighlight(value);
  });

  changes.textToHighlight.forEach((value) => {
    $('body').highlight(value);
  });

  $('body').find('.annotate').remove();
  $('body').append(`<h1 class="annotate">Test</h1>`);

  $('.highlightAnnotations').on('click', function() {
    // $(this).css("background-color", "green");
  });

  $('.annotate').on('click', function() {
    chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
      console.log(response.farewell);
    });
  });

  chrome.storage.local.remove('changes');
});
