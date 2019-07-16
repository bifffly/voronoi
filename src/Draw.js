let {createCanvas} = require('canvas');
let base64Img = require('base64-img');
require('canvas-5-polyfill');

class Draw {
    constructor(tiles, regions, width, height) {
        this.tiles = tiles;
        this.regions = regions;
        this.width = width;
        this.height = height;
    }

    draw() {
        // Draws tiles
        let canvas = createCanvas(this.width, this.height);
        let context = canvas.getContext('2d');
        context.lineWidth = 4;
        context.strokeStyle = 'rgb(50, 50, 50)';
        for (const tile of this.tiles) {
            let poly = new Path2D();
            // context.beginPath();
            poly.moveTo(tile.vertices[0].x, tile.vertices[0].y);
            // context.moveTo(tile.vertices[0].x, tile.vertices[0].y);
            for (let i = 1; i < tile.vertices.length; i++) {
                poly.lineTo(tile.vertices[i].x, tile.vertices[i].y);
                // context.lineTo(tile.vertices[i].x, tile.vertices[i].y);
            }
            context.fillStyle = tile.getColor();
            context.fill(poly);
            // context.stroke();
            // context.closePath();
        }

        // Draws regions
        context.lineWidth = 20;
        context.strokeStyle = 'rgb(67, 67, 122)';
        for (const region of this.regions) {
            context.beginPath();
            context.moveTo(region.vertices[0].x, region.vertices[0].y);
            for (let i = 1; i < region.vertices.length; i++) {
                context.lineTo(region.vertices[i].x, region.vertices[i].y);
            }
            context.stroke();
            context.closePath();
        }

        // Saves image
        base64Img.img(canvas.toDataURL(), '../images', 'image', (err, filepath) => {
            console.log('Saved');
        });
    }
}

module.exports = Draw;
