let Voronoi = require('voronoi');

let Point = require('../utils/Point');
let Polygon = require('../utils/Polygon');
let Tile = require('../utils/Tile');

class TileGenerator {
    constructor(n, width, height, nRelax) {
        this.points = [];
        for (let i = 0; i < n; i++) {
            let x = Math.random() * width;
            let y = Math.random() * height;
            let point = new Point(x, y);
            this.points.push(point);
        }

        function relax(diagram) {
            let centroids = [];
            for (const cell of diagram.cells) {
                const polygon = new Polygon(cell);
                centroids.push(polygon.centroid);
            }
            return centroids;
        }

        let voronoi = new Voronoi();
        let bbox = {xl: 0, xr: width, yt: 0, yb: height};
        this.diagram = voronoi.compute(this.points, bbox);
        for (let i = 0; i < nRelax; i++) {
            this.diagram = voronoi.compute(relax(this.diagram), bbox);
        }

        this.tiles = [];
        for (const cell of this.diagram.cells) {
            let polygon = new Polygon(cell);
            let tile = new Tile(polygon, width, height);
            this.tiles.push(tile);
        }
    }
}

module.exports = TileGenerator;
