$.ajax({
  url: 'http://127.0.0.1:3003/',
  type: 'GET',
  success: (data) => {
    console.log('Hello World');
  },
  error: (data) => {
    console.log('Did not receive:' + data);
  }
});

$("#button").on("click", function(){

  var fake = {name: 'Vicki', password: 'Ilke', uri: 'pornhub.com', notes:'i got them money maker'};
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
})


// $.ajax({
//    type: "POST",
//    url: "http://myDomain.com/path/AddPlayer",
//    data: JSON.stringify({
//       Name: "Test",
//        Credits: 0
//    }),
//    //contentType: "application/json",
//    dataType: 'json',
//    complete: function(data) {
//        $("content").html(data);
//   }
// });​