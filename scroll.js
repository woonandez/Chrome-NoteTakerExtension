chrome.storage.local.get('currentTextIndex', function(results) {
  results = results.currentTextIndex ? results.currentTextIndex : 0;
  var element = $('span.highlight');
  if (element.length !== 0) {
    $('body').animate({
      scrollTop: element.eq(results).offset().top     
    }, 500);
  }

  chrome.storage.local.set({
    currentTextIndex: results + 1
  });
});
