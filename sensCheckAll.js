// test1
const YES = 1;
const NO = 0;

var Promise = require('promise');
//--- mongoose setting
var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/wsns0');

var db = mongoose.connection;
db.on('error',console.error.bind(console,'mongoose connection error'));

var wsnSchema = mongoose.Schema({
	wsnData: String,
	date:{type:Date,default:Date.now}
});

var wsnDB1 = mongoose.model('wsnDB1',wsnSchema);

var arryEndDevice = [2,25,36,2,25,36,18,18];

var agn0 = [4,4];
var agn1 = [1,4,4,2,1, 4,4,2,1,1, 4,4,1,4,4, 1,2,2,2,2, 2,2,2,2,2];
var agn2 = [2,4,2,3,3, 3,3,4,4,4, 4,3,3,3,3, 2,2,4,3,3, 3,3,2,4,2, 3,4,4,3,4, 4,3,3,2,2, 4];

var agn3 = [4,4];
var agn4 = [1,4,4,2,1, 4,4,2,1,1, 4,4,1,4,4, 1,2,2,2,2, 2,2,2,2,2];
var agn5 = [2,4,2,3,3, 3,3,4,4,4, 4,3,3,3,3, 2,2,4,3,3, 3,3,2,4,2, 3,4,4,3,4, 4,3,3,2,2, 4];

var agn6 = [3,3,3,4,4, 3,2,3,2,3, 2,3,4,4,3, 3,3,2];
var agn7 = [2,3,3,3,4, 4,3,2,3,2, 3,2,3,4,4, 3,3,2];

var now = new Date(); 
var arrySensNo = [agn0,agn1,agn2,agn3,agn4,agn5,agn6, agn7]; 
var sensObj = {	enabled: true, sensId: 0, elapsed: now, oldStatus: [0,0,0,0,0,0], status: [0,0,0,0,0,0], 
				moving: true, rxData:'0000'};

var sensor = [sensObj,sensObj,sensObj,sensObj];

var mastCtrl = { numSens : 0, rxTime : now, oldRxTime : now, status : 0, rxData :'0000'};

var mastStat = {rxdSignal:NO,solarVolt:0,battVolt:0,chipVolt:0,sensNumb:0};

var G0 = [], G1 = [], G2 = [], G3 = [], G4 = [], G5 = [], G6 = [], G7 = [];

var WSNT 	  = [G0,G1,G2,G3,G4,G5,G6,G7];
var MAST_STAT = [G0,G1,G2,G3,G4,G5,G6,G7]; 

for ( var i = 0 ; i < 8 ; i ++ ){

	var count = arryEndDevice[i]; 
	for ( var j = 0 ; j < count ; j ++){
		MAST_STAT[i].push([]);
	}
}
var tblStat = MAST_STAT;

var fs = require('fs');

var fileName = 'sensCheckAll.txt';

var resultText = ' start of check sens network state \r\n'; 

/*
db.once('open', function(){

	console.log('OK db connected');

   var promise = getWsnsStat();

   promise
   .then(function(result){
      console.log('----------------------------------');
      console.log('     promise then');
      console.log('----------------------------------');
		console.log(result);		
      var testIn = JSON.stringify(result);
      var testOut = testIn.replace(/},/g,']\r\n');
		fs.writeFileSync(fileName,testOut, 'utf8');
   })
   .catch(function(err){
      console.log('promise catch');
      console.log(err);
   });
});
*/
var resultText = [];

db.once('open', function(){

	console.log('OK db connected');

   var promise = getWsnsStat();

   promise
   .then(function(result){
      console.log('----------------------------------');
      console.log('     promise then');
      console.log('----------------------------------');
      var testIn = JSON.stringify(result);
      var testOut = testIn.replace(/},/g,']\r\n');
		fs.writeFileSync(fileName,testOut, 'utf8');
		console.log(testOut);		
   })
   .catch(function(err){
      console.log('promise catch');
      console.log(err);
   });

	resultText = [];

   var promise2 = getWsnsValu();

   promise2
   .then(function(result){
      var testIn = JSON.stringify(result);
      // var testOut = testIn.replace(/},/g,']\r\n');
      var testOut = testIn.replace(/:,/g,'\r\n');
		fs.appendFileSync(fileName,'\r\n start Sens Value table \r\n', 'utf8');
		fs.appendFileSync(fileName,testOut, 'utf8');
		console.log(testOut);		
   })
   .catch(function(err){
      console.log('promise catch');
      console.log(err);
   });
});

