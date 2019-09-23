const https = require('https');
const fs = require('fs');
const JSONStream = require('JSONStream');
function downloadFormula(options, formulas) {

    return new Promise((resolve, reject) => {
        let body;
        const req = https.get(options, (res) => {
            res.setEncoding('utf8');

            res.pipe(JSONStream.parse()).on('data', function (chunk) {
            
                var jsonContent = JSON.stringify(chunk);
                fs.writeFile('dev/' + chunk.name + '.json', jsonContent, (err) => {
                    if (err) {
                        throw err;
                    }
                    resolve(true);
                })
            });

        });
        req.on('error', function (e) {
            console.log('ERROR: ' + e.message);
            reject(false);
        });
    })
}
module.exports = downloadFormula;