// var socket = io.connect('http://192.168.110.10:7532'); // for Hydai 
// var socket = io.connect('http://192.168.0.10:7532');   // for eunwho P.E.
var socket = io.connect('http://192.168.0.205:7532');   // for eunwho test.
//------------------------------------------------------------
const GRAPH_MAX_COUNT= 1440; // 1 hour count

var oscope = (function() {
  var m_canvas;
  var m_context;
  var m_width = 1280;
  var m_height = 400;
  var m_h2;
  var m_voffset = [];
  // these must match the initial values of the controls
  // doh! no two way data bindind
  var mSecPerDiv		  		 = 0.100;
  var m_samples_per_second = 1280;
  var m_divisions          = 10;
  var m_yscale             = 512;
  var m_sample_bits        = 10;
  var m_volts_per_div      = 5;
  var m_vrange             = 5;
  var m_run                = true;
  var m_size_index         = 0;
  var m_text_size          = 12;
  var m_updates            = 0;

  m_voffset[0]         = 0;
  m_voffset[1]         = 0;
  m_voffset[2]         = 0;
  m_voffset[3]         = 0;

  // ==============================================================
  // background display scaffolding
  // ==============================================================
  var outline_base = [
    [0.0,0.0],
    [1.0,0.0],
    [1.0,1.0],
    [0.0,1.0],
    [0.0,0.0]
  ];
  var outline;

  var xaxis_base = [
    [0.0,5.0/10.0,1.0,5.0/10.0], // channel 1
    [0.0,5.0/10.0,1.0,5.0/10.0]  // channel 2
  ];

  var xaxis;

  var vdiv_base  =  1.0/10.0;
  var vdiv;

  var mid_div_base = [
    0.0,5.0/10.0,1.0,5.0/10.0
  ];
  var mid_div = [0,0,0,0];

  var hgrid_base = [
    [0.0,1.0/8.0,1.0,1.0/8.0],
    [0.0,2.0/8.0,1.0,2.0/8.0],
    [0.0,3.0/8.0,1.0,3.0/8.0],
    [0.0,4.0/8.0,1.0,4.0/8.0],
    [0.0,5.0/8.0,1.0,5.0/8.0],
    [0.0,6.0/8.0,1.0,6.0/8.0],
    [0.0,7.0/8.0,1.0,7.0/8.0]
  ];var hgrid;

  var vgrid_base = [
    [ 1.0/12.0,0.0, 1.0/12.0,1.0],
    [ 2.0/12.0,0.0, 2.0/12.0,1.0],
    [ 3.0/12.0,0.0, 3.0/12.0,1.0],
    [ 4.0/12.0,0.0, 4.0/12.0,1.0],
    [ 5.0/12.0,0.0, 5.0/12.0,1.0],
    [ 6.0/12.0,0.0, 6.0/12.0,1.0],
    [ 7.0/12.0,0.0, 7.0/12.0,1.0],
    [ 8.0/12.0,0.0, 8.0/12.0,1.0],
    [ 9.0/12.0,0.0, 9.0/12.0,1.0],
    [10.0/12.0,0.0,10.0/12.0,1.0],
    [11.0/12.0,0.0,11.0/12.0,1.0]
  ];
  var vgrid;

  var text_size = [ 12, 8, 6 ];

  function rescale(w,h) {
    // rescale horizontal divisions
    hgrid = hgrid_base.map(function (v) {
      var d = new Array(4);
      d[0] = v[0] * w;
      d[1] = v[1] * h;
      d[2] = v[2] * w;
      d[3] = v[3] * h;
      return d;
    });


    // rescale vertical division size
    vdiv = vdiv_base * h;

    // rescale vertical divisions
    vgrid = vgrid_base.map(function(v) {
      var d = new Array(4);
      d[0] = v[0] * w;
      d[1] = v[1] * h;
      d[2] = v[2] * w;
      d[3] = v[3] * h;
      return d;
    });

		// 2018.03. delete by jsk
    // scale channel axes
    xaxis = xaxis_base.map(function(v) {
      var d = new Array(4);
      d[0] = v[0] * w;
      d[1] = v[1] * h;
      d[2] = v[2] * w;
      d[3] = v[3] * h;
      return d;
    });

    // rescale outline
    outline = outline_base.map(function(v) {
      var d = [0,0];
      d[0] = v[0] * w;
      d[1] = v[1] * h;
      return d;
    });

    mid_div[0] = mid_div_base[0] * w;
    mid_div[1] = mid_div_base[1] * h;
    mid_div[2] = mid_div_base[2] * w;
    mid_div[3] = mid_div_base[3] * h;
  }

  function clear(ctx,width,height) {
    ctx.fillStyle = "white";
    ctx.fillRect(0,0,width,height);
  }

  function drawLine(ctx,line)  {
      ctx.beginPath();
      ctx.moveTo(line[0],line[1]);
      ctx.lineTo(line[2],line[3]);
      ctx.stroke();
  }

  function drawLines(ctx,lines) {
    lines.forEach(function(v) {
      drawLine(ctx,v);
    });
  }

  function drawPath(ctx,path) {
    ctx.beginPath();
    ctx.moveTo(path[0][0],path[0][1]);
    path.slice(1).forEach(function(v) {
      ctx.lineTo(v[0],v[1]);
    });
    ctx.stroke();
  }

  function drawBackground(ctx,width,height,voffset) {
    // clear background
    clear(ctx,width,height);

    // draw geometry with cartesian coordinates (0,0) lower left
    ctx.save();
    ctx.translate(0,height);
    ctx.scale(1.0,-1.0);

    // draw the outline
//    ctx.save();
    ctx.strokeStyle = 'darkgray';
    ctx.lineWidth   = 6;
    drawPath(ctx,outline);
    ctx.restore();

    // draw the grid
    ctx.save();
    ctx.strokeStyle = "rgba(0,0,0,1.0)";
    ctx.lineWidth   = 1;
    ctx.setLineDash([1,1]);
    drawLines(ctx,hgrid);
    drawLines(ctx,vgrid);
    ctx.restore();

	 var hardLine1 = [0.0, 100, 1280, 100];
	 var hardLine2 = [0.0, 200, 1280, 200];
	 var hardLine3 = [0.0, 300, 1280, 300];
 
    ctx.save();
    ctx.strokeStyle = "rgba(0,0,0,1.0)";
    ctx.lineWidth   = 3;
    drawLine(ctx,hardLine1);
    drawLine(ctx,hardLine2);
    drawLine(ctx,hardLine3);
    ctx.restore();

  }

  function drawAnnotations(ctx,width,height,dy)
  {

	const T_SITE=10;
	const V_SITE=880;
	const P_SITE=800;

    var t;
    var y;
	var delta = 40;
	var dy_offset = 20;


    ctx.font = dy.toFixed(0) + "px monospace";

    y = dy_offset;
	ctx.textAlign="right"; 
    ctx.fillStyle = "green";
    ctx.fillText('10kg/cm*2	'  , P_SITE,y);
    y += delta;
    ctx.fillText('7.5', P_SITE,y);
    y += delta;
    ctx.fillText('5.0', P_SITE,y);
    y += delta;
    ctx.fillText('2.5', P_SITE,y);
    y += delta;
    ctx.fillText('0.0', P_SITE,y);
    y += 12;
    ctx.fillText('압력', P_SITE,y);


    y = dy_offset;
    ctx.fillStyle = "blue";

    ctx.fillText('   0',V_SITE,y);
    y += delta;
    ctx.fillText('- 25',V_SITE,y);
    y += delta;
    ctx.fillText('- 50',V_SITE,y);
    y += delta;
    ctx.fillText('- 75',V_SITE,y);
    y += delta;
    ctx.fillText('-100',V_SITE,y);
    y += 12;
    ctx.fillText('진공',V_SITE,y);

    y = dy_offset;

	ctx.textAlign="left"; 
    ctx.fillStyle = "black";
    ctx.fillText('3시간화면',T_SITE+70,y);

    ctx.fillStyle = "red";
    ctx.fillText('200C',T_SITE,y);
    y += delta;
    ctx.fillText('150C',T_SITE,y);
    y += delta;
    ctx.fillText('100C',T_SITE,y);
    y += delta;
    ctx.fillText(' 50C',T_SITE,y);
    y += delta;
    ctx.fillText('  0C',T_SITE,y);
    y += 12;
    ctx.fillText('온도',T_SITE,y);

    ctx.lineWidth   = 4;
    t = (m_run) ? ("RUN : " + m_updates.toFixed(0)) : "STOP";
    ctx.fillStyle = (m_run) ? 'lime' : 'red';
    ctx.fillText(t,2,height-4);
  }

  function computeVerticalScale ( height , yscale){ 
	 //divide by 2 to make scale for signed value
    return height / yscale ;
  }

  function computeHorizontalScale(seconds,samples_per_second,width) {
    return width / (seconds * samples_per_second);
  }

  function onPaint(trace) {
    drawBackground(m_context,m_width,m_height,m_voffset);
//    drawAnnotations(m_context,m_width,m_height,m_text_size);
//	 writeLegend(); 
  }

  function onVerticalOffset(channel,offset)
  {
    if ((offset < -4)||(4 < offset)) {
      return;
    }
    m_voffset[channel-1] = offset * vdiv;
    onPaint(null);
  }

  function onVoltsPerDiv(volts) {
    m_volts_per_div = volts;

    updateCursorDiff();
    onPaint(null);
  }

  function onSecondsPerDiv(seconds) {
    mSecPerDiv = seconds;

    updateCursorDiff();
    onPaint(null);
  }

  /**
   * event handler for samples per second
   * @param samples_per_second
   */
  function onSamplesPerSecond(samples_per_second) {
    // no zero or negative
    if (samples_per_second < Number.MIN_VALUE) {
      m_samples_per_second = 1000;
    }
    else {
      // rate is in samples/second
      m_samples_per_second = samples_per_second;
    }
    onPaint(null);0.
  }

  /**
   * set voltage range (maximum volts per sample)
   * @param vrange
   */
  function onVoltageRange(vrange) {
    m_vrange = vrange;
    onPaint(null);
  }

  function onResize() {
    var parent = $("#oscope-parent");

    m_text_size = 12;

    m_canvas = $("#oscope")[0];

    m_canvas.width  = m_width;
    m_canvas.height = m_height;

    m_h2     = m_height / 2;
    rescale(m_width,m_height);
    onPaint(null);
  }

  function onInit() {
    m_canvas  = $("#oscope")[0];
    m_context = m_canvas.getContext("2d");
    // attach resize event
    $(window).resize(onResize);
    onResize();
    onPaint(null);
  }

	function drawDot(gCount, chData){
		try{
			var hs = 0.888;
			var ctx = m_context;
			var i;

			var tempOffset = [ 25, 1.25, 112.5, 112.5, 112.5, 112.5, 112.5, 112.5]; 
   		var ys = [ 200/250, 200/12.5, 200/125, 200/125, 200/125, 200/125, 200/125, 200/125];
   		var fStyle=["red","green","aquamarine","black","blue","cyan","darkgray","aqua"];

			for(i = 1; i < 8 ; i ++){
	      	ctx.fillStyle = fStyle[i];
   	   	ctx.fillRect( gCount * hs, 200 - ( chData[i] * 1.0 + tempOffset[i]) * ys[i],2,2);    
			}
		} catch ( err ){
			alert("err oscope.drawDot()");
		}
	}

  function writeTime(start, end){
		try{
      	m_context.textAlign="left"; 
      	m_context.fillStyle = "white";
  	   	m_context.fillRect( 150,10,300,10);    
      	m_context.fillStyle = "black";
      	m_context.fillText(start,150,20);
      	m_context.textAlign="right"; 
      	m_context.fillStyle = "white";
  	   	m_context.fillRect( 450,10,300,10);    
       	m_context.fillStyle = "black";
	     	m_context.fillText(end,690,20);
		} catch(err){
			alert("err oscope.writeTime()");
		}
   }

   function writeLegend( ){
		try{
		const Y_OFFSET = 195;
      const DELTA_X = 70;
      var x = 180;

      m_context.textAlign="left"; 

      m_context.fillStyle = "red";      
      m_context.fillText('sens1',x,Y_OFFSET);
      
      x = x+ DELTA_X;
      m_context.fillStyle = "green";    
      m_context.fillText('sens2',x,Y_OFFSET);
      
      x = x+ DELTA_X;
      m_context.fillStyle = "aquamarine";    
      m_context.fillText('sens3',x,Y_OFFSET);
      
      x = x+ DELTA_X;
      m_context.fillStyle = "black";      
      m_context.fillText('sens4',x,Y_OFFSET);
		} catch(err){
			alert("err oscope.writeLegend()");
		}	
   }

	function drawTest( ){
		try{
			var hs = 1440 / GRAPH_MAX_COUNT;
			var ctx = m_context;
			var i;

			var tempOffset = [ 100, 200, 300, 400]; 
   		var ys = 0.1;
   		var fStyle=["red","green","aquamarine","black","blue","cyan","darkgray","aqua"];

      	ctx.fillStyle = fStyle[1];
  	   	ctx.fillRect( 700, 200,10,10);    
		} catch ( err ){
			alert("err oscope.drawDot()");
		}
	}

	function drawDot(gCount, chData){
		try{
			var hs = 1440 / GRAPH_MAX_COUNT;
			var ctx = m_context;
			var i;

			var tempOffset = [ 100, 200, 300, 400]; 
   		var ys = 0.1;
   		var fStyle=["red","green","aquamarine","black","blue","cyan","darkgray","aqua"];

			for(i = 0; i < 5 ; i ++){
	      	ctx.fillStyle = fStyle[i];
   	   	ctx.fillRect( gCount * hs, 200 - ( chData[i] * 1.0 + tempOffset[j]) * ys,10,10);    
			}
		} catch ( err ){
			alert("err oscope.drawDot()");
		}
	}

	function drawSens(channel, chData){
		try{
			var hs = 0.888;
			// var hs = 1440 / GRAPH_MAX_COUNT;
			var ctx = m_context;
			var i;

			var tempOffset = [ 100, 200, 300, 400]; 
   		var ys = 1;
   		var fStyle=["white","red","green","yellow","black","brown"];

			chData.forEach(function(v){
				for(i = 1; i < 6 ; i ++){
		      	ctx.fillStyle = fStyle[i];
   		   	//ctx.fillRect( v[0] * hs, 400 - ( v[i] * 1.0 + tempOffset[0]) * ys,5,5);    
   		   	ctx.fillRect( v[0] * hs ,100+ 100 * (channel+1) - (i * 2) - v[i] * 0.25, 5, 5);    
				}
			});
		} catch ( err ){
			// alert("err oscope.drawDot()");
			console.log(err);

		}
	}

	function drawGraph( ){

		drawSens(0,graphData1);
		drawSens(1,graphData2);
		drawSens(2,graphData3);
		drawSens(3,graphData4);
	}

  return {
    init               : onInit,
    onResize           : onResize,
    onPaint            : onPaint,
    onVoltsPerDiv      : onVoltsPerDiv,
    onSecondsPerDiv    : onSecondsPerDiv,
    onSamplesPerSecond : onSamplesPerSecond,
    onVoltageRange     : onVoltageRange,
	 drawDot				  : drawDot,
	 drawTest			  : drawTest,
	 drawSens			  : drawSens,
	 drawGraph			  : drawGraph,
	 writeTime			  : writeTime
  };
})();

