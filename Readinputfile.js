const fs = require('fs');
var input;
function Readconfig(fileName){
        return new Promise((resolve,reject) => {
fs.readFile('/home/prharikamath/sandbox/CloudElementsMigration/CloudElements-Migration/'+fileName,'utf8',(err, contents) => {
    if(err) {
        console.error(err)
        reject(err);
    }
    resolve(JSON.parse(contents));
});
})
}
module.exports = Readconfig;
