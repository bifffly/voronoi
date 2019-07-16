let IslandSeedGenerator = require('./generators/IslandSeedGenerator');
let TileGenerator = require('./generators/TileGenerator');
let IslandGenerator = require('./generators/IslandGenerator');
let RegionGenerator = require('./generators/RegionGenerator');
let Draw = require('./Draw');

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
}

generate(5000, 5000, 0.15, 0.15, 0.4, 0.4, 5, 5000, 6, 30, 0.25, 3.5);
