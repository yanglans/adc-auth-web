const fs = require("fs");
const path = require("path");

function base(file){
  var bitmap = fs.readFileSync(file);
  return 'data:text/css;base64,'+ new Buffer(bitmap).toString('base64');
}
console.log('============',base('./styled.css'))
