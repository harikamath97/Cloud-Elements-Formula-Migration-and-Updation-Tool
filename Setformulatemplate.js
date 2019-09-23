const https = require('https');
function setFormula(options,newtemplate) {
   return new Promise((resolve, reject) => {
       const req = https.request(options, (res) => {
           res.setEncoding('utf8');
           res.on('data', d => {
               resolve(true);
             })
       })
       req.write(newtemplate);
       req.end();
       req.on('error', function (e) {
           console.log('ERROR: ' + e.message);
           reject(false);
       });
   })
}
module.exports = setFormula;