const dataLength = 1440;
var traceCount = 0;

var traceData0 = { channel:0,length:dataLength,sample:[dataLength]};
var traceData1 = { channel:1,length:dataLength,sample:[dataLength]};
var traceData2 = { channel:2,length:dataLength,sample:[dataLength]};
var traceData3 = { channel:3,length:dataLength,sample:[dataLength]};

var trace =[traceData0,traceData1,traceData2,traceData3];


var textArea =[];
var count1 = 0;
var count2 = 0;
var msgCount = 0;

var graphData1 = [];
var graphData2 = [];
var graphData3 = [];
var graphData4 = [];

var scatGraphTitle=['','','',''];
var graphData = [];

for( var i = 0 ; i < 1440; i++){
   graphData1.push([i]);
   for( var j = 0 ; j < 6 ; j++) graphData1[i].push(700*1);
}

graphData1[0][1] = 0;   
graphData1[0][2] = 1000;

for( var i = 0 ; i < 1440; i++){
   graphData2.push([i]);
   for( var j = 0 ; j < 6 ; j++) graphData2[i].push(700*1);
}

graphData2[0][1] = 0;   
graphData2[0][2] = 1000;

for( var i = 0 ; i < 1440; i++){
   graphData3.push([i]);
   for( var j = 0 ; j < 6 ; j++) graphData3[i].push(700*1);
}

