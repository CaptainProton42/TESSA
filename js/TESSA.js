//Create a Pixi Application
let app = new PIXI.Application({ 
    antialias: true,    // default: false
    transparent: false, // default: false
    resolution: 2       // default: 1
  }
);

app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoResize = true;
app.renderer.resize(window.innerWidth, window.innerHeight);

bcMetrics = new BroadcastChannel("tessa-metrics"); // Constantly broadcasts astrometric information.
bcCommands = new BroadcastChannel("tessa-cmd"); // For gm console commands.

// Layout.

// Constants.
// Units are: AU, days
const LIGHTSPEED = 173.1446327;

// Globals.
var CUR_JD = 2542944.500000;
var DAYS_PER_SECOND = 1;

// Menu Bar
menubar = new PIXI.Container();
menubar.position = new PIXI.Point(0, 0);
menubar.width = window.innerWidth;
menubar.height = 75;
let title = new TextLabel("TESSA", new PIXI.Point(0, 0), 50);
let subtitle = new TextLabel("The Expanse Solar System Astrometrics", new PIXI.Point(0, 52), 20)
let FPS = new PIXI.Text("000.0 // 000",{
                                fill: 0x000000,
                                fontFamily:"Arial",
                                fontSize: 15,
                              });
FPS.position = new PIXI.Point(window.innerWidth - 80, 0);
let JDlabel = new PIXI.Text("0000000.000000",{
                            fill: 0x000000,
                            fontFamily:"Arial",
                            fontSize: 20,
                          });
JDlabel.position = new PIXI.Point(window.innerWidth - 160, 50);
let line = new PIXI.Graphics();
line.lineStyle(1, 0xffffff)
       .moveTo(0, 75)
       .lineTo(window.innerWidth, 75);
let menubg = new PIXI.Graphics();
menubg.beginFill(0xf49e42);
menubg.drawRect(0, 0, window.innerWidth, 75); // 
menubar.addChild(menubg);
menubar.addChild(line);
menubar.addChild(title);
menubar.addChild(subtitle);
menubar.addChild(FPS);
menubar.addChild(JDlabel);

// Map
var mapcontainer = new PIXI.Container();
map = new SystemMap(0, 75, window.innerWidth, window.innerHeight, mapcontainer);
map.xlims = [-10, 10];
map.bodies = [Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune,
              Ceres];

belt = new Zone("Belt", [0, 0], 2.0, 3.4);
map.zones = [belt];

app.stage.addChild(menubar);
app.stage.addChild(mapcontainer);


//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

// Mouse listeners.
var mouseDown = 0;
var mousePosOld;
var moousePos;

document.body.onmousedown = function() { 
  ++mouseDown;
}
document.body.onmouseup = function() {
  --mouseDown;
}

var mousePosOldX;
var mousePosOldY;
document.body.onmousemove = function (e) {
  // Move map.
  if (mouseDown) {
    var moveX = (e.clientX - mousePosOldX) / (map.xpos[1] - map.xpos[0]) * (map.xlims[1] - map.xlims[0]);
    var moveY = (e.clientY - mousePosOldY) / (map.ypos[1] - map.ypos[0]) * (map.ylims[1] - map.ylims[0]);
    map.center = [map.center[0] - moveX, map.center[1] + moveY];
  }
  mousePosOldX = e.clientX;
  mousePosOldY = e.clientY;
}


bcCommands.onmessage = function (ev) {
  console.log(ev.data)
  if (ev.data.cmd == "plot") {
    var route = plotRoute(map.bodies[ev.data.start].pos3D, map.bodies[ev.data.dest], ev.data.acc);
    map.addRoute(route);
    map.ship.target = map.bodies[ev.data.dest];
    console.log(route);
  } else if (ev.data.cmd == "set_ship_pos") {
    map.ship.leaveOrbit()
    map.ship.pos3D = [ev.data.pos_x, ev.data.pos_y, ev.data.pos_z];
  } else if (ev.data.cmd == "set_ship_orbit") {
    map.ship.enterOrbit(map.bodies[ev.data.body]);
  } else if (ev.data.cmd == "set_ship_target_body") {
    map.ship.target = map.bodies[ev.data.target];
  } else if (ev.data.cmd == "set_ship_target_pos") {
    let target = new Body([ev.data.pos_x, ev.data.pos_y, ev.data.pos_z]);
    map.ship.target = target;
  }
}

var time_old, delta;
time_old = 0;
function animLoop(time) {
  bcMetrics.postMessage(map.bodies);
  // Calc delta.
  delta = time - time_old;
  FPS.text = delta.toFixed(1).padStart(5, '0') + '//' + (1000 / delta).toFixed(0).padStart(3, '0');

  CUR_JD += DAYS_PER_SECOND * delta/1000;
  JDlabel.text = '//' + CUR_JD.toFixed(6).padStart(14, '0');

  map.draw();
  time_old = time;
  //Call this `gameLoop` function on the next screen refresh
  //(which happens 60 times per second)
  requestAnimationFrame(animLoop);
}

//Start the loop
requestAnimationFrame(animLoop);