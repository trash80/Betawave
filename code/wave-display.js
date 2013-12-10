/*
Some fancy comment.
*/

sketch.default2d();

var shape = 0;
var doubleFreq= 0;

var numberSteps = 16;
var step = 0.001;

var data = new Array(127);
var noiseData = new Array(127);

var lastX;
var lastY;

for(x=0;x<=127;x++) {
    data[x] = 0;
    if(x>63) data[x] = 1;
}
for(x=0;x<=127;x++) {
    noiseData[x] = Math.random();
}

data[0] = numberSteps;

draw();

function draw()
{
    var width = box.rect[2] - box.rect[0];
    var height = box.rect[3] - box.rect[1];
    var aspect = (width/height);
    
    with (sketch) {
        // erase background
        glenable("line_smooth");
        glclearcolor([0,0,0,0]);
        glclear();          

        for(var l=0;l<numberSteps;l++) {
            x = l/numberSteps * 2;
            beginstroke("basic2d");
            strokeparam("order",1);
            strokeparam("color",[1,1,1,.1]);
            strokeparam("scale",0.00001);
            strokepoint(x * aspect - aspect,1);
            strokepoint(x * aspect - aspect,-1);
            endstroke();
        }

        moveto(0,0.5);
        beginstroke("basic2d");
        strokeparam("color",[0.278,0.839,1]);

        for(var phase = 0;phase<1;phase+=step) {
            var index = Math.floor(phase*numberSteps);
            var vol   = data[Math.floor((phase*numberSteps)+64)];
            var drawX = phase * 2;
            var osc   = data[index];
            var freq  = numberSteps;
            if(osc > 7) {
                osc -= 8;
                freq *= 2;
            }
            if(vol < 0) vol = 0;
            if(vol > 1) vol = 1;
            
            var point = ((getShapePoint(osc,phase,freq) * 2) - 1) * 0.8 * vol;
            if(point > 0.9) point = 0.9;
            if(point < - 0.9) point = - 0.9;

            strokepoint(drawX * aspect - aspect,point);
        }
        endstroke();
    }
    refresh();
}

function getShapePoint(s,p,f) {

    switch(s) {
        case 1:
            //Noise
            return noiseData[(Math.floor(p*f*1000)%127)];
        case 2:
            //Sine
            return (Math.sin(p*6.2831852*f + 8) / 2 + 0.5);
        case 3:
            //Tri
            return (1 - Math.abs(((p) * (f) % 1) - 0.5) * 2);
        case 4:
            //Saw
            return (p * f) % 1;
        case 5:
            //Pulse
            return (p * f) % 1 >= 0.5 ? 0 : 1;
        case 6:
            //Pulse
            return (p * f) % 1 >= 0.75 ? 0 : 1;
        case 7:
            //Pulse
            return (p * f) % 1 >= 0.875 ? 0 : 1;
        default:
            return 0.5;
    }
}

function setshape(x)
{
    shape = x;
}

function setdoubefreq(x)
{
    doubleFreq = x;
}

function setgrid(x)
{
    numberSteps = x;
    draw();
}

function bang()
{
    outlet(0, "list", data);
}

function list()
{
    var raw = arrayfromargs(messagename,arguments);
    data = raw;
}

function onclick(x,y,but,cmd,shift,capslock,option,ctrl)
{
    lastX = -1;
    lastY = -1;
    ondrag(x,y,but,cmd,shift,capslock,option,ctrl);
}
onclick.local = 1; //private. could be left public to permit "synthetic" events

function ondrag(x,y,but,cmd,shift,capslock,option,ctrl)
{

    var width = box.rect[2] - box.rect[0];
    var height = box.rect[3] - box.rect[1];
        
    if (x<0) x = 0;
    else if (x>width) x = width;
    if (y<0) y = 0;
    else if (y>height) y = height;
    
    w = sketch.screentoworld(x,y);

    vx = x/width;
    vy = 1- y/height;
    vy = (vy * 2) - 1;
    if(vy < 0) vy = 0;
    setWave(Math.floor(vx * numberSteps), vy);
    draw();
    bang();
}

function setWave(x,y)
{
    if(lastX == -1) lastX = x;

    var startInt = lastX;
    var endInt = x;
    if(x < lastX) {
        startInt = x;
        endInt = lastX;
    }
    for(var i=startInt;i<=endInt;i++) {
        data[i] = shape;
        if(doubleFreq) {
            data[i] += 8;
        }
        data[i + 64] = y;
    }
    lastX = x;
}

function onresize(w,h)
{
    draw();
}
onresize.local = 1; //private
