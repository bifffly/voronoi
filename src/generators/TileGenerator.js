let voronoi = require('voronoi');
let {createCanvas} = require('canvas');
let base64Img = require('base64-img');

let Point = require('../utils/Point');
let Polygon = require('../utils/Polygon');
let Tile = require('../utils/Tile');

class TileGenerator {
    constructor(n, width, height, nRelax) {
        this.width = width;
        this.height = height;
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

        let v = new voronoi();
        let bbox = {xl: 0, xr: width, yt: 0, yb: height};
        this.diagram = v.compute(this.points, bbox);
        for (let i = 0; i < nRelax; i++) {
            this.diagram = v.compute(relax(this.diagram), bbox);
        }

        this.tiles = [];
        for (const cell of this.diagram.cells) {
            let polygon = new Polygon(cell);
            let tile = new Tile(polygon, this.width, this.height);
            this.tiles.push(tile);
        }
    }

    draw() {
        let canvas = createCanvas(this.width, this.height);
        let context = canvas.getContext('2d');
        context.lineWidth = 0.5;
        context.strokeStyle = 'rgb(67, 67, 122)';
        for (const tile of this.tiles) {
            let vertices = tile.polygon.vertices;
            context.beginPath();
            context.moveTo(vertices[0].x, vertices[0].y);
            for (let i = 1; i < vertices.length; i++) {
                context.lineTo(vertices[i].x, vertices[i].y);
            }
            context.stroke();
            context.closePath();
        }
        base64Img.img(canvas.toDataURL(), '../images', 'image', (err, filepath) => {
            console.log('Saved');
        });
    }
}

module.exports = TileGenerator;
