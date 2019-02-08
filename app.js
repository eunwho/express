// test1
var graphDay = 7;

var Promise = require('promise');
//--- mongoose setting
var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/wsns0');

var db = mongoose.connection;
db.on('error',console.error.bind(console,'mongoose connection error'));
db.once('open',function(){
	console.log('Ok db connected');
});

var wsnSchema = mongoose.Schema({
	wsnData: String,
	date:{type:Date,default:Date.now}
});

var wsnDB1 = mongoose.model('wsnDB1',wsnSchema);

var arryEndDevice = [2,25,36,2,25,36,18,18];

var agn0 = [4,4];
var agn1 = [1,4,4,2,1, 4,4,2,1,1, 4,4,1,4,4, 1,2,2,2,2, 2,2,2,2,2];
var agn2 = [2,4,2,4,3, 3,3,4,4,4, 4,3,3,3,3, 3,2,2,4,3, 3,3,2,4,2, 3,4,4,3,4, 4,3,3,2,2, 4];

var agn3 = [4,4];
var agn4 = [1,4,4,2,1, 4,4,2,1,1, 4,4,1,4,4, 1,2,2,2,2, 2,2,2,2,2];
var agn5 = [2,4,2,3,4, 3,3,4,4,4, 4,3,3,3,3, 2,2,4,3,3, 3,3,2,4,2, 3,4,4,3,4, 4,3,3,2,2, 4];

var agn6 = [3,3,3,4,4, 3,2,3,2,3, 2,3,4,4,3, 3,3,2];
var agn7 = [2,3,3,3,4, 4,3,2,3,2, 3,2,3,4,4, 3,3,2];

var now = new Date(); 
var arrySensNo = [agn0,agn1,agn2,agn3,agn4,agn5,agn6, agn7]; 
var sensObj = {	enabled: true, sensId: 0, elapsed: now, oldStatus: [0,0,0,0,0,0], status: [0,0,0,0,0,0], 
				moving: true, rxData:'0000'};

var sensor = [sensObj,sensObj,sensObj,sensObj];

/* status :
  0 :ckecking
  1 : no checking
  2 : low battery	
*/
var mastCtrl = { numSens : 0, rxTime : now, oldRxTime : now, status : 0, rxData :'0000'};

var G0 = [], G1 = [], G2 = [], G3 = [], G4 = [], G5 = [], G6 = [], G7 = [];

var WSNT = [G0,G1,G2,G3,G4,G5,G6,G7];

for ( var i = 0 ; i < 8 ; i ++ ){
	var count = arryEndDevice[i]; 
	for ( var j = 0 ; j < count ; j ++){
		WSNT[i].push({
			endDevice : mastCtrl,
			sens : sensor
		});
	}
}

// �list of no ckeck master  
var G00 = [1,0];
var G01 = [0,0,0,0,0, 1,1,0,0,1, 1,1,0,0,0,0, 0,0,1,0,0, 1,0,0,1,0];
var G02 = [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0,0, 0,0,0,0,1, 0,0,0,0,0, 0,0,0,0,0, 1,0,0,0,0, 0];

var G03 = [0,1];
var G04 = [0,1,1,0,1, 0,0,0,0,0, 0,0,0,0,0,1, 0,1,1,0,0, 1,0,0,0,0];
var G05 = [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0,0, 1,0,0,0,0, 0,0,0,0,0, 0,0,0,0,1, 0,0,0,0,0, 0];

var G06 = [1,0,1,0,0, 0,0,0,0,0, 0,1,0,0,0,0, 0,0,0];
var G07 = [0,0,0,0,0, 0,1,1,1,0, 0,0,0,0,0,1, 0,0,0];

var WSNT_STATE = [G00,G01,G02,G03,G04,G05,G06,G07];

var fs = require('fs');

var now = new Date();
var preExit = [];
var now = new Date();
var logfile_name = now.getFullYear() +'_'+ now.getMonth() + "_" + now.getDay() +'.json';
var logFile = 'eunwhoData.json';

// Check that the file exists locally
if(!fs.existsSync(logFile)) {

  	console.log("File not found");

	var test = JSON.stringify(WSNT);
	fs.writeFileSync(logFile,test, 'utf8');
	fs.writeFileSync(logfile_name,test, 'utf8');

} else {
  // Read the file and do anything you want
	var content = fs.readFileSync(logFile, 'utf8');
	WSNT = JSON.parse(content);
}