function getWsnsValu(){
	return new Promise(function(resolve,reject){
		var sequecne =Promise.resolve();
		for( i= 0 ; i < MAST_STAT.length; i++){
			for ( var j = 0; j < MAST_STAT[i].length ; j ++ ){
			(function(){

				var index = j;

				var mastId = 'G'+ i; 

         	if( (index + 1) < 10) mastId += '0'+ (index+1);
         	else mastId += index+1;

				sequence = sequecne.then(function(){
					return getMastValu(mastId);
				})
				.then(function(res){
					// console.log(res);
					resultText += res;	   			
					if(mastId == 'G718') resolve(resultText);
				})
				.catch(function(err){
					console.log(err);
					reject(err);
				})
			}()) // closure function 
			}	
		}	
	});
}


function getWsnsStat(){
	return new Promise(function(resolve,reject){

		var sequecne =Promise.resolve();

		for( i= 0 ; i < MAST_STAT.length; i++){
			for ( var j = 0; j < MAST_STAT[i].length ; j ++ ){
			(function(){

				var index = j;

				var mastId = 'G'+ i; 
				// console.log( 'Group = ',mastId);

         	if( (index + 1) < 10) mastId += '0'+ (index+1);
         	else mastId += index+1;

				sequence = sequecne.then(function(){
					return getMastStat(mastId);
				})
				.then(function(res){
					//console.log(mastId,res);
					if(res.D == 'No'){
						// tblStat[i][index] = res;
						// console.log(mastId + 'No Data');
					}else{
						resultText.push(res);
					}
					if(mastId == 'G718') resolve(resultText);				
				})
				.catch(function(err){
					console.log(err);
					reject(err);
				})
			}()) // closure function 
			}	
		}	
	});
}



function checkMastStat(mastId){
   return new Promise(function(resolve, reject){

	var promise = getMastStat(mastId);

	var returnVal = '';

	promise
	.then(function(result){
		// console.log(result);
		if(result.D == 'No'){
			var testIn = JSON.stringify(result);
      	var testOut = testIn.replace(/],/g,']\r\n');
			//console.log(testOut);
			returnVal = testOut;
			return 0;
		}else{
			var testIn = JSON.stringify(result);
      	var testOut = testIn.replace(/],/g,']\r\n');
			console.log(testOut);
			returnVal = testOut;

			var groupNo = mastId[1] * 1;
			var mastNo  = mastId[2] * 10 + mastId[3] * 1 - 1;

			var sensNo = arrySensNo[groupNo][mastNo]; 
			console.log( 'sensNo = ',sensNo);
			return getMastValu(mastId,sensNo);
		}
	})
	.then(function(result){
		console.log('getMastState result = ',result);
		var testIn = JSON.stringify(result);
     	var testOut = testIn.replace(/],/g,']\r\n');

		returnVal += '\r\n';
		returnVal += testOut;
		resolve( returnVal);
	})
	.catch(function(err){
		reject(err);
	});
	});
}


var lastDays = 7;

var getMastStat = function ( param ){
   return new Promise(function(resolve, reject){
   wsnDB1.find(
      {$and:[{"date" :{
         $lte:new Date(),
         $gte:new Date(new Date().setDate(new Date().getDate() - lastDays))}},
			{"wsnData":{$regex:param}},
      	{"wsnData":{$regex:'M,'}}
      ]},
      {'wsnData':true,_id: false, 'date':true},
      function (err, docs){
         if( err ) {
            reject(err);
         }else{
            try{
               var returns = {Id:0,D:0,btv:0,SN:0,SV:0,BV:0,CV:0,SN:0};
               if(docs[0]){

                  for ( var key in docs){
                     if( tmp1 = docs[key].wsnData.split(",")){ 
                        returns.D = docs[key].date;
                        break;
                  	}
               	}
                 	var groupId = param[1]*1;
                  var id = param[2]*10+param[3]*1 -1;
                  var saveNo = arrySensNo[groupId][id];           

                  returns.Id = param;
                  returns.SV = tmp1[11];
                  returns.BV = tmp1[12];
                  returns.CV = tmp1[14];
                  var SN = tmp1[18][0];

                  if(returns.BT < 3.5 ) 	returns.btv = 'battery low';
                  else 							returns.btv ='OK';

                  if( SN != saveNo ){
                     returns.SN = tmp1[18][0] +' not Eq '+saveNo;
                  }else returns.SN = saveNo;

                  var group = param[1];
                  var mastId = param[2]*10 + param[3] * 1;
                  resolve(returns);
               }else{
						returns.Id = param;
						returns.D = 'No';
                  resolve(returns);
               }
            }
            catch(err){
               console.log(err);
               reject(err);
            }
         }}
      ).limit(5).sort({'date':-1});
   });
}

