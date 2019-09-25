var Readconfig = require('./Readinputfile');
var downloadFormula = require('./Download');
var upload = require('./Upload');
const fs = require('fs');
const path = require('path');
var getFormula = require('./Getformulatemplate');
var setFormula = require('./Setformulatemplate');
// const shelljs = require('shelljs');
const readlineSync = require('readline-sync');
// var delfs = require('extfs');
// var async = require('async');

// --------------------------------------------------------------
//execution start point
// --------------------------------------------------------------

async function main() {
  var values = await Readconfig('Input.json');
  console.log("start");
  let formulas = values.dev.formulas.formula_ids;



  // --------------------------------------------------------------
  //To DELETE all files under dev folder
  // --------------------------------------------------------------

  const directory = 'dev';
  await fs.readdir(directory, (err, files) => {
    if (err) throw err;
    for (const file of files) {
      fs.unlink(path.join(directory, file), err => {
        if (err) throw err;
      });
    }
  });
  /*End of delete*/



  // --------------------------------------------------------------
  //To DELETE all EMPTY folders under prod folder
  // --------------------------------------------------------------
  let prodfiles = fs.readdirSync('prod');
  for (i in prodfiles) {
    let files = fs.readdirSync('prod/' + prodfiles[i])
    if (files.length === 0) {
      fs.rmdirSync('prod/' + prodfiles[i]);
    }
  };

  /*End of delete*/



  // --------------------------------------------------------------
  //code to DOWNLOAD formulas from development into the system for updation to production
  // --------------------------------------------------------------


  // let loopobject = {};

  // for (i in formulas) {
  //   let option = values.dev.options
  //   option.method = 'GET'
  //   option.path = "/elements/api-v2/formulas/" + formulas[i] + "/export";
  //   loopobject["task " + (Number(i))] = function(){
  //     downloadFormula(option,formulas)
  //   }
  //   console.log("Check:", i);
  // }
  // console.log("Loop Object :",loopobject);

  //  // Async Parallel 

  // await async.parallel(loopobject,function(err,results){
  //   if(err){
  //     console.log("Unsuccessful download request",err);
  //   } 
  // });

  for (i in formulas) {
    let option = values.dev.options
    option.method = 'GET'
    option.path = "/elements/api-v2/formulas/" + formulas[i] + "/export";
    await downloadFormula(option, formulas).catch(err => {
      console.log("Request Failed");
    })
  }

  console.log("Download completed Successfully");


  switch (process.argv[2]) {

    case 'migration':
      migration();
      break;

    case 'update':
      update('update');
      break;

    case 'revert':
      update('revert');
      break;

    default:
      console.log('specify the correct operaion...!');
      break
  }
}


// --------------------------------------------------------------
//code for ADDING A NEW FORMULA to production from development
// --------------------------------------------------------------

async function migration() {
  var values = await Readconfig('Input.json');
  let option = values.prod.options;
  option.method = 'POST';
  option.path = '/elements/api-v2/formulas';
  let files = fs.readdirSync('dev');
  let mapper = {};

  for (i in files) {
    let map = await upload(option, files[i]).catch(err => {
      console.log("Failed to upload formula");
    });
    mapper = Object.assign(map, mapper);
  }

  values.mapper = mapper;

  fs.writeFile('Input.json', JSON.stringify(values), () => { });
  console.log("All formulas are successfully uploaded to production");
}


// --------------------------------------------------------------
//code for UPDATE formula 
// --------------------------------------------------------------

