const https = require('https');
function setFormula(options,newtemplate) {
   return new Promise((resolve, reject) => {
       //console.log("option:" ,option)
       const req = https.request(options, (res) => {
           console.log('statusCode  set  :',  res.statusCode);
           //console.log('HEADERS: ' + JSON.stringify(res.headers));
           res.setEncoding('utf8');
           res.on('data', d => {
               //process.stdout.write(d);
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