for ( var i = 0 ; i < 8 ; i ++ ){
	var count = arryEndDevice[i]; 
	for ( var j = 0 ; j < count ; j ++){
		var temp = WSNT_STATE[i][j];

		if(temp == 1 ){
			WSNT[i][j].endDevice.status = 3;
			//console.log('GroupID = %d,masterId=%d,status=%s',i,j,WSNT[i][j].endDevice.status);
		};
	}
}

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

// serve
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(7532);

app.get('/',function ( req,res){
	res.sendFile(__dirname +'/monitor.html');
});

app.get('/app.css', function (req, res) {
  res.sendfile(__dirname + '/app.css');  
});

app.get('/wsnObj',function ( request, response, next) {
	response.send(WSNT);
}); 


// L,2,43,300,620,649,691,722,669,655,281,3.29,CS44,21719,3
function sensProc(msg,x,y){
	var tmp1 = msg.split(",");
	var timeNow = new Date();
	var rxSensId = tmp1[1]*100 + tmp1[2]*1;
	var rxCount = tmp1[13] *1;
	var rxSensNum = tmp1[14] *1;
	var rxStatus = [0,0,0,0,0,0];
	var sensNum = arrySensNo[x][y];

	var notExistId = true;

	for ( var si = 0 ; si < sensNum ; si ++ ){  // must be added coding case not equal table of sensor number
		var sensIdSaved = WSNT[x][y].sens[si].sensId;  
		if( sensIdSaved === rxSensId){
			var notExistId = false;						
			var statusSaved = WSNT[x][y].sens[si].status;
			var savedDate   = new Date(WSNT[x][y].sens[si].elapsed);

			WSNT[x][y].sens[si].rxData = msg;
			WSNT[x][y].sens[si].oldStatus = statusSaved;
			WSNT[x][y].sens[si].status = rxStatus;						

			var msgSensSaved = WSNT[x][y].sens[si].rxData;
			var tmp2 = msgSensSaved.split(",");


			for( var k = 0 ; k < 6 ; k++){
				if( tmp1[4+k] < 100){ 
					rxStatus[k] = 1;
				} else if( tmp1[4+k] < (tmp2[4+k]-100)){ 
					rxStatus[k] = 1;
				}
			}
	//     find algorithm
			if( rxStatus ===  statusSaved ){
				time = timeNow.getTime();
				savedTime = saveDate.getTime();
				elapsed = (time - savedTime())/1000/60/60;  // change to hour
 							
				if(elapsed > 48 ){ 
//--- sens stalled for 2 days 
					WSNT[x][y].sens[si].moving == false;
					WSNT[x][y].endDevice.status == 2;
					io.to('sensornet').emit('stalled',{x: y, y:x});
				}
			}else{
//--- sens moving 						

				WSNT[x][y].sens[si].elapsed = timeNow;
				WSNT[x][y].sens[si].moving = true;
				var j = 0;
				do{
					if ( WSNT[x][y].sens[j].moving == false) break;				
					j ++;
				} while ( j < sensNum );
				if( j >= sensNum ){
//--- send nomal operation signal
					WSNT[x][y].endDevice.status = 1;
					break;
				}
				 io.to('sensornet').emit('endDevice',WSNT[x][y]);
				// io.to('sensornet').emit('received',{x: y, y:x});
			}	
		}
	}  
			// first rx sensor data
	if( notExistId == true){
		var temp = rxCount % rxSensNum;
		WSNT[x][y].sens[temp].sensId = rxSensId;
		WSNT[x][y].sens[temp].rxData = msg;
		WSNT[x][y].sens[temp].status = rxStatus;
	}
	io.to('sensornet').emit('received',{x: y, y:x});
}

function sensProc1(msgSens,mastId){
	var msg = 0; // received from zigbee
	mag.Sens = msgSens;
	io.to('sensornet').emit('endDevice',msg);
}	

/*
M, version, group#, sensor#, MY, MP, SH, SL, DH, DL, %V, solar Volt, battery Volt, coreTemp, chip volt, 
	DB,NI, packet ID, number of sensors
Ex) M,717,5,33,C592,0,13A200,412585D0,0,0,D01,4.454,3.626,281,3.30,2B,ES01,1234,2\r\n   
*/
function endDeviceProc(msg,x,y){
	var tmp1 = msg.split(",");
	var timeNow = new Date();
	var timeSaved =new Date( WSNT[x][x].endDevice.rxTime);  
	var a_min = (timeNow.getTime() - timeSaved.getTime()) /1000/60;

	WSNT[x][y].endDevice.rxPeriod = a_min;	// saved minute
	WSNT[x][y].endDevice.oldRxTime = timeSaved; 
	WSNT[x][y].endDevice.rxTime	  = timeNow;  
	WSNT[x][y].endDevice.rxData = msg;  
	WSNT[x][y].endDevice.numSens = tmp1[18];  

	io.to('sensornet').emit('endDevice',WSNT[x][y]);
}

function socketProc(from,msg){
	var tmp1 = msg.split(",");
	var timeNow = new Date();
	try{
		if(( tmp1[0] === 'M' )&&(tmp1[16][0]==='G')){
			var x = Number(tmp1[16][1]);
			var y = tmp1[16][2] * 10 + tmp1[16][3]*1 - 1;

			endDeviceProc(msg,x,y);

		}else if(( tmp1[0] === 'L') && (tmp1[12][0] === 'G')){
			var x = Number(tmp1[12][1]);
			var y = tmp1[12][2] * 10 + tmp1[12][3]*1 -1;

			var mastId = tmp[16];
			sensProc(msg,x,y);
		}
	}
	catch(error){
	}
} 

function checkMsg(masterMsg){

	var wsnData = masterMsg.split(",");
    if( wsnData[0] != 'L' ){    return false;}
//    if ( wsnData[2]< '0' || wsnData[2] > '7'){ return false;}    // 조사할 것 
//    if ( wsnData[14] < '1' || wsnData[14] > '4' ){return false;} // 연구가 필요함

    return true;
}

function checkSensorEqual(wsnData1, wsnData2){
    if(wsnData1[2] != wsnData2[2]){ return false;}
    if(wsnData1[4] != wsnData2[4]){ return false;}
    if(wsnData1[5] === ','){ 
		if(wsnData2[5] ===','){ 
			return true;
		} else { 
			return false;
		}
	} else if(wsnData1[5] != wsnData2[5]){ 
		return false;
	} else {
    	return true;
    } 
}

function getMasterId(groupId,groupMemberId){

	if( groupMemberId < 9 ){ groupMemberId = '0' + ( groupMemberId*1 + 1);
	} else{ groupMemberId = groupMemberId * 1 + 1 ;}	 
	var tmp = 'G'+ groupId + groupMemberId;
	return tmp;
}

function getSensorTable( docs ){

	//var sensorList = [];
	var sensorList = ['xxx','xxx','xxx','xxx'];
	var count = 0;

	var count = 0;
	var tmpSensorId;
	var tmp  = docs[0].wsnData;
	var sensorNumber = (tmp.split(","))[14];

	for ( var key in docs ){

		var masterMsg = docs[key].wsnData;

		if( !checkMsg( masterMsg )){
			
			continue;
		} else {
			tmpSensorId = masterMsg.substr(0,6);
		}
		
		if( sensorNumber === '1'){
			sensorList[0] = tmpSensorId ;
			break;
		}

		if( count === 0 ){
			sensorList[0] = tmpSensorId;
			count ++;
			continue;
		}else if ( count === 1 ){
			if ( checkSensorEqual(sensorList[0],tmpSensorId)) {
				continue;
			}else{
				sensorList[1] = tmpSensorId;
				if( sensorNumber === '2' ) {
					break;
				} else {
					count ++;
					continue;
				}
			}
		}else if ( count === 2 ){
			if ( checkSensorEqual(sensorList[0],tmpSensorId)){
				continue;
			} else if ( checkSensorEqual(sensorList[1],tmpSensorId)){
				continue;
			} else {
				sensorList[2] = tmpSensorId;
				if ( sensorNumber === '3' ){
					break;
				}else{
					count ++;
					continue;
				}
			}		
		} else {
			if ( checkSensorEqual(sensorList[0],tmpSensorId)){
				continue;
			} else if ( checkSensorEqual(sensorList[1],tmpSensorId)){
				continue;
			} else if ( checkSensorEqual(sensorList[2],tmpSensorId)){
				continue;
			} else {
				sensorList[3] = tmpSensorId;
				break;
			}
		}
	}
	return sensorList; 
}

function checkValidSensorData(tmp){
	var temp = tmp.split(",");
	if( temp[0] != 'L' ){ return false;}
	for( var key = 4 ; key < 10 ; key ++ ){
		if( isNaN(temp[key]) ){ return false;}
	}
	return true;
}

io.on('connection',function(socket){

	socket.join('sensornet');

	console.log('Cooool now connected socket.io');

	socket.on('CH0',function(from,msg){	// from back
		io.to('sensornet').emit('rxdmsg',msg);
//		console.log(msg);
		var wsnIn = new wsnDB1({wsnData:msg});
		wsnIn.save(function(err,wsnIn){
			if(err){
				console.log(err);
				return console.error(err);
			}else{
					 console.log('CH0 SAVED :'+msg);
			}
		});

		var tmp1 = msg.split(",");
		if(( tmp1[0] === 'M' )&&(tmp1[16][0]==='G')){
			var x = Number(tmp1[16][1]);
			var y = tmp1[16][2] * 10 + tmp1[16][3]*1 -1;
			//console.log("sensornumber=" + tmp1[16] );
			//console.log("battery volt=" + tmp1[12] );
			//console.log("number of sensors =" + tmp1[18] );

			var status = WSNT[x][y].endDevice.status;
//--- lowbattery proc
			if(tmp1[12] < 3.3) {
				io.to('sensornet').emit('lowbattery',{x: y, y:x});
				if( status != 2 ){
					WSNT[x][y].endDevice.status = 2;
					var test = JSON.stringify(WSNT);
					fs.writeFileSync(logFile,test, 'utf8');
				}
			} else if( status == 2 ){
				console.log('not lowbattery');
				WSNT[x][y].endDevice.status = 1;
				var test = JSON.stringify(WSNT);
				fs.writeFileSync(logFile,test, 'utf8');
			}
		} else if((tmp1[0] ==='L')&&(tmp1[12][0]==='G')){
			var x = Number(tmp1[12][1]);
			var y = tmp1[12][2] * 10 + tmp1[12][3]*1 -1;
			//console.log("sensor=" + tmp1[14] );
 			if(arrySensNo[x][y] != tmp1[14]){
				io.to('sensornet').emit('sensorErr',{x: y, y:x});
			}else {
				io.to('sensornet').emit('normal',{x: y, y:x});
			}
		}
		socketProc(from,msg);
	});


	socket.on('CH1',function(from,msg){	// from boom
		io.to('sensornet').emit('rxdmsg',msg);

		var wsnIn = new wsnDB1({wsnData:msg});
		wsnIn.save(function(err,wsnIn){
			if(err){
				console.log(err);
				return console.error(err);
			}else{
				console.log('CH1 SAVED :'+msg);
			}
		});

		var tmp1 = msg.split(",");
		if(( tmp1[0] === 'M' )&&(tmp1[16][0]==='G')){
			var x = Number(tmp1[16][1]);
			var y = tmp1[16][2] * 10 + tmp1[16][3]*1 -1;
			//console.log("sensornumber=" + tmp1[16] );
			//console.log("battery volt=" + tmp1[12] );
			//console.log("number of sensors =" + tmp1[18] );
			if(tmp1[12]< 3.3) {
				io.to('sensornet').emit('lowbattery',{x: y, y:x});
			}
		} else if((tmp1[0] ==='L')&&(tmp1[12][0]==='G')){
			var x = Number(tmp1[12][1]);
			var y = tmp1[12][2] * 10 + tmp1[12][3]*1 -1;
			//console.log("sensor=" + tmp1[14] );
 			if(arrySensNo[x][y] != tmp1[14]){
				io.to('sensornet').emit('sensorErr',{x: y, y:x});
			}else {
				io.to('sensornet').emit('normal',{x: y, y:x});
			}
		}
		socketProc(from,msg);
	});

	socket.on('clickDevice',function(data){

		//console.log('data.y : ' + data.y +'    data.x : '+ data.x);


		var sensorList = [];
		var masterName = getMasterId(data.y,data.x);
		var graphObj = {
			masterName: masterName,
			sensorId: 'sensorList',
			graphData:[]
		}
		
		if ( data.z ) {

			console.log ('data.k = ',data.k);
			graphDay = (( data.k ) ? 7 : 30 );

			var promise = asyncfunc1(masterName);

			promise
			.then(asyncSetSensorTb)
			.then(asyncSetSensorTb)
			.then(asyncSetSensorTb)
			.then(asyncSetSensorTb)
			.then(function(result){
				var graphData = {masterName:'',sensorList:[],table1:[],table2:[],table3:[],table4:[]};

				graphData.masterName = result.masterName;
				graphData.table1 = result.table[0];
				graphData.table2 = result.table[1];
				graphData.table3 = result.table[2];
				graphData.table4 = result.table[3];
				graphData.sensorList = result.sensorList;
				socket.emit('graphData',graphData);
			})	
			.catch(console.err);
		} else{
			var promise = getMastMsg(masterName);
			var msg = {mast:0,sens:0};
			promise
			.then(function( result){
				msg.mast = result;
				return getSensMsg(masterName);
			})
			.then(function(result){
				msg.sens = result;
				socket.emit('sensData',msg);
			})
			.catch(function(reject){
				console.log(reject);
			});				
		}		
		// socket.emit('graphData',data);
	});	

	socket.on('reqGraph',function(data){

	});	
});

// const lastDays = 7;

var getMastMsg = function ( param ){
   return new Promise(function(resolve, reject){
   wsnDB1.find(
      {$and:[{"date" :{
         $lte:new Date(),
         $gte:new Date(new Date().setDate(new Date().getDate() - graphDay))}},
         {"wsnData":{$regex:param}},
         {"wsnData":{$regex:'M,'}}
      ]},
      {'wsnData':true,_id: false, 'date':true},
      function (err, docs){
         if( err ) {
            reject(err);
         }else{
            try{
               if(docs[0]){
						var tmp1 = 0;
                  for ( var key in docs){
                     if( tmp1 = docs[key] ) break;
                  }
                  resolve(tmp1);
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


var getSensMsg = function( mastId ) {
	return new Promise(function ( resolve,reject ){ 
		wsnDB1.find(
			{$and:[{ "date" : {
				$lte:new Date(),$gte: new Date( new Date().setDate( new Date().getDate()-graphDay))}
				}, {"wsnData":{$regex:'L'}}, {"wsnData":{$regex:mastId}}]},
			{ 'wsnData':true,	_id:false,'date':true},
			function(err,docs){
				if( err ) reject(err);
				else resolve(docs);
			}
		).limit(10).sort({'data':-1});
	});
}


var asyncfunc1 = function( param) {
	return new Promise(function ( resolve,reject ){ 
		wsnDB1.find(
			{$and:
				[{ "date" : {
					$lte:new Date(), 
					$gte: new Date( new Date().setDate( new Date().getDate()-graphDay))}
					},
					{"wsnData":{$regex:'L'}},
					{"wsnData":{$regex:param}}
				]
			},
			{
				'wsnData':true,
				_id:false,'date':true
			},function(err,docs){
			if( err ) {
				reject(err);
			}else {

				var returns = {table: [], sensorId: [], masterName: 'G001', sensorList:[]};
				var tmp1 = '';
				
				try{	
					for ( var key in docs ){
						if( tmp1 = docs[key].wsnData.split(",")){ break;}
					}	
														
					var masterName = tmp1[12];
					var sensorList = getSensorTable( docs);
					var sensorId = getSensorTable( docs);

					returns.sensorList = sensorList;
					returns.sensorId = sensorId;
					returns.masterName = masterName;
					resolve(returns);
				}
				catch(e){
					console.error(e);
					reject(e);
				}
			}}
		).limit(20);
	});
}

// L,2,43,300,620,649,691,722,669,655,281,3.29,CS44,21719,3
function setSensorDataTb(docs){
	var test = [];
	var i = 0;
	try{
		var timeNow = new Date();
		var now = timeNow.getTime();

		var oneDayCount = 24 * 60 * 60 * 1000;
		var oneWeekCount = oneDayCount * graphDay;

		docs.forEach(function (collection){
			var tmp1 = collection.wsnData.split(",");
			var dateCount = ( collection.date*1 - now ) / oneDayCount;
			
			test.push([dateCount]);
			test[i].push( tmp1[4]*1);
			for ( var j = 5 ; j < 10 ; j++){ test[i].push( tmp1[j]*1);}
				i ++;
		});
		for( var key in test[0]){ test[0][key] = 0*1; }
		test[0][0] = 0.0 ; // timeNow.getTime();
		for( var key in test[1]){ test[1][key] = 1000*1; }
		// test[1][0] = -7.0;
		test[1][0] = -graphDay;
	}
	catch(e){
		console.log(e.message);
	}
	finally{
		return test;
	}
}	

//console.log(test);

var asyncSetSensorTb = function ( param ){

	return new Promise(function(resolve, reject){		
	
	//console.log('param : '); console.log(param);

	var masterName = param.masterName;
	var tmp = param.sensorId;
	//console.log('sensorId_tmp : ' + tmp);

	var sensorId = tmp.pop();
	//console.log('sensorId : ' + sensorId);

	wsnDB1.find(
		{$and:[{ 
			"date" :{ 
				$lte:new Date(), 
				$gte: new Date( new Date().setDate( new Date().getDate()-graphDay))}
			},{"wsnData":{$regex:masterName}},
			{"wsnData":{$regex:sensorId}}
		]},
		{'wsnData':true,_id:false,'date':true},
		function ( err, docs){
			if( err ) {
				reject(err);
			}else{
				var test = setSensorDataTb(docs);
				(param.table).push(test);
				param.sensorId = tmp;
				resolve(param);
			}
		}
//	).limit(5);	
	);	
	}); // return promise 	
}
//--- end of codinater data
