chrome.storage.local.get('textToUnhighlight', function(results) {
  $('body').unhighlight(results.textToUnhighlight);
  chrome.storage.local.remove('textToUnhighlight');
});