graphData3[0][1] = 0;   
graphData3[0][2] = 1000;

for( var i = 0 ; i < 1440; i++){
   graphData4.push([i]);
   for( var j = 0 ; j < 6 ; j++) graphData4[i].push(700*1);
}

graphData4[0][1] = 0;   
graphData4[0][2] = 1000;

function drawStuff( ) {
};


function tableCreate( ){
   var title = ['M','version','group','sensor#','MY', 'MP','SH','SL','DH','DL',
            '%V','S.V','B.V','C.T', 'C.V', 
            'DB','D.Id','NI','No.S','Rx Time'];

   var tableWidth = ['60','60','60','60','40','40','30','60','40','40','30','60','60','60','30','130'];
   var x = document.createElement('TABLE');
   x.setAttribute("id","tblData2");
   var tbl = document.getElementById('table2').appendChild(x);
   var tr = tbl.insertRow();
   for( var i = 0; i < 16 ; i ++){
      var td = tr.insertCell();
      td.appendChild(document.createTextNode(title[i+4]));
      td.style.border = '1px solid black';
      td.setAttribute('width',tableWidth[i]);
      td.setAttribute('align','center');        
   }

   for(var j = 0 ; j < 5 ; j++){

      var tr = tbl.insertRow();  
      for( var i = 0; i < 16 ; i ++){
            var td = tr.insertCell();
         td.appendChild(document.createTextNode(['000']));
         td.style.border = '1px solid black';
         td.setAttribute('align','center');        
      }
   }
}

