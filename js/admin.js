bcCommands = new BroadcastChannel("tessa-cmd");
bcMetrics = new BroadcastChannel("tessa-metrics");

var connected = false;  // Checks whether a player client is open.
var timeout = 30;

var eventTimeout = new Event('timeout');

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