async function update(task) {

  let dir;
  let props;
  let flag = false;
  let updatetimestamp = new Date();
  var checkpoint = './prod/' + updatetimestamp;
  var values = await Readconfig('Input.json');
  let prodcontentlist = fs.readdirSync('prod');

  // choosing the update option whether or not to REVERT changes

  if (task === 'revert') {
    console.log("Following are available restore points.");

    for (i in prodcontentlist) {
      console.log((Number(i) + 1) + ":" + prodcontentlist[i]);
    }
    var choice = readlineSync.question("Please make a choice: ");
    var restorepoint = prodcontentlist[choice - 1];
    console.log(restorepoint);

    dir = 'prod/' + restorepoint + '/'
  }

  else {
    dir = 'dev'
  }

  /* Creating the repo in prod with the execution timestamp as the repo name */

  if (!fs.existsSync(checkpoint)) {
    fs.mkdirSync(checkpoint);
  }


  // Fetching the list of all the files in the repo as mentioned in 'dir' variable

  let files = fs.readdirSync(dir);
  console.log(files);

  for (i in files) {
    let devfile = await Readconfig(dir + '/' + files[i]);

    option = values.prod.options;
    option.method = "GET"
    option.path = (dir === 'dev') ? "/elements/api-v2/formulas/" + values.mapper[devfile.id] : "/elements/api-v2/formulas/" + devfile.id;

    let existingformulatemplate = await getFormula(option).catch(err => {
      console.log("Get existing formula template request failed");
    })

    var jsonContent = JSON.stringify(existingformulatemplate);

    fs.writeFile(checkpoint + '/' + existingformulatemplate.name + '.json', jsonContent, (err) => {
      if (err) {
        throw err;
      }
    });

    let prodname = existingformulatemplate.name;
    let devname = devfile.name;
    let terminate = false;

    if (prodname !== devname) {
      var data = readlineSync.question('Seems like the formula in production has ( ' + prodname + ' : ' + devname + ' ) a different name in development!Do you wish to proceed with the Updation (Y)es / (N)o  : ');

      if (data.toUpperCase() === 'N' || data.toUpperCase() === 'NO') {
        console.log('Migration terminated');
        terminate = true;
      }
    }


    for (i in existingformulatemplate.steps) {
      if (existingformulatemplate.steps[i].name === "Props" || existingformulatemplate.steps[i].name === "props") {
        props = existingformulatemplate.steps[i];
        flag = true;
      }
    }


    // --------------------------------------------------------------
    //code for finding steps added to the formula in production
    // --------------------------------------------------------------

    let stepsupdate = [];
    let prolength = existingformulatemplate.steps.length;

    for (i in devfile.steps) {
      for (j = 0; j < prolength; j++) {
        if (devfile.steps[i].name !== existingformulatemplate.steps[j].name) {
          continue;
        }
        else {
          break;
        }
      }
      if (j === prolength) {
        stepsupdate.push(devfile.steps[i].name);
      }
    }

    // --------------------------------------------------------------
    //code for finding steps deleted from the formula in production
    // --------------------------------------------------------------

    let stepsdelete = [];
    let devlength = devfile.steps.length;

    for (i in existingformulatemplate.steps) {
      for (j = 0; j < devlength; j++) {
        if (existingformulatemplate.steps[i].name !== devfile.steps[j].name) {
          continue;
        }
        else {
          break;
        }
      }
      if (j === devlength) {
        stepsdelete.push(existingformulatemplate.steps[i].name);
      }
    }


    if (flag) {
      for (i in devfile.steps) {
        if (devfile.steps[i].name === "Props" || devfile.steps[i].name === "props") {
          devfile.steps[i] = props
        }
      }
    }

    existingformulatemplate.steps = devfile.steps;
    existingformulatemplate.triggers[0].onSuccess = devfile.triggers[0].onSuccess;
    existingformulatemplate.triggers[0].onFailure = devfile.triggers[0].onFailure;

    option.method = "PUT"

    if (terminate === false) {
      await setFormula(option, JSON.stringify(existingformulatemplate)).catch(err => {
        console.log("Set new formula request failed");
        console.log(err);
      })
      console.log("New steps added :", stepsupdate);
      console.log("Old steps deleted :", stepsdelete);
    }
  }

  console.log("The Updation has been successfully completed!");
}
main();  