function changeContent(id, targRow, cell, content) {

   var rowIn = targRow;

   console.log('row = ',targRow);
   rowIn = ( rowIn > 4 ) ? 1 : rowIn -1 ;

   var a = document.getElementById(id).rows[rowIn].cells;
   a[cell].setAttribute('bgColor','white');

   var x = document.getElementById(id).rows[targRow].cells;
   x[cell].innerHTML = content;
   x[cell].setAttribute('bgColor','yellow');
}

function writeTable(msg, row, no){

   var val ='---';
   var tmp = msg.split(',');
   for(var i = 4 ; i < 19 ; i++){
      if( tmp[0] === 'M')  val = tmp[i] ;
      ( no == 2 ) ? changeContent('tblData2',row,i-4,val) : changeContent('tblData3',row,i-4,val);
   }
   
   var d = new Date();
   var weekday = new Array(7);

   weekday[0]= "Sun"; weekday[1]= "Mon"; weekday[2]= "Tue"; weekday[3]= "Wed";
   weekday[4]= "Thu"; weekday[5]= "Fri"; weekday[6]= "Sat";

   var n = weekday[d.getDay()];  var h = d.getHours();   var m = d.getMinutes();
   val = n + ' : ' + h + ' : ' + m ;

   ( no == 2) ? changeContent('tblData2',row,15,val):changeContent('tblData3',row,15,val);
}   
for ( var i = 0 ; i < 20 ; i ++) textArea.push(' \n');

var signalToggle = true;

socket.on('stalled',function( data ) {
   var $target = $('div[data-x = ' + data.x + '][data-y = ' + data.y + ']');
   $target.removeClass('init moving').addClass('stalled');
   console.log("reserve return");
});
socket.on('moved',function( data ) {
   var $target = $('div[data-x = ' + data.x + '][data-y = ' + data.y + ']');
   $target.removeClass('init stalled').addClass('moved');
});
socket.on('lowbattery',function( data ) {
   var $target = $('div[data-x = ' + data.x + '][data-y = ' + data.y + ']');
   $target.removeClass('init stalled').addClass('lowbattery');
});
socket.on('sensorErr',function( data ) {
   var $target = $('div[data-x = ' + data.x + '][data-y = ' + data.y + ']');
   $target.removeClass('init stalled').addClass('sensorErr');
});
socket.on('normal',function( data ) {
   var $target = $('div[data-x = ' + data.x + '][data-y = ' + data.y + ']');
   $target.removeClass('init stalled').addClass('signalOn1');
});

socket.on('rxdmsg',function(msg){
   var k = msgCount;
   textArea[msgCount] = msg;
   msgCount = ( msgCount > 18 ? 0: msgCount+1);

   var textA ='';
   for( var j = 0 ; j < 19 ; j ++){
      textA += textArea[k] ;
      k = ( k > 1 ? k-1: 19);
   }
   var temp = textA.replace(/\r\n?/gm,'<br />');
   document.getElementById('rxdMsg').innerHTML = temp;
});

socket.on('endDevice',function( data ) {

   count1 = ( (count1 < 5 ) ? count1 + 1 : 1); 

   writeTable(data.endDevice.rxData,count1,2);
   var count = data.endDevice.numSens;
});

socket.on('sensData',function(msg){       

   msgCount = 0;
   var mastMsg = msg.mast.wsnData;

   for( var j = 0 ; j < 19 ; j ++) textArea[j] = '';

   count1 = ( (count1 < 5) ? count1 + 1 : 1); 
   console.log(mastMsg);
   writeTable(mastMsg,count1,2);

   var textA ='';
   textA += msg.mast.date + ' : ' + msg.mast.wsnData;

   sensData = msg.sens;
   for( var key in sensData ){
      textA += sensData[key].date + '  ::  ' + sensData[key].wsnData;            
   }     
   var temp = textA.replace(/\r\n?/gm,'<br />');
   document.getElementById('rxdMsg').innerHTML = temp;
});


socket.on('received',function( data ) {
   var $target = $('div[data-x = ' + data.x + '][data-y = ' + data.y + ']');
   console.log('received');

   if( signalToggle == true){
      signalToggle = false;
      $target.removeClass('init stalled moved signalOn1').addClass('signalOn2');
   } else{
      signalToggle = true;
      $target.removeClass('init stalled moved signalOn2').addClass('signalOn1');
   }
   console.log("received On");
});



function setScatGraphTitle(x,y){
   var a = '';
   if       (y < 3 ) a = 'Boom Port Side Group '+ (y*1+1);
   else if  (y < 6 ) a = 'Boom Star Board Side Group ' + (y*1 +1);
   else if  ( y == 6 ) a = 'Backstay Port Side ';
   else if  ( y == 7 ) a = 'Backstay Start Board Side ';
   else              a = ' Error';

   a = a+ ' #' + x;
   return a;
}

$(document).ready(function() {
   // define variable
	var onClickSeat = function () {
	var x = $(this).attr('data-x');
	var y = $(this).attr('data-y');
	var z = document.getElementById('radio_1').checked;
	var k = document.getElementById('graph_1').checked;
    socket.emit('clickDevice',{   x: x, y: y,z: z, k : k });
	};

	$.getJSON('/wsnObj', { dummy: new Date().getTime() }, function(wsnObj){
   	// console.log('wnsObj',wsnObj);
      // Creat endDevice Sheet
       $.each(wsnObj, function (groupId, endDeviceGroup ) {
               // Create Document object
			var $line = $('<div></div>').addClass('line');
         $.each(endDeviceGroup, function( deviceId, sensCtrl ){
            // Create Document Object and ADD to var $line
				var $output = $('<div></div>',{	'class':'seat',	'data-x': deviceId,'data-y': groupId }).appendTo($line);
				$output.on('click',onClickSeat);

            var status = sensCtrl.endDevice.status;
            if( status == 0 ){         
            	$output.removeClass("moved stalled").addClass('init'); 
            }else if( status == 1 ) {  
            	$output.removeClass("init stalled").addClass('init'); 
               $output.addClass('moved'); 
            }else if( status == 2 ) {
            	$output.removeClass("init moved").addClass('stalled'); 
            } else {
            	$output.removeClass("moved stalled").addClass('init'); 
            }  
        });
               // Add Document Object
        	$line.appendTo('section');
      });
   });

   tableCreate();
	
	if (oscope) {
   	oscope.init();
  	}

 	oscope.drawGraph();
 	// oscope.drawSens(graphData1);
 	//oscope.drawTest();
});

function startTime() {
   var today = new Date();
   var h = today.getHours();
   var m = today.getMinutes();
   var s = today.getSeconds();
   
   m = checkTime(m);
   s = checkTime(s);
   document.getElementById('dispTime').innerHTML = Date();
   h + ":" + m + ":" + s;
   var t = setTimeout(startTime, 30000 );
}

function checkTime(i) {
   if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
   return i;
}

function drawGraph(){
   socket.emit('reqGraph',{
      x: 'L,4,3',
      y: 'G718'
   });
}

/*
socket.on('graphData',function( docs ) {
   console.log(docs);
   graphData1 = docs.table4;
   graphData2 = docs.table3;
   graphData3 = docs.table2;
   graphData4 = docs.table1;
   var name = docs.masterName;
   for(var key in docs.sensorList){ 
      var y = name[1]*1;
      var x = name.substr(2,2)*1;
      scatGraphTitle[key] = setScatGraphTitle(x,y)+ docs.sensorList[key];
   }
   drawStuff();
});
*/

socket.on('graphData',function( docs ) {

/*
	traceData0.sample = doc.table4;
	traceData1.sample = doc.table3;
	traceData2.sample = doc.table2;
	traceData3.sample = doc.table1;

 	oscope.onPaint(trace);
   // drawStuff();
*/
});
