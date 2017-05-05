//--- mongoose setting

var arryEndDevice = [2,24,36,2,25,36,18,18];
var agn0 = [4,4];
var agn1 = [1,4,4,2,1, 4,4,2,4,1, 4,4,1,4,4, 1,2,2,2,2, 2,2,2,2];
var agn2 = [2,4,2,3,3, 3,3,4,4,4, 4,3,3,3,3, 2,2,4,3,3, 3,3,2,4,2, 3,4,4,3,4, 4,3,3,2,2, 4];

var agn3 = [4,4];
var agn4 = [1,4,4,2,1, 4,4,2,4,1, 4,4,1,4,4, 1,2,2,2,2, 2,2,2,2];
var agn5 = [2,4,2,3,3, 3,3,4,4,4, 4,3,3,3,3, 2,2,4,3,3, 3,3,2,4,2, 3,4,4,3,4, 4,3,3,2,2, 4];
var agn6 = [3,3,3,4,4, 3,2,3,2,3, 2,3,4,4,3, 3,3,2];
var agn7 = [3,3,3,4,4, 3,2,3,2,3, 2,3,4,4,3, 3,3,2];

var now = new Date(); 

var arrySensNo = [agn0,agn1,agn2,agn3,agn4,agn5,agn6, agn7]; 

var sensObj = {	enabled: true, sensId: 0, elapsed: now, oldStatus: [1,1,1,1,1], status: [1,1,1,1,1], 
				moving: true, rxData:'0000'};

var sensor = [sensObj,sensObj,sensObj,sensObj];

var mastCtrl = { numSens : 0, rxTime : now, oldRxTime : now, status : 0, rxData :'0000'};

var G0 = [], G1 = [], G2 = [], G3 = [], G4 = [], G5 = [], G6 = [], G7 = [];

var WSNT = [G0,G1,G2,G3,G4,G5,G6,G7];

for ( i = 0 ; i < 8 ; i ++ ){

	var count = arryEndDevice[i]; 
	for ( var j = 0 ; j < count ; j ++){
		WSNT[i].push({
			endDevice : mastCtrl,
			sens : sensor
		});
	}
}

var fs = require('fs');


var now = new Date();
var logfile_name = now.getFullYear() +'_'+ now.getMonth() + "_" + now.getDay() +'.json'

// Check that the file exists locally
if(!fs.existsSync(logfile_name)) {

  	console.log("File not found");

	var test = JSON.stringify(WSNT);
	fs.writeFileSync(logfile_name,test, 'utf8');

} else {
  // Read the file and do anything you want
	var content = fs.readFileSync(logfile_name, 'utf8');
	WSNT = JSON.parse(content);
}


/*
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;
	db.on('error', console.error.bind(console,'connection error:'));
	db.once('open',function(){
	// we're connected
});


var schema = mongoose.Schema({
	data: wsnData
});
var sensTableDB1 = mongoose.model('sensTableDB1',schema);

var mongoData  = new sensTableDB1({data: wsnData});

mongoData.save(function ( err,WSNT){
	if(err) return console.error(err);
	console.log('SAVED WSNT');
});

*/

// Pre-exit scripts

var preExit = [];

// Catch exit
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
  res.sendFile(__dirname + '/app.css');  
});

app.get('/wsnObj',function ( request, response, next) {
	response.send(WSNT);
}); 

