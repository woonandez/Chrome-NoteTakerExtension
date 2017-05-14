chrome.storage.local.get('changes', function(results) {
  var changes = results.changes;
  
  changes.textToUnhighlight.forEach((value) => {
    $('body').unhighlight(value);
  });
  changes.textToHighlight.forEach((value) => {
    $('body').highlight(value);
  });

  chrome.storage.local.remove('changes');
});