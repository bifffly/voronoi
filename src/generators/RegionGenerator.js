let Point = require('../utils/Point');
let Polygon = require('../utils/Polygon');
let Voronoi = require('voronoi');

class RegionGenerator {
    constructor(n, width, height, centerWidthProp, centerHeightProp) {
        this.points = [];
        let centerWidth = centerWidthProp * width;
        let centerHeight = centerHeightProp * height;
        let minX = (width - centerWidth) / 2;
        let minY = (height - centerHeight) / 2;
        for (let i = 0; i < n; i++) {
            let x = (Math.random() * centerWidth) + minX;
            let y = (Math.random() * centerHeight) + minY;
            let point = new Point(x, y);
            this.points.push(point);
        }

        let voronoi = new Voronoi();
        let bbox = {xl: 0, xr: width, yt: 0, yb: height};
        this.diagram = voronoi.compute(this.points, bbox);

        this.polygons = [];
        for (const cell of this.diagram.cells) {
            let polygon = new Polygon(cell);
            this.polygons.push(polygon);
        }
    }
}

module.exports = RegionGenerator;
