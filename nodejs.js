// [1,2,3,4].forEach(function (i){
//     console.log(i);
// });

// function asyncForEach(array, cb) {
//     array.forEach(function () {
//         setTimeout(cb, 0);
//     })
// }

// asyncForEach([1,2,3,4], function (i) {
//     console.log(i);
// })

var readline = require('readline');
var rl = readline.createInterface(process.stdin, process.stdout);
rl.setPrompt('guess> ');
rl.prompt();
rl.on('line', function(line) {
    if (line === "right") rl.close();
    rl.prompt();
}).on('close',function(){
    process.exit(0);
});