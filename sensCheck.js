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
/*
db.once('open',function(){
	console.log('Ok db connected');
});
*/
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

var fs = require('fs');


var now = new Date();
// Pre-exit scripts
var preExit = [];
// Catch exit

var fileName = 'sensCheck.txt';

db.once('open', function(){
	console.log('OK db connected');

	var promise = setCheckSensNet();

	promise
	.then(function(result){
		console.log('----------------------------------');
		console.log('		promise then');
		var testIn = JSON.stringify(result);

		var testOut = testIn.replace(/],/g,']\r\n');
		//var testOut = testIn.replace(///g,'');
		//var testOut2 = testOut1.replace(,'');
		fs.writeFileSync(fileName,testOut, 'utf8');	
	})
	.catch(function(){
		console.log('promise catch');
		console.err
	});
});

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

	var test = JSON.stringify(WSNT);
	fs.writeFileSync(logfile_name,test, 'utf8');
	fs.writeFileSync(logFile,test, 'utf8');

	process.exit (0);
});

// Catch uncaught exception
process.on ('uncaughtException', function (err) {
  console.dir (err, { depth: null });
  process.exit (1);
});
// INSERT CODE
console.log ('App ready - hit CTRL+C ;)');

// Add pre-exit script
preExit.push (function (code) {
  console.log ('Whoa! Exit code %d, cleaning up...', code);
  // i.e. close database
});


var mastStat = {rxdSignal:NO,solarVolt:0,battVolt:0,chipVolt:0,sensNumb:0};

function setMastStat(param,returns){

}
const lastDays = 7;

var getMastStat = function ( param ){

	return new Promise(function(resolve, reject){

	console.log('param : ',param);

	wsnDB1.find(
		{$and:[{
			"date" :{
			$lte:new Date(),
			$gte:new Date(new Date().setDate(new Date().getDate() - lastDays))}
		},{"wsnData":{$regex:param}},
		{"wsnData":{$regex:'M,'}}
		]},
		{'wsnData':true,_id: false, 'date':true},
		function (err, docs){
			if( err ) {
				reject(err);
			}else{
				try{
					console.log(docs);

					if(docs[0]){
						var returns = {btv:0,sens:0,D:0,Id:0,SV:0,BV:0,CV:0,SN:0};

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
						returns.SN = tmp1[18][0];
			
						if(returns.BT < 3.5 )
							returns.btv = 'battery low';
						else returns.btv ='OK';

						if(returns.SN != saveNo ){
							returns.sens = 'Sens not equal';
							returns.SN = tmp1[18][0] + '[' + saveNo +']';
						}else returns.sens = 'OK';
						console.log(returns);
						
						
						var group = param[1];
						var mastId = param[2]*10 + param[3] * 1;
						MAST_STAT[group][mastId-1].push(JSON.stringify(returns));
						resolve(returns);
					}else{
						console.log('No DB data');
						resolve([]);
					}
				}
				catch(e){
					console.error(e);
					reject(e);
				}
			}}
		).limit(5).sort({'date':-1});
	});
}

function setCheckSensNet(){

	return new Promise(function(resolve,reject){

		var sequence = Promise.resolve();
		var qroupNum = 0;

		for( i = 0 ; i < MAST_STAT.length; i++){
			for( var j = 0; j < MAST_STAT[i].length ; j ++){
				(function(){
					var index = j;
					var mastId = 'G'+i;

					if( (index+1) < 10) mastId += '0'+(index+1);
					else mastId += index+1;
	
					sequence = sequence.then(function(){
						return getMastStat(mastId);
					}).then(function(index){
						console.log(mastId + 'Runing OK');
						if(mastId == 'G718') resolve(MAST_STAT);
					}).catch(function(err){
						console.log(mastId + 'xxx Error');
						reject('ERROR');
					})
				}())
			}
		}
	});
}




function setCheckSensNet_bk(){

	return new Promise(function(resolve,reject){

		var sequence = Promise.resolve();
		var qroupNum = 0;

			for( var j = 0; j < MAST_STAT[0].length ; j ++){
				(function(){
					var index = j;
					var id = j+1;
					var mastId = 'G'+0;

					if( id < 10) mastId += '0'+ id;
					else mastId += id;
	
					sequence = sequence.then(function(){
						return getMastStat(mastId);
					}).then(function(index){
						console.log(mastId + 'Runing OK');
						if(mastId == 'G001') resolve(MAST_STAT);
					}).catch(function(err){
						console.log(mastId + 'xxx Error');
						reject('FAIL');
					})
				}())
		}		
	});
}

