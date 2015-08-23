function drawCircle(cX, cY, radius, fill) {
    context.beginPath();
    context.arc(scaleX(cX), scaleY(cY), radius, 0, 2 * Math.PI, false);
    context.fillStyle = fill;
    context.fill();
}

function drawLine(x1, y1, x2, y2, color) {
    context.beginPath();
    context.moveTo(scaleX(x1), scaleY(y1));
    context.lineTo(scaleX(x2), scaleY(y2));
    context.strokeStyle = color;
    context.stroke();
}

function scaleY(y) {
    return height/2 - height*y/(2*(amp+ell));
}

function scaleX(x) {
    return scaleY(x);
}

/* polyfill by Erik Möller */
(function() {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame =
          window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

var canvas = document.getElementById("demo");
var context = canvas.getContext("2d");
var width;
var height;
var start = null;

function viewport() {
    var e = window, a = 'inner';
    if (!('innerWidth' in window )) {
        a = 'client';
        e = document.documentElement || document.body;
    }
    return { width : e[ a+'Width' ] , height : e[ a+'Height' ] };
}

function resizeCanvas() {
    var size = Math.min(viewport().width, viewport().height);
    width = (canvas.width = size);
    height = (canvas.height = size);
}
resizeCanvas();

var resizeTimer = false;
function resize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeCanvas, 200);
}


function draw(timestamp) {
    requestAnimationFrame(draw);
    if (!start) start = timestamp;
    var t = ((timestamp - start)/msInS) % tjmax;
    var theta = solution.at(t)[0];
    var support = amp * Math.cos(omega * t);
    context.clearRect(0, 0, width, height);
    drawLine(0, -amp-ell, 0, amp+ell, 'grey');
    drawLine(amp+ell, 0, -amp-ell, 0, 'grey');

    drawLine(0, support, -ell * Math.sin(theta), support + ell * Math.cos(theta), 'blue');
    drawCircle(0, support, 10, 'grey');
    drawCircle(-ell * Math.sin(theta), support + ell * Math.cos(theta), 5, 'blue');
}

var omega;
var amp;
var ell;
var r0;
var v0;
var msInS;
var tjmax;
var g = 9.81;
var solution;

function init(freq, amplitude, length, disp, velo, tmax, ms) {
    omega = freq;
    amp = amplitude;
    ell = length;
    r0 = disp;
    v0 = velo;
    tjmax = tmax;
    msInS = 1000/ms;
    solution = numeric.dopri(0, tjmax, [r0, v0],
    function(t, x) {
        return [x[1], (g - amp * omega * omega * Math.cos(omega * t))*Math.sin(x[0])/ell];
    },
    1e-5, 100000,
    function (t, x) {
    });
    start = null;
}
init(50, 1, 5, 1, 0, 30, 0.1);

function initForm(e) {
    var f = document.settings;
    init(parseFloat(f.frequency.value),
         parseFloat(f.amplitude.value),
         parseFloat(f.length.value),
         parseFloat(f.displacement.value),
         parseFloat(f.velocity.value),
         parseFloat(f.loop.value),
         parseFloat(f.ms.value));
    return false;
}

requestAnimationFrame(draw);