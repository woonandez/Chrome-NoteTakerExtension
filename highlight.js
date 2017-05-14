chrome.storage.local.get('textToHighlight', function(results) {
  $('body').highlight(results.textToHighlight);
  chrome.storage.local.remove('textToHightlight');
});