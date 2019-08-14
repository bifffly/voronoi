let fs = require('fs');

let IslandSeedGenerator = require('./generators/IslandSeedGenerator');
let TileGenerator = require('./generators/TileGenerator');
let IslandGenerator = require('./generators/IslandGenerator');
let RegionGenerator = require('./generators/RegionGenerator');
let Draw = require('./utils/Draw');

function toStr(regions) {
    let strs = '[';
    for (let i = 0; i < regions.length; i++) {
        let region = regions[i];
        let str = '[';
        for (let j = 0; j < region.vertices.length - 1; j++) {
            let point = region.vertices[j];
            str += point.x + ',' + point.y;
            if (j !== region.vertices.length - 2) {
                str += ', ';
            }
        }
        str += ']';
        if (i !== regions.length - 1) {
            str += ', ';
        }
        strs += str;
    }
    strs += ']';
    return strs;
}

function generate(width, height, seedWidthProp, seedHeightProp, regionWidthProp, regionHeightProp,
                  nSeeds, nTiles,  nRegions, nRelax, noiseWeight, granularity) {
    let islandSeedGen = new IslandSeedGenerator(nSeeds, width, height, seedWidthProp, seedHeightProp);
    let distance = islandSeedGen.distanceFunction();
    let tileGen = new TileGenerator(nTiles, width, height, nRelax);
    let tiles = tileGen.tiles;
    let islandGen = new IslandGenerator(width, height, tiles, distance, noiseWeight, granularity);
    tiles = islandGen.tiles;
    let regionGen = new RegionGenerator(nRegions, width, height, regionWidthProp, regionHeightProp);
    let regions = regionGen.polygons;
    let draw = new Draw(tiles, regions, width, height);
    draw.draw();
    fs.writeFile('../bounds/tutorials/' + draw.name + '.txt', toStr(regions), (err) => {
        if (err) {
            console.log(err);
        }
    });
}

for (let i = 0; i < 10; i++) {
    generate(600, 600, 0.15, 0.15, 0.4, 0.4, 5, 600, 4, 30, 0.25, 3.5);
}
