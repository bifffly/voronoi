const {createCanvas} = require('canvas');
require('canvas-5-polyfill');
let voronoi = require('voronoi');
let ndarray = require('ndarray');
let SimplexNoise = require('simplex-noise');
let gen = new SimplexNoise();
let base64Img = require('base64-img');
let Tile = require('./utils/tile');
let Polygon = require('./utils/polygon');
let Vertex = require('./utils/point');

const width = 600;
const height = 600;

function generatePoints(xMax, yMax, n) {
    let points = [];
    for (let i = 0; i < n; i++) {
        let x = Math.random() * xMax;
        let y = Math.random() * yMax;
        points.push({x, y});
    }
    return points;
}

function relax(diagram) {
    let cells = diagram.cells;
    let centroids = [];
    for (const cell of cells) {
        const polygon = new Polygon(cell);
        centroids.push(polygon.centroid);
    }
    return centroids;
}

function relaxN(voronoi, diagram, bbox, n) {
    for (let i = 0; i < n; i++) {
        diagram = voronoi.compute(relax(diagram), bbox);
    }
    return diagram;
}

function draw(tiles, regions, width, height) {
    let canvas = createCanvas(width, height);
    let context = canvas.getContext('2d');
    context.lineWidth = 2;
    context.strokeStyle = 'rgb(67, 67, 122)';
    for (const tile of tiles) {
        let region = new Path2D();
        let vertices = tile.getVertices();
        region.moveTo(vertices[0].x, vertices[0].y);
        for (let i = 1; i < vertices.length - 1; i++) {
            region.lineTo(vertices[i].x, vertices[i].y);
        }
        if (tile.isEdge()) {
            tile.elev = 0;
        }
        context.fillStyle = tile.getColor();
        context.fill(region);
    }
    for (const region of regions) {
        let vertices = region.getVertices();
        context.beginPath();
        context.moveTo(vertices[0].x, vertices[0].y);
        for (let i = 1; i < vertices.length - 1; i++) {
            context.lineTo(vertices[i].x, vertices[i].y);
        }
        context.stroke();
        context.closePath();
    }
    base64Img.img(canvas.toDataURL(), '../images', 'image', (err, filepath) => {
        console.log('Saved');
    });
}

function polygons(diagram) {
    let polygons = [];
    for (const cell of diagram.cells) {
        polygons.push(new Polygon(cell));
    }
    return polygons;
}

function generatePolygons(width, height, n, nRelax) {
    let v = new voronoi();
    let points = generatePoints(width, height, n);
    let bbox = {xl: 0, xr: width, yt: 0, yb: height};
    let diagram = relaxN(v, v.compute(points, bbox), bbox, nRelax);
    return polygons(diagram);
}

function generateTiles(polygons, width, height) {
    let tiles = [];
    let elevations = generateElevation(width, height);
    for (const polygon of polygons) {
        let elevation = elevations.get(Math.round(polygon.centroid.x), Math.round(polygon.centroid.y));
        tiles.push(new Tile(polygon, elevation, width, height));
    }
    return tiles;
}

function generate(width, height, n, nRelax) {
    let tiles = generateTiles(generatePolygons(width, height, n, nRelax), width, height);
    let regions = generateRegions(0.4, 6, 0);
    return {
        draw: draw(tiles, regions, width, height),
        strs: getRegionStrings(regions)
    };
}

function noiseAt(nx, ny) {
    return gen.noise2D(nx, ny) / 2 + 0.5;
}

function distance(x, y, xmax, ymax) {
    let xdist, ydist;
    if (x < xmax / 2) {
        xdist = x;
    }
    else {
        xdist = xmax - x;
    }
    if (y < ymax / 2) {
        ydist = y;
    }
    else {
        ydist = ymax - y;
    }
    return Math.min(xdist, ydist);
}

function generateElevation(width, height) {
    let elevation = ndarray(new Float32Array(width * height), [width, height]);
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            let nx = x/width - 0.5;
            let ny = y / width - 0.5;
            let noise = (1/4.5) * noiseAt(4.5 * nx, 4.5 * ny);
            let dist = distance(x, y, width, height);
            let maxDist = Math.max(width / 2, height / 2);
            let distPct = dist / maxDist;
            noise = (0.6 * noise) + (0.4 * Math.pow(distPct, 2.5));
            elevation.set(x, y, noise);
        }
    }
    return elevation;
}

function generateRegions(centerProp, n, nRelax) {
    let centerWidth = centerProp * width;
    let centerHeight = centerProp * height;
    let minX = (width - centerWidth) / 2;
    let minY = (height - centerHeight) / 2;
    let points = [];
    for (let i = 0; i < n; i++) {
        let x = (Math.random() * centerWidth) + minX;
        let y = (Math.random() * centerHeight) + minY;
        points.push(new Vertex(x, y));
    }
    let v = new voronoi();
    let bbox = {xl: 0, xr: width, yt: 0, yb: height};
    let diagram = relaxN(v, v.compute(points, bbox), bbox, nRelax);
    return generateTiles(polygons(diagram), width, height);
}

function getRegionStrings(regionTiles) {
    let strs = [];
    for (const region of regionTiles) {
        let str = '';
        for (let i = 0; i < region.getVertices().length; i++) {
            const vertex = region.getVertices()[i];
            str += vertex.x + ',' + vertex.y;
            if (i !== region.getVertices().length - 1) {
                str += ', ';
            }
        }
        strs.push(str);
    }
    return strs;
}

console.log(generate(width, height, 2000, 10).strs);
