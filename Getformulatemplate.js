const https = require('https');
const JSONStream = require('JSONStream');
function getFormula(options,formulas) {
   return new Promise((resolve, reject) => {
       const req = https.get(options, (res) => {
           res.setEncoding('utf8');
           res.pipe(JSONStream.parse()).on('data', function (chunk) {
               var jsonContent = JSON.stringify(chunk);
               resolve(JSON.parse(jsonContent));
           });
       });
       req.on('error', function (e) {
           console.log('ERROR: ' + e.message);
           reject(false);
       });
   })
}
module.exports = getFormula;