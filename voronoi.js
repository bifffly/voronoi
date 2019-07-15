const {createCanvas} = require('canvas');
require('canvas-5-polyfill');
let voronoi = require('voronoi');
let ndarray = require('ndarray');
let SimplexNoise = require('simplex-noise');
let gen = new SimplexNoise();
let base64Img = require('base64-img');

const width = 600;
const height = 600;

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

    isEdge() {
        for (const vertex of this.polygon.vertices) {
            if (vertex.x === 0 || vertex.x === width || vertex.y === 0 || vertex.y === height) {
                return true;
            }
        }
        return false;
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

function draw(tiles, regions, width, height) {
    let canvas = createCanvas(width, height);
    let context = canvas.getContext('2d');
    context.lineWidth = 2;
    context.strokeStyle = color('water');
    for (const tile of tiles) {
        let region = new Path2D();
        let vertices = tile.getVertices();
        region.moveTo(vertices[0].x, vertices[0].y);
        for (let i = 1; i < vertices.length - 1; i++) {
            region.lineTo(vertices[i].x, vertices[i].y);
        }
        if (tile.isEdge()) {
            context.fillStyle = color('water');
        }
        else {
            context.fillStyle = color(tile.biome);
        }
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

function type(elevation) {
    if (elevation < 0.14) {
        return 'water';
    }
    return 'land';
}

function biome(elevation) {
    if (elevation < 0.13) {
        return 'water';
    }
    if (elevation < 0.18) {
        return 'beach';
    }
    if (elevation < 0.25) {
        return 'grass';
    }
    if (elevation < 0.3) {
        return 'forest'
    }
    if (elevation < 0.4) {
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

console.log(generate(width, height, 2000, 10).strs);
