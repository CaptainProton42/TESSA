bcCommands = new BroadcastChannel("tessa-cmd");
bcMetrics = new BroadcastChannel("tessa-metrics");

var connected = false;  // Checks whether a player client is open.
var timeout = 30;

var eventTimeout = new Event('timeout');

var select_start = document.getElementById("select_start");
var select_dest = document.getElementById("select_dest");
var select_ship_orbit = document.getElementById("select_ship_orbit");
var input_acc = document.getElementById("input_acc");
var input_ship_pos_x = document.getElementById("input_ship_pos_x");
var input_ship_pos_y = document.getElementById("input_ship_pos_y");

// Listen for the event.
addEventListener('timeout', function (e) {
    document.getElementById("overlay").style.display = "block";
}, false);

setInterval(function(){
    timeout++;
    if (timeout >= 30){
        connected=false;
        dispatchEvent(eventTimeout);
    }
}, 1000);

bcMetrics.onmessage = function (ev) {
    if (!connected) {
        connected = true;
        timeout = 0;
        document.getElementById("overlay").style.display = "none";
    }

    var select_start = document.getElementById("select_start");
    var select_dest = document.getElementById("select_dest");
    var select_ship_orbit = document.getElementById("select_ship_orbit");
    var select_ship_target = document.getElementById("select_ship_target");

    for (var i = 0; i < ev.data.length; i++ )
    {
        var opt = document.createElement('option');

        opt.appendChild( document.createTextNode(ev.data[i].name) );
        opt.value = ev.data[i].name; 

        if (i >= select_start.children.length) {
            select_start.appendChild(opt);
        } else {
            select_start.children[i] = opt;
        }

        if (i >= select_dest.children.length) {
            select_dest.appendChild(opt);
        } else {
            select_dest.children[i] = opt;
        }

        if (i >= select_ship_orbit.children.length) {
            select_ship_orbit.appendChild(opt);
        } else {
            select_ship_orbit.children[i] = opt;
        }

        if (i >= select_ship_target.children.length) {
            select_ship_target.appendChild(opt);
        } else {
            select_ship_target.children[i] = opt;
        }
    }
  }

function sendParams() {
    var packet = {
        jd: parseFloat(document.getElementById("jd").value)
    }
    bc.postMessage(packet);
}

function plotRoute()
{  
    var select_start = document.getElementById("select_start");
    var select_dest = document.getElementById("select_dest");
    var input_acc = document.getElementById("input_acc");

    var start = select_start.selectedIndex;
    var dest = select_dest.selectedIndex;
    var acc = parseFloat(input_acc.value);

    var msg = {
        cmd: "plot",
        start: start,
        dest: dest,
        acc: acc
    }

    bcCommands.postMessage(msg);
}

function setShipPos() {
    var input_ship_pos_x = document.getElementById("input_ship_pos_x");
    var input_ship_pos_y = document.getElementById("input_ship_pos_y");
    var input_ship_pos_z = document.getElementById("input_ship_pos_z");

    var posX = parseFloat(input_ship_pos_x.value);
    var posY = parseFloat(input_ship_pos_y.value);
    var posZ = parseFloat(input_ship_pos_z.value);

    var msg = {
        cmd: "set_ship_pos",
        pos_x: posX,
        pos_y: posY,
        pos_z: posZ
    }

    bcCommands.postMessage(msg);
}

function setShipOrbit() {
    var select_ship_orbit = document.getElementById("select_ship_orbit");

    var body = select_ship_orbit.selectedIndex;

    var msg = {
        cmd: "set_ship_orbit",
        body: body
    }

    bcCommands.postMessage(msg);
}

function setShipTarget() {
    var select_ship_target = document.getElementById("select_ship_target");

    var target = select_ship_target.selectedIndex;

    var msg = {
        cmd: "set_ship_target_body",
        target: target
    }

    bcCommands.postMessage(msg);
}

function setShipTargetPos() {
    var input_ship_target_pos_x = document.getElementById("input_ship_target_pos_x");
    var input_ship_target_pos_y = document.getElementById("input_ship_target_pos_y");
    var input_ship_target_pos_z = document.getElementById("input_ship_target_pos_z");

    var posX = parseFloat(input_ship_target_pos_x.value);
    var posY = parseFloat(input_ship_target_pos_y.value);
    var posZ = parseFloat(input_ship_target_pos_z.value);

    var msg = {
        cmd: "set_ship_target_pos",
        pos_x: posX,
        pos_y: posY,
        pos_z: posZ
    }

    bcCommands.postMessage(msg);    
}