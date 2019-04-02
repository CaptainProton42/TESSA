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
    constructor(xmin, ymin, xmax, ymax) {
        // Display
        this.xpos = [xmin, xmax];
        this.ypos = [ymin, ymax];
        // Data
        this.xlims = [-10, 10]
        this._bodies = [];
        this._zones = [];
        // Objects.
        this._markers = [];
        this._zoneMarkers = [];
        this._grid = new PIXI.Container();
        this._labels = new PIXI.Container();
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
            let coord = bodies[i].getPos(CUR_JD);
            var coordLabel = new TextLabel('+00.00//+00.00//+00.00',
                                           new PIXI.Point(15, -10), 10, 0x333333);
            marker.addChild(label);
            marker.addChild(coordLabel);
            this._markers[i] = marker;
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
        }
    }

    get zones() {
        return this._zones;
    }

    get bodies() {
        return this._bodies;
    }

    // Draws map with contents on container
    draw(container) {
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
        container.addChild(this._grid);
        this._labels.zIndex = -999;
        container.addChild(this._labels);

        // Place bodies.
        for (var i = 0; i < this._markers.length; i++)
        {
            var xpix =  this.xpos[0] +  ( this.bodies[i].getMapPos(CUR_JD)[0] - this._xlims[0] ) * (this.xpos[1] - this.xpos[0]) / (this._xlims[1] - this._xlims[0]);
            var ypix =  this.ypos[1] - ( this.bodies[i].getMapPos(CUR_JD)[1] - this._ylims[0] ) * (this.ypos[1] - this.ypos[0]) / (this._ylims[1] - this._ylims[0]);
            this._markers[i].position = new PIXI.Point(xpix, ypix);
            let coord = this.bodies[i].getPos(CUR_JD);
            this._markers[i].children[2].text = (coord[0]<0?"-":"+") + Math.abs(coord[0]).toFixed(2).padStart(5, '0') + '//' +
                                                (coord[1]<0?"-":"+") + Math.abs(coord[1]).toFixed(2).padStart(5, '0') + '//' +
                                                (coord[2]<0?"-":"+") + Math.abs(coord[2]).toFixed(2).padStart(5, '0');

            container.addChild(this._markers[i]);
        }

        for (var i = 0; i < this._zoneMarkers.length; i++)
        {
            var xpix =  this.xpos[0] +  ( this._zones[i].center[0] - this._xlims[0] ) * (this.xpos[1] - this.xpos[0]) / (this._xlims[1] - this._xlims[0]);
            var ypix =  this.ypos[1] - ( this._zones[i].center[1] - this._ylims[0] ) * (this.ypos[1] - this.ypos[0]) / (this._ylims[1] - this._ylims[0]);
            this._zoneMarkers[i].position = new PIXI.Point(xpix, ypix);
            container.addChild(this._zoneMarkers[i]);           
        }
    }
}
