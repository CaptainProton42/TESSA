function elem_to_cart(elements, t) {
    let delta_t = t - elements.Tp;
    let w = 2 * Math.PI * delta_t / elements.period;
    while (w > 2 * Math.PI) {
        w -= 2 * Math.PI;
    }

    r = elements.a * (1 - elements.e**2) / (1 + elements.e * Math.cos(elements.nu));

    X = r * (Math.cos(elements.Om) * Math.cos(w + elements.nu) - Math.sin(elements.Om) * Math.sin(w + elements.nu) * Math.cos(elements.i));
    Y = r * (Math.sin(elements.Om) * Math.cos(w + elements.nu) + Math.cos(elements.Om) * Math.sin(w + elements.nu) * Math.cos(elements.i));
    Z = r * (Math.sin(elements.i) * Math.sin(w + elements.nu));

    return [X, Y, Z];
}

// Converts a position in map coordinates to a pixel position on screen
function pos_to_pix(pos, map) {
    var xpix =  map.xpos[0] +  ( pos[0] - map._xlims[0] ) * (map.xpos[1] - map.xpos[0]) / (map._xlims[1] - map._xlims[0]);
    var ypix =  map.ypos[1] - ( pos[1] - map._ylims[0] ) * (map.ypos[1] - map.ypos[0]) / (map._ylims[1] - map._ylims[0]);
    return [xpix, ypix]
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
    constructor(nu, a, e, i, Om, Tp, period) {
        this.nu = nu;
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

    // Returns only the X and Y coordinates for map placement.
    getMapPos(t) {
        var coord = elem_to_cart(this.elements, t);
        return [coord[0], coord[1]];
    }

    // Returns position in three dimensional space at julian date t.
    getPos(t) {
        return elem_to_cart(this.elements, t);
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
            let pix = pos_to_pix(this._bodies[i].getMapPos(CUR_JD), map);
            this._markers[i].position = new PIXI.Point(pix[0], pix[1]);
            let coord = this.bodies[i].getPos(CUR_JD);
            this._markers[i].children[2].text = (coord[0]<0?"-":"+") + Math.abs(coord[0]).toFixed(2).padStart(5, '0') + '//' +
                                                (coord[1]<0?"-":"+") + Math.abs(coord[1]).toFixed(2).padStart(5, '0') + '//' +
                                                (coord[2]<0?"-":"+") + Math.abs(coord[2]).toFixed(2).padStart(5, '0');
        }

        // Draw zones.
        for (var i = 0; i < this._zoneMarkers.length; i++)
        {
            let pix = pos_to_pix(this._zones[i].center, this);          
            this._zoneMarkers[i].position = new PIXI.Point(pix[0], pix[1]);                      
        }

        // Draw routes.
        for (var i = 0; i < this._routes.length; i++)
        {
            let start_pix = pos_to_pix(this._routes[i].startCoordinate2D, this);
            let dest_pix = pos_to_pix(this._routes[i].destinationCoordinate2D, this);

            var graphics =  this._routeMarkers[i].children[0]
            graphics.clear()

            graphics.lineStyle(2, 0xffffff)
                .moveTo(start_pix[0], start_pix[1])
                .lineTo(dest_pix[0], dest_pix[1]);

            let starship_pos = pos_to_pix([this._routes[i].get_pos()[0], this._routes[i].get_pos()[1]], this);
            graphics.drawCircle(starship_pos[0], starship_pos[1], 10);

            if (this._routes[i].destinationReached) {
                this.deleteRoute(i);
            }
        }
    }
}
