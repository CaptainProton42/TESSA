class Route {
    constructor(destination, startCoordinate, destinationCoordinate, travelDisctance, travelTime, startTime) {
        this.destination = destination;
        this.startCoordinate = startCoordinate;
        this.destinationCoordinate = destinationCoordinate;
        this.travelDisctance = travelDisctance;
        this.travelTime = travelTime;
        this.startCoordinate2D = [startCoordinate[0], startCoordinate[1]];
        this.destinationCoordinate2D = [destinationCoordinate[0], destinationCoordinate[1]];
        this.startTime = startTime;
        this.progress = 0.0;
        this._destinationReached = false;
    }

    get_pos() {
        var t = CUR_JD - this.startTime;

        var a = this.travelDisctance / this.travelTime**2 * 4;
        var s = 0;

        if (t < this.travelTime/2) {
            s = a / 2 * t**2;
        } else {
            s = -a/4 * this.travelTime**2 + a * t * this.travelTime - a/2 * t**2;
        }

        this.progress = s / this.travelDisctance;


        var pos = [0, 0, 0];
        pos[0] = this.startCoordinate[0] + (this.destinationCoordinate[0] - this.startCoordinate[0]) * this.progress;
        pos[1] = this.startCoordinate[1] + (this.destinationCoordinate[1] - this.startCoordinate[1]) * this.progress;
        pos[2] = this.startCoordinate[2] + (this.destinationCoordinate[2] - this.startCoordinate[2]) * this.progress;

        return pos;
    }

    set destinationReached(destinationReached) {
        this._destinationReached = destinationReached;
    }

    get destinationReached() {
        var t = CUR_JD - this.startTime;
        if (t >= this.travelTime) {
            return true;
        } else {
            return false;
        }
    }
}


function plotRoute(start_coord, dest_body, acc) {
    if (dest_body.type == BodyType.STATION)
    {
        var dest_coord = dest_body.pos3D;
        var s_ship = Math.sqrt((dest_coord[0] - start_coord[0])**2
                                + (dest_coord[1] - start_coord[1])**2
                                + (dest_coord[2] - start_coord[2])**2);
        var t_ship = Math.sqrt(4 / acc * s_ship);
        return new Route(dest_body, start_coord, dest_coord, s_ship, t_ship, CUR_JD);
    } else {
        var step = 0.00001;
        for (var w = 0; w <  2 * Math.PI; w += step)
        {
            var t_body = dest_body.elements.period * w / 2 / Math.PI;
            var dest_coord = dest_body.getPos3DAt(w / 2 / Math.PI * dest_body.elements.period + CUR_JD);
            var s_ship = Math.sqrt((dest_coord[0] - start_coord[0])**2
                                    + (dest_coord[1] - start_coord[1])**2
                                    + (dest_coord[2] - start_coord[2])**2);
            var t_ship = Math.sqrt(4 / acc * s_ship);
            if (Math.abs(t_body - t_ship) < 1)
            {
                return new Route(dest_body, start_coord, dest_coord, s_ship, t_ship, CUR_JD);
            }
        }
    }
}