io.on('connection',function(socket){

	socket.join('sensornet');

	console.log('Cooool now connected socket.io');
	
	// socket.emit('news',{hello:'world'});
	
	socket.on('CH0',function(from,msg){  // from backstay

		console.log('From CH0 RXD:', msg);
		var tmp1 = msg.split(",");
		var timeNow = new Date();

		try{
			if(( tmp1[0] === 'M' )&&(tmp1[16][0]==='G')){
/*
M, version, group#, sensor#, MY, MP, SH, SL, DH, DL, %V, solar Volt, battery Volt, coreTemp, chip volt, 
	DB,NI, packet ID, number of sensors
Ex) M,717,5,33,C592,0,13A200,412585D0,0,0,D01,4.454,3.626,281,3.30,2B,ES01,1234,2\r\n   
*/
				var rxGroupId = Number(tmp1[16][1]);
				var rxDistId = tmp1[16][2] * 10 + tmp1[16][3]*1 - 1;
				var timeSaved =new Date( WSNT[rxGroupId][rxDistId].endDevice.rxTime);  
				var a_min = (timeNow.getTime() - timeSaved.getTime()) /1000/60;

				console.log( 'elapsed time1 :',a_min); 						

				WSNT[rxGroupId][rxDistId].endDevice.rxPeriod = a_min;	// saved minute
				WSNT[rxGroupId][rxDistId].endDevice.oldRxTime = timeSaved; 
				WSNT[rxGroupId][rxDistId].endDevice.rxTime	  = timeNow;  
				WSNT[rxGroupId][rxDistId].endDevice.rxData = msg;  
				WSNT[rxGroupId][rxDistId].endDevice.numSens = tmp1[18];  

				console.log( 'emit 1');
				console.log(WSNT[rxGroupId][rxDistId].endDevice.rxData);  

				io.to('sensornet').emit('endDevice',WSNT[rxGroupId][rxDistId]);

			}else if(( tmp1[0] === 'L') && (tmp1[12][0] === 'G')){
				// L,2,43,300,620,649,691,722,669,655,281,3.29,CS44,21719,3

				var rxGroupId = Number(tmp1[12][1]);
				var rxDistId = tmp1[12][2] * 10 + tmp1[12][3]*1 -1;
				var rxSensId = tmp1[1]*100 + tmp1[2]*1;
				var rxSensNum = tmp1[14] *1;

				var rxStatus = [0,0,0,0,0];
				for( var i = 0 ; i < 5 ; i++){
					if( tmp1[4+i] < 100) rxStatus[i] = 1;
				}

				var notExistId = true;

				for ( var i = 0 ; i < rxSensNum ; i ++ ){  // must be added coding case not equal table of sensor number

					var sensIdSaved = WSNT[rxGroupId][rxDistId].sens[i].sensId;  

					if( sensIdSaved === rxSensId){

						var notExistId = false;						

						var statusSaved = WSNT[rxGroupId][rxDistId].sens[i].status;
						var savedDate   = new Date(WSNT[rxGroupId][rxDistId].sens[i].elapsed);

						WSNT[rxGroupId][rxDistId].sens[i].rxData = msg;
						WSNT[rxGroupId][rxDistId].sens[i].oldStatus = statusSaved;
						WSNT[rxGroupId][rxDistId].sens[i].status = rxStatus;						

						//     find algorithm
						if( rxStatus !=  statusSaved ){
//--- sens moving 						
							WSNT[rxGroupId][rxDistId].sens[i].elapsed = timeNow;
							WSNT[rxGroupId][rxDistId].sens[i].moving = true;

							var j = 0;
							do{
								if ( WSNT[rxGroupId][rxDistId].sens[j].moving == false) break;				
								j ++;
							} while ( j < rxSensNum );
								
							if( j >= rxSensNum ){
//--- send nomal operation signal
								WSNT[rxGroupId][rxDistId].endDevice.status = 1;
								break;
							}
						} else {
							time = timeNow.getTime();
							savedTime = saveDate.getTime();

							elapsed = (time - savedTime())/1000/60/60;  // change to hour
 							
							if(elapsed > 48 ){ 
//--- sens stalled for 2 days 
								WSNT[rxGroupId][rxDistId].sens[i].moving == false;
								WSNT[rxGroupId][rxDistId].endDevice.status == 2;
								io.to('sensornet').emit('stalled',{x: rxDistId, y:rxGroupId});
							}
						}	
					}
				}  
				
				// first rx sensor data
				if( notExistId == true){
					for ( var i = 0 ; i < rxSensNum ; i ++ ){  
						// must be added coding case not equal 0 for all sensor id.
						var sensIdSaved = WSNT[rxGroupId][rxDistId].sens[i].sensId;
  
						if( sensIdSaved == 0){
							WSNT[rxGroupId][rxDistId].sens[i].sensId = rxSensId;
							WSNT[rxGroupId][rxDistId].sens[i].rxData = msg;
							WSNT[rxGroupId][rxDistId].sens[i].status = rxStatus;
						}
					}						
					WSNT[rxGroupId][rxDistId].endDevice.status = 0;
					io.to('sensornet').emit('received',{x: rxDistId, y:rxGroupId});
				}
			}
		}
		catch(error){
			console.log('try cach error', error.message);
		}
	});		

	socket.on('clickDevice',function(data){
		console.log("click endeDice.rxData: ",WSNT[data.y][data.x].endDevice.rxData);
		console.log("data.x",data.x);
		console.log("data.y",data.y);
		socket.emit('endDevice1',WSNT[data.y][data.x]);
	});	

});
//--- end of codinater data
