bc = new BroadcastChannel("TESSA");

function sendParams()
{
    //bc.postMessage(parseFloat(document.getElementById("jd").value))
    var packet = {
        jd: parseFloat(document.getElementById("jd").value)
    }
    bc.postMessage(packet);
}