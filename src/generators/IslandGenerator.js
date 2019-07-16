let SimplexNoise = require('simplex-noise');
let ndarray = require('ndarray');
let {createCanvas} = require('canvas');
let base64Img = require('base64-img');
require('canvas-5-polyfill');

let TileGenerator = require('./TileGenerator');
let IslandSeedGenerator = require('./IslandSeedGenerator');

class IslandGenerator {
    constructor(width, height, tiles, distanceFunction, noiseWeight, granularity) {
        this.width = width;
        this.height = height;
        this.tiles = tiles;
        this.distanceFunction = distanceFunction;

        function noiseAt(x, y) {
            return (gen.noise2D(x, y) / 2) + 0.5;
        }

        let gen = new SimplexNoise();
        let elevations = ndarray(new Float32Array(width * height), [width, height]);
        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                let x = i / width;
                let y = j / height;
                let noise = (1 / granularity) * noiseAt(granularity * x, granularity * y);
                let dist = distanceFunction(i, j);
                let elevation = (noiseWeight * noise) + ((1 - noiseWeight) * dist);
                elevations.set(i, j, elevation);
            }
        }

        for (const tile of tiles) {
            let x = Math.round(tile.centroid.x);
            let y = Math.round(tile.centroid.y);
            let elev = elevations.get(x, y);
            tile.setElev(elev);
        }
    }

    draw() {
        let canvas = createCanvas(this.width, this.height);
        let context = canvas.getContext('2d');
        context.lineWidth = 4;
        context.strokeStyle = 'rgb(50, 50, 50)';
        for (const tile of this.tiles) {
            let region = new Path2D();
            context.beginPath();
            region.moveTo(tile.vertices[0].x, tile.vertices[0].y);
            context.moveTo(tile.vertices[0].x, tile.vertices[0].y);
            for (let i = 1; i < tile.vertices.length; i++) {
                region.lineTo(tile.vertices[i].x, tile.vertices[i].y);
                context.lineTo(tile.vertices[i].x, tile.vertices[i].y);
            }
            context.fillStyle = tile.getColor();
            context.fill(region);
            context.stroke();
            context.closePath();
        }
        base64Img.img(canvas.toDataURL(), '../images', 'image', (err, filepath) => {
            console.log('Saved');
        });
    }
}

module.exports = IslandGenerator;


