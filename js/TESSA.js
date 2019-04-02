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

// Layout.

// Globals.
var CUR_JD = 2542944.500000;

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
map = new SystemMap(0, 75, window.innerWidth, window.innerHeight);
map.xlims = [-10, 10];
map.bodies = [Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune,
              Ceres];

belt = new Zone("Belt", [0, 0], 2.0, 3.4);
map.zones = [belt];

var mapcontainer = new PIXI.Container();

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

var time_old, delta;
function animLoop(time) {
  // Calc delta.
  delta = time - time_old;
  time_old = time;
  FPS.text = delta.toFixed(1).padStart(5, '0') + '//' + (1000 / delta).toFixed(0).padStart(3, '0');

  //Call this `gameLoop` function on the next screen refresh
  //(which happens 60 times per second)
  requestAnimationFrame(animLoop);

  CUR_JD++;
  JDlabel.text = '//' + CUR_JD.toString().padEnd(14, '0');

  map.draw(mapcontainer);
}

//Start the loop
requestAnimationFrame(animLoop);