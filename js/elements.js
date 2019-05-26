function elem_to_cart(elements, t) {
    let delta_t = t - elements.Tp;
    let M = elements.M + delta_t + 2 * Math.PI * delta_t / elements.period;
    while (M > 2 * Math.PI) {
        M -= 2 * Math.PI;
    }

    // Iterative solution of Kepler's equation
    var F = E - elements.e * Math.sin(E) - M
    var E = M;
    var j = 0;
    while (Math.abs(F) > 0.0001 && j < 100) {
        E = E - F/(1 - elements.e * Math.cos(E));
        F = E - elements.e * Math.sin(E) - M;
        j++
    }

    let nu = 2 * Math.atan2(Math.sqrt(1 + elements.e) * Math.sin(E/2), Math.sqrt(1 - elements.e) * Math.cos(E/2));

    r = elements.a * (1 - elements.e**2) / (1 + elements.e * Math.cos(nu));

    X = r * (Math.cos(elements.Om) * Math.cos(nu) - Math.sin(elements.Om) * Math.sin(nu) * Math.cos(elements.i));
    Y = r * (Math.sin(elements.Om) * Math.cos(nu) + Math.cos(elements.Om) * Math.sin(nu) * Math.cos(elements.i));
    Z = r * (Math.sin(elements.i) * Math.sin(nu));

    return [X, Y, Z];
}

class TextLabel extends PIXI.Container{
    constructor(text = "", position = new PIXI.Point(0, 0), fontsize=20, color = 0xffffff) {
        super();
        this.position = position;
        this.fontsize = fontsize;
        this.color = color;
        let gText = new PIXI.Text(text,{
            fill: this.color,
            fontFamily:"Arial",
            fontSize: this.fontsize,
            wordWrap:true,
            wordWrapWidth:400
        });
        this.addChild(gText);
        this.text = text;
    }

    set text(text) {
        this.children[0].text = text;
    }
}

// Orbital Elements
class Elements {
    constructor(M, a, e, i, Om, Tp, period) {
        this.M = M;
        this.a = a;
        this.e = e;
        this.i = i;
        this.Om = Om;
        this.Tp = Tp;
        this.period = period;
    }
}

// Type enum
var BodyType = {
    PLANET: 0,
    ASTEROID: 1,
    STATION: 2,
    UN: 3,
    MCRN: 4,
    OPA: 5,
    INDEPENDENT: 6,
    ALIEN: 7
};

class StellarBody {
    constructor(name, elements, type) {
        this.name = name;
        this.elements = elements;
        this.type = type;
    }

    get pos2D() {
        return this.getPos2DAt(CUR_JD);
    }

    get pos3D() {
        return this.getPos3DAt(CUR_JD);
    }

    // Returns only the X and Y coordinates for map placement at a certain time.
    getPos2DAt(t) {
        var coord = elem_to_cart(this.elements, t);
        return [coord[0], coord[1]];
    }

    // Returns position in three dimensional space at julian date t.
    getPos3DAt(t) {
        return elem_to_cart(this.elements, t);
    }
}

// Baseclass?
class Body {
    constructor(pos3D) {
        this.pos3D = pos3D;
        this.name = "Deep Space"
    }

    get pos2D() {
        return [this.pos3D[0], this.pos3D[1]];
    }
}

class Zone {
    constructor(name, center, r1, r2) {
        this.name = name;
        this.center = center;
        this.r1 = r1;
        this.r2 = r2;
    }
}

// The players ship.
class Ship {
    constructor(name, pos3D) {
        this.name = name;
        this._pos3D = pos3D;
        this.target = null;
        this.orbitingBody = null;
        this.statusBox = this.box = new ShipStatusBox(this);

        this.container = new PIXI.Container();
        let graphics = new PIXI.Graphics();
        graphics.beginFill(0xf49e42);
        graphics.drawCircle(0, 0, 10);
        this.container.addChild(graphics);
        this.container.addChild(this.statusBox.container);
        this.statusBox.container.position = new PIXI.Point(10, 10);

        this.targetMarker = new PIXI.Container();
        let graphicsTarget = new PIXI.Graphics();
        graphicsTarget.lineStyle(1, 0xf49e42);
        graphicsTarget.drawCircle(0, 0, 12);
        this.targetMarker.addChild(graphicsTarget);
    }

    get pos2D() {
        return [this.pos3D[0], this.pos3D[1]]
    }

    get pos3D() {
        if (this.orbitingBody) {
            return this.orbitingBody.pos3D;
        } else {
            return this._pos3D;
        }
    }

    set pos3D(pos3D) {
        if (this.orbitingBody) {
            this.orbitingBody = null;
        }
        this._pos3D = pos3D;
    }

    get distanceToTarget() {
        if (this.target) {
            return Math.sqrt((this.pos3D[0] - this.target.pos3D[0])**2 + (this.pos3D[1] - this.target.pos3D[1])**2 + (this.pos3D[2] - this.target.pos3D[2])**2);
        } else {
            return -1;
        }
    }

    get twoWayTransmissionDelay() {
        if (this.target) {
            return 2 * this.distanceToTarget / LIGHTSPEED;
        } else {
            return -1;
        }
    }

    enterOrbit(body) {
        this.orbitingBody = body;
    }

    leaveOrbit() {
        if (this.orbitingBody) {
            this._pos3D = this.orbitingBody.pos3D;
            this.orbitingBody = null;
        }
    }

    updatePosition(map) {
        let pix = map.posToPix(this.pos2D);
        this.container.position = new PIXI.Point(pix[0], pix[1]);
    }

    updateTargetMarker(map) {
        if (this.target) {
            if (!this.targetMarker.visible) {
                this.targetMarker.visible = true;
            }
            let pix = map.posToPix(this.target.pos2D);
            this.targetMarker.position = new PIXI.Point(pix[0], pix[1]);
        } else if (this.targetMarker.visible) {
            this.targetMarker.visible = false;
        }
    }
}

// This class decribes a status box which can be displayed containing important information about the shiü.
class ShipStatusBox {
    constructor(parent) {
        this.parent = parent;
        this.container = new PIXI.Container();
        this.draw();
    }

    updateStatus() {
        let coord = this.parent.pos3D;
        this.container.children[2].text = (coord[0]<0?"-":"+") + Math.abs(coord[0]).toFixed(2).padStart(5, '0') + '//' +
                             (coord[1]<0?"-":"+") + Math.abs(coord[1]).toFixed(2).padStart(5, '0') + '//' +
                             (coord[2]<0?"-":"+") + Math.abs(coord[2]).toFixed(2).padStart(5, '0');
        if (this.parent.target) {
            this.container.children[3].text = 'TARGET//' + this.parent.target.name;
        }
        this.container.children[4].text = 'DIST//' + this.parent.distanceToTarget.toFixed(2).padStart(5, '0');
        this.container.children[5].text = 'COM//' + (this.parent.twoWayTransmissionDelay * 24).toFixed(2).padStart(5, '0') + '//HOURS';
    }

    draw() {
        var graphics = new PIXI.Graphics();
        graphics.beginFill(0x03333)
        graphics.lineStyle(1, 0xffffff)
            .moveTo(0, 0)
            .lineTo(160, 0)
            .lineTo(170, 10)
            .lineTo(170, 250)
            .lineTo(0, 250)
            .lineTo(0, 0)
        let labelTitle = new TextLabel(this.parent.name, new PIXI.Point(1, 1), 20);
        let labelPosition = new TextLabel("+00.00//+00.00//+00.00", new PIXI.Point(1, 25), 15);
        let labelTargetName = new TextLabel("TARGET//???", new PIXI.Point(1, 50), 15)
        let labelTargetDist = new TextLabel("DIST//00.00", new PIXI.Point(1, 70), 15);
        let labelComDelay = new TextLabel("COM//00.00//HOURS", new PIXI.Point(1, 90), 15);
        this.container.addChild(graphics);
        this.container.addChild(labelTitle);
        this.container.addChild(labelPosition);
        this.container.addChild(labelTargetName);
        this.container.addChild(labelTargetDist);
        this.container.addChild(labelComDelay);
    }
}

class SystemMap {
    constructor(xmin, ymin, xmax, ymax, container) {
        // Position auf dem Canvas
        this.xpos = [xmin, xmax];
        this.ypos = [ymin, ymax];
        // Data
        this.xlims = [-10, 10]
        this._bodies = [];
        this._zones = [];
        this._routes = [];
        // Objects.
        this._markers = [];
        this._zoneMarkers = [];
        this._routeMarkers = [];
        this._grid = new PIXI.Container();
        this._labels = new PIXI.Container();
        
        this.container = container;

        // DEBUG
        this.ship = new Ship("Rocinante", [4, 5, 0]);
        this.container.addChild(this.ship.container);
        this.container.addChild(this.ship.targetMarker)
    }

    // Setter (keep aspect ratio and center)
    set xlims(xlims) {
        this._xlims = xlims;
        let yrange = (xlims[1] - xlims[0]) / (this.xpos[1] - this.xpos[0]) * (this.ypos[1] - this.ypos[0]);
        var ycenter = 0;
        if (this._ylims) {
            ycenter = ( this._ylims[0] + this._ylims[1]) / 2;
        }
        this._ylims = [ ycenter - yrange/2, ycenter + yrange/2]
    }

    set ylims(ylims) {
        this._ylims = ylims;
        let xrange = (ylims[1] - ylims[0]) / (this.ypos[1] - this.ypos[0]) * (this.xpos[1] - this.xpos[0]);
        var xcenter = 0;
        if (this._xlims) {
            xcenter = ( this._xlims[0] + this._xlims[1]) / 2;
        }
        this._xlims = [ xcenter - xrange/2, xcenter + xrange/2]
    }

    get xlims() {
        return this._xlims;
    }

    get ylims() {
        return this._ylims;
    }

    set center(center) {
        let xrange = this._xlims[1] - this._xlims[0];
        let yrange = this._ylims[1] - this._ylims[0];

        this._xlims = [center[0] - xrange/2, center[0] + xrange/2];
        this._ylims = [center[1] - yrange/2, center[1] + yrange/2];
    }

    get center() {
        return [(this._xlims[0] + this._xlims[1]) / 2, (this._ylims[0] + this._ylims[1]) / 2];
    }

    set bodies(bodies) {
        this._bodies = bodies;
        for ( var i = 0; i < bodies.length; i++ ) {
            let marker = new PIXI.Container();
            let graphics = new PIXI.Graphics();
            graphics.beginFill(0xffffff);
            graphics.drawCircle(0, 0, 10);
            marker.addChild(graphics);
            var label = new TextLabel(bodies[i].name, new PIXI.Point(10, -30), 20);
            var coordLabel = new TextLabel('+00.00//+00.00//+00.00',
                                           new PIXI.Point(15, -10), 10, 0x333333);
            marker.addChild(label);
            marker.addChild(coordLabel);
            this._markers[i] = marker;
            this.container.addChild(this._markers[i]);

            // Draw orbits
            let a = this.bodies[i].elements.a;
            let e = this.bodies[i].elements.e;
            let b = Math.sqrt(a**2 - e**2);
            let Om = this.bodies[i].elements.Om;
            let inc = this.bodies[i].elements.i;

            let a_pix = a * Math.cos(inc) / (this.xlims[1] - this.xlims[0]) * (this.xpos[1] - this.xpos[0]);
            let b_pix = b / (this.xlims[1] - this.xlims[0]) * (this.xpos[1] - this.xpos[0]);
            let e_pix = e * Math.cos(inc) / (this.xlims[1] - this.xlims[0]) * (this.xpos[1] - this.xpos[0]);

            let centerPos = this.posToPix([0, 0])

            let containerOrbit = new PIXI.Container();
            let graphicsOrbits = new PIXI.Graphics();
            graphicsOrbits.lineStyle(1, 0x333333);
            graphicsOrbits.drawEllipse(0, 0, a_pix, b_pix);
            containerOrbit.addChild(graphicsOrbits);
            //containerOrbit.rotation = -Om / DEG_TO_RAD;
            containerOrbit.position = new PIXI.Point(centerPos[0], centerPos[1]);
            this.container.addChild(containerOrbit);
        }
    }

    set zones(zones) {
        this._zones = zones;
        for (var i = 0; i < zones.length; i++ ) {
            let zoneMarker = new PIXI.Container();
            let graphics = new PIXI.Graphics();
            let r = (zones[i].r1 + zones[i].r2) / 2 / (this.xlims[1] - this.xlims[0]) * (this.xpos[1] - this.xpos[0]);
            let width = (zones[i].r2 - zones[i].r1) / 2 / (this.xlims[1] - this.xlims[0]) * (this.xpos[1] - this.xpos[0]);
            graphics.lineStyle(width, 0xf49e42, 0.5);
            graphics.drawCircle(0, 0, r)
            zoneMarker.addChild(graphics);
            this._zoneMarkers[i] = zoneMarker;
            this.container.addChild(this._zoneMarkers[i]);
        }
    }

    get zones() {
        return this._zones;
    }

    get bodies() {
        return this._bodies;
    }

    posToPix(pos) {
        var xpix =  this.xpos[0] +  ( pos[0] - this._xlims[0] ) * (this.xpos[1] - this.xpos[0]) / (this._xlims[1] - this._xlims[0]);
        var ypix =  this.ypos[1] - ( pos[1] - this._ylims[0] ) * (this.ypos[1] - this.ypos[0]) / (this._ylims[1] - this._ylims[0]);
        return [xpix, ypix]
    }

    addRoute(route) {
        this._routes.push(route);
        let routeMarker = new PIXI.Container();
        let graphics = new PIXI.Graphics();
        routeMarker.addChild(graphics);
        this._routeMarkers.push(routeMarker);
        this.container.addChild(this._routeMarkers[this._routeMarkers.length-1])
    }

    deleteRoute(i) {
        this._routeMarkers[i].children[0].clear();
        this._routes.splice(i);
        this._routeMarkers.splice(i);
    }

    // Draws map with contents on container
    draw() {
        // Cleanup.
        for (var i = this._grid.children.length - 1; i >= 0; i--)
        {
           this._grid.children[i].destroy();
        }
        for (var i = this._labels.children.length - 1; i >= 0; i--)
        {
           this._labels.children[i].destroy();
        }

        var graphics = new PIXI.Graphics();
        // Draw grid and labels.
        for (var x = -( this._xlims[0] - Math.floor(this._xlims[0])); x <= this._xlims[1] - this._xlims[0]; x++)
        {
            let xpix = this.xpos[0] + x * (this.xpos[1] - this.xpos[0]) / (this._xlims[1] - this._xlims[0]);
            graphics.lineStyle(1, 0x333333)
                    .moveTo(xpix, this.ypos[0])
                    .lineTo(xpix, this.ypos[1]);
            let gText = new PIXI.Text(Math.round(this._xlims[0] + x),{
                fill: 0x333333,
                fontFamily:"Arial",
                fontSize: 10,
            });
            gText.position = new PIXI.Point(xpix+5, this.ypos[0]);
            this._labels.addChild(gText);    // memory leak
        }

        for (var y = -( this._ylims[0] - Math.floor(this._ylims[0])); y <= this._ylims[1] - this._ylims[0]; y++)
        {
            let ypix = this.ypos[1] - y * (this.ypos[1] - this.ypos[0]) / (this._ylims[1] - this._ylims[0]);
            graphics.lineStyle(1, 0x333333)
                    .moveTo(this.xpos[0], ypix)
                    .lineTo(this.xpos[1], ypix);
            let gText = new PIXI.Text(Math.round(this._ylims[0] + y),{
                fill: 0x333333,
                fontFamily:"Arial",
                fontSize: 10,
            });
            gText.position = new PIXI.Point(this.xpos[0], ypix);
            this._labels.addChild(gText);
        }

        this._grid.addChild(graphics);
        this._grid.zIndex = -999;
        this.container.addChild(this._grid);
        this._labels.zIndex = -999;
        this.container.addChild(this._labels);

        // Draw bodies.
        for (var i = 0; i < this._markers.length; i++)
        {
            let pix = this.posToPix(this._bodies[i].getPos2DAt(CUR_JD));
            this._markers[i].position = new PIXI.Point(pix[0], pix[1]);
            let coord = this.bodies[i].getPos3DAt(CUR_JD);
            this._markers[i].children[2].text = (coord[0]<0?"-":"+") + Math.abs(coord[0]).toFixed(2).padStart(5, '0') + '//' +
                                                (coord[1]<0?"-":"+") + Math.abs(coord[1]).toFixed(2).padStart(5, '0') + '//' +
                                                (coord[2]<0?"-":"+") + Math.abs(coord[2]).toFixed(2).padStart(5, '0');

        }

        // Draw zones.
        for (var i = 0; i < this._zoneMarkers.length; i++)
        {
            let pix = this.posToPix(this._zones[i].center);        
            this._zoneMarkers[i].position = new PIXI.Point(pix[0], pix[1]);                      
        }

        // Draw routes.
        for (var i = 0; i < this._routes.length; i++)
        {
            let startPix = this.posToPix(this._routes[i].startCoordinate2D);
            let destPix = this.posToPix(this._routes[i].destinationCoordinate2D);

            var graphics =  this._routeMarkers[i].children[0]
            graphics.clear()

            graphics.lineStyle(2, 0xffffff)
                .moveTo(startPix[0], startPix[1])
                .lineTo(destPix[0], destPix[1]);

            let starship_pos = this.posToPix([this._routes[i].get_pos()[0], this._routes[i].get_pos()[1]]);
            graphics.drawCircle(starship_pos[0], starship_pos[1], 10);

            map.ship.pos3D = this._routes[i].get_pos();

            if (this._routes[i].destinationReached) {
                this.ship.enterOrbit(this._routes[i].destination)
                this.deleteRoute(i);
            }
        }

        this.ship.updatePosition(this);
        this.ship.updateTargetMarker(this);
        this.ship.statusBox.updateStatus();
    }
}
