var express = require('express');
var app = express();

app.use(express.static(__dirname + '/../client'));



const PORT = 7650;



app.listen(PORT, function () {

  console.log("listening on " + PORT);

});