function getSensNumber(mastId){
	var groupId = mastId[1]*1;
   var id = mastId[2]*10 + mastId[3]*1 -1;
   var saveNo = arrySensNo[groupId][id];           
	return saveNo;
}

function getMastValu(mastId){

	return new Promise(function(resolve,reject){

	var sequence = Promise.resolve();

	var retu =[];
	var results= 0;
	var maxSens = getSensNumber(mastId);

	for( var i = 1 ; i < ( maxSens+1) ; i++){
		(function(){
			var closInde = i;
			
			sequence = sequence.then(function(){
				return getSensValu(mastId,closInde);
			})
			.then(function(results){
				retu.push(results);
				if(closInde == maxSens )  resolve(retu);
			})
			.catch(function(err){
				console.log('getMastValu catch error');
				console.log(err);
				reject(err);				
			}) 
		}())
	}
	//resolve(retu);
	});
}	

var getSensValu = function( mastId,sensNo ){

	return new Promise(function( resolve,reject){

	var tabSens = [];
	var promise = getSensValue1(mastId,sensNo,0); // sens= 0, hour = 0 

	promise
	.then(function(res){ 
		if(res){
			tabSens.push(mastId);
			tabSens.push(sensNo);
			tabSens.push(0);
			tabSens.push(':');
			tabSens.push(res);
			tabSens.push(':');
		}
		return getSensValue1(mastId,sensNo,12);
	})
	.then(function(res){
		if(res){
			tabSens.push(mastId);
			tabSens.push(sensNo);
			tabSens.push(12);
			tabSens.push(':');
			tabSens.push(res);
			tabSens.push(':');
		}
		return getSensValue1(mastId,sensNo,24);
	})
	.then(function(res){
		if(res){
			tabSens.push(mastId);
			tabSens.push(sensNo);
			tabSens.push(24);
			tabSens.push(':');
			tabSens.push(res);
			tabSens.push(':');
		}
		return getSensValue1(mastId,sensNo,36);
	})
	.then(function(res){
		if(res){
			tabSens.push(mastId);
			tabSens.push(sensNo);
			tabSens.push(36);
			tabSens.push(':');
			tabSens.push(res);
			tabSens.push(':');
		}
		resolve(tabSens);
	})
	.catch(function(err){
		console.log(mastId + 'Error');
		console.log(err);
		reject(err);
	})
//--- end of primise

	});// return promise function
}


function getSensValue1(mastId,sensNo,hour){

	return new Promise(function ( resolve,reject){

	var oneHour = 60*60*1000;
	var toCount   = new Date() - hour * oneHour;
	var fromCount = new Date() - (hour + 1) * oneHour;

	var sensFilter = ','+sensNo+',';

	wsnDB1.find(
		{$and:[{"date" :{$lte:toCount, $gte:fromCount}},
			{"wsnData":{$regex:mastId}}, 
			{"wsnData":{$regex:sensFilter }}, 
			{"wsnData":{$regex:'L,'}} ] },  	// find filtering
		{'wsnData':true,_id: false, 'date':true},								// filtering item
		function (err, docs){
			if( err ) {
				reject(err);
			}else{
				try{
					var tmp1 ='';
					var returns = [];
					if(docs[0]){
						for ( var key in docs){
							if( tmp1 = docs[key].wsnData.split(",")){ 
								break;
							}
						}
						for ( var i = 5 ; i < 10 ; i ++ ) returns.push(tmp1[i]);
					}else{
						returns = 0;
					}
					resolve(returns);
				}
				catch(e){
					console.error(e);
					reject(e);
				}
			}}
		).limit(5).sort({'date':-1});
	});
}

//------------------------------

var preExit =[];

process.stdin.resume();
process.on('exit',function(code) {
	var i;
	console.log('Process exit');

	for( i = 0; i < preExit.length; i++){
		preExit[i](code);
	}
	process.exit(code);
});

// Catch CTRL+C
process.on ('SIGINT', function () {
	
	console.log ('\nCTRL+C...');
	process.exit (0);
});

// Catch uncaught exception
process.on ('uncaughtException', function (err) {
  console.dir (err, { depth: null });
  process.exit (1);
});
// INSERT CODE
console.log ('App ready - hit CTRL+C ;)');

preExit.push (function (code) {
  console.log ('Whoa! Exit code %d, cleaning up...', code);
  // i.e. close database
});
