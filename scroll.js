chrome.storage.local.get('currentTextIndex', function(results) {
  var element = $('span.highlightAnnotations');
  results = results.currentTextIndex ? results.currentTextIndex : 0;

  if (element.length !== 0) {
    $('body').animate({
      scrollTop: element.eq(results).offset().top
    }, 500);
  }

  chrome.storage.local.set({
    currentTextIndex: results + 1
  });
});
