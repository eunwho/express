var title = ['M','version','group','sensor#','MY', 'MP','SH','SL','DH','DL',
             '%V','S.V','B.V','C.T', 'C.V','DB','D.Id','NI','No.S'
    ];
                                                                            

var EndDevice = [2,24,36,2,25,36,18,18];

var TLB = [];
var agn0 = [4,4];
var agn1 = [1,4,4,2,1, 4,4,2,1,1, 4,4,1,4,4, 1,2,2,2,2, 2,2,2,2];
var agn2 = [2,4,2,3,3, 3,3,4,4,4, 4,3,3,3,3, 2,2,4,3,3, 3,3,2,4,2, 3,4,4,3,4, 4,3,3,2,2, 4];
var agn3 = [4,4];
var agn4 = [1,4,4,2,1, 4,4,2,4,1, 4,4,1,4,4, 1,2,2,2,2, 2,2,2,2];
var agn5 = [2,4,2,3,4, 3,3,4,4,4, 4,3,3,3,3, 2,2,4,3,3, 1,3,2,4,2, 3,4,4,3,4, 4,3,3,2,2, 4];
var agn6 = [3,3,3,4,4, 3,2,3,2,3, 2,3,4,4,3, 3,3,4];
var agn7 = [2,3,3,3,4, 4,3,2,3,2, 3,2,3,4,2, 3,3,2];

var TLB = [agn0,agn1,agn2,agn3,agn4,agn5,agn6,agn7];

var fs = require('fs');
var logFile = 'eunwhoData.json';
var content = fs.readFileSync(logFile, 'utf8');
var WSNT = JSON.parse(content);

var tmp = JSON.stringify(WSNT);
//fs.writeFileSync('monitor.txt',O_APPEND,tmp, 'utf8');

var gId = 0;
var dId = 0;

function getDeviceData(gId,dId){                                                                            

	var a = '';
	var sensState = [];

	var msg 	= WSNT[gId][dId].endDevice.rxData;
	var sensNum = WSNT[gId][dId].endDevice.numSens;

	var tmp = msg.split(",");

	// console.log("msg :", tmp);

	if( tmp[0] === 'M'){
		for(var i = 4 ; i < 19 ; i++){
			a = a + tmp[i] + ',';
		}
		a = a + '\n\r';	
		for ( var i = 0; i < sensNum ; i ++){
			sensState[i] = WSNT[gId][dId].sens[i].status;
			a = a + sensState[i] + '\t';
		}
	} else {
		a = 'No Data';	
	}
	
	return a;
}

for( i = 0 ; i < 8 ; i ++){

	var len = TLB[i].length;
	
	for( j = 0; j < len ; j ++ ){ 

		var data = getDeviceData(i,j);
		var sensNum = WSNT[i][j].endDevice.numSens;
		
		console.log(data);
		if( data[0] !='N'){
			if( sensNum != TLB[i][j]) {
				console.log('sens err installed & received;',TLB[i][j],sensNum);
			}
		}	

		fs.appendFile('monitor.txt',tmp, function(err){
			if(err)throw err;
		});
	}
}
