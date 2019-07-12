const {createCanvas} = require('canvas');
require('canvas-5-polyfill');
let voronoi = require('voronoi');
let ndarray = require('ndarray');
let SimplexNoise = require('simplex-noise');
let gen = new SimplexNoise();
let base64Img = require('base64-img');

class Tile {
    constructor(polygon, type, biome, elevation) {
        this.polygon = polygon;
        this.type = type;
        this.biome = biome;
        this.elevation = elevation;
    }

    getVertices() {
        return this.polygon.vertices;
    }
}

class VoronoiPolygon {
    constructor(cell) {
        let halfedges = cell.halfedges;
        let vertices = new VertexSet();
        for (const halfedge of halfedges) {
            vertices.add(new Vertex(halfedge.getStartpoint().x, halfedge.getStartpoint().y));
            vertices.add(new Vertex(halfedge.getEndpoint().x, halfedge.getEndpoint().y));
        }
        let vertexArr = vertices.arr;
        vertexArr.push(vertexArr[0]);
        this.vertices = vertexArr;

        this.area = 0;
        for (let i = 0; i < this.vertices.length - 1; i++) {
            this.area += ((this.vertices[i].x * this.vertices[i + 1].y) - (this.vertices[i + 1].x * this.vertices[i].y));
        }
        this.area /= -2;

        let cxSum = 0;
        let cySum = 0;
        for (let i = 0; i < this.vertices.length - 1; i++) {
            cxSum += ((this.vertices[i].x + this.vertices[i + 1].x) * ((this.vertices[i].x * this.vertices[i + 1].y) - (this.vertices[i + 1].x * this.vertices[i].y)));
            cySum += ((this.vertices[i].y + this.vertices[i + 1].y) * ((this.vertices[i].x * this.vertices[i + 1].y) - (this.vertices[i + 1].x * this.vertices[i].y)));
        }
        cxSum /= - (6 * this.area);
        cySum /= - (6 * this.area);
        this.centroid = ({x: cxSum, y: cySum});
    }
}

class Vertex {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class VertexSet {
    constructor() {
        this.arr = [];
    }

    contains(vertex) {
        for (const v of this.arr) {
            if (this.equals(v, vertex)) {
                return true;
            }
        }
        return false;
    }

    add(vertex) {
        if (this.contains(vertex)) {
            return false;
        }
        this.arr.push(vertex);
    }

    equals(v1, v2) {
        return v1.x === v2.x && v1.y === v2.y;
    }
}

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
        const voronoiPolygon = new VoronoiPolygon(cell);
        centroids.push(voronoiPolygon.centroid);
    }
    return centroids;
}

function relaxN(voronoi, diagram, bbox, n) {
    for (let i = 0; i < n; i++) {
        diagram = voronoi.compute(relax(diagram), bbox);
    }
    return diagram;
}

function draw(tiles, width, height) {
    let canvas = createCanvas(width, height);
    let context = canvas.getContext('2d');
    context.lineWidth = 2;
    for (const tile of tiles) {
        let region = new Path2D();
        let vertices = tile.getVertices();
        region.moveTo(vertices[0].x, vertices[0].y);
        for (let i = 1; i < vertices.length - 1; i++) {
            region.lineTo(vertices[i].x, vertices[i].y);
        }
        context.fillStyle = color(tile.biome);
        context.fill(region);
    }
    base64Img.img(canvas.toDataURL(), 'images', 'image', (err, filepath) => {
        console.log('Saved');
    });
}

function polygons(diagram) {
    let polygons = [];
    for (const cell of diagram.cells) {
        polygons.push(new VoronoiPolygon(cell));
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
        let tileType = type(elevation);
        let tileBiome = biome(elevation);
        tiles.push(new Tile(polygon, tileType, tileBiome, elevation));
    }
    return tiles;
}

function generate(width, height, n, nRelax) {
    let tiles = generateTiles(generatePolygons(width, height, n, nRelax), width, height);
    return draw(tiles, width, height);
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
            let noise = noiseAt(nx, ny);
            let dist = distance(x, y, width, height);
            let maxDist = Math.max(width / 2, height / 2);
            let distPct = dist / maxDist;
            // noise = (0.45 * noise) + (0.55 * Math.pow(distPct, 2.5));
            elevation.set(x, y, noise);
        }
    }
    return elevation;
}

function type(elevation) {
    if (elevation < 0.33) {
        return 'water';
    }
    return 'land';
}

function biome(elevation) {
    if (elevation < 0.33) {
        return 'water';
    }
    if (elevation < 0.38) {
        return 'beach';
    }
    if (elevation < 0.55) {
        return 'grass';
    }
    if (elevation < 0.7) {
        return 'forest'
    }
    if (elevation < 0.8) {
        return 'tundra';
    }
    if (elevation < 1) {
        return 'snow';
    }
    return null;
}

function color(biome) {
    if (biome === 'water') {
        return 'rgb(67, 67, 122)';
    }
    if (biome === 'beach') {
        return 'rgb(210, 185, 139)';
    }
    if (biome === 'grass') {
        return 'rgb(136, 171, 85)';
    }
    if (biome === 'forest') {
        return 'rgb(67, 136, 85)'
    }
    if (biome === 'tundra') {
        return 'rgb(136, 153, 119)';
    }
    if (biome === 'snow') {
        return 'rgb(222, 222, 229)';
    }
    return null;
}

generate(600, 600, 300, 5);
