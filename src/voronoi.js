let IslandSeedGenerator = require('./generators/IslandSeedGenerator');
let TileGenerator = require('./generators/TileGenerator');
let IslandGenerator = require('./generators/IslandGenerator');

let islandSeedGen = new IslandSeedGenerator(50, 5000, 5000, 1, 1);
let distance = islandSeedGen.distanceFunction();
let tileGen = new TileGenerator(5000, 5000, 5000, 30);
let tiles = tileGen.tiles;
let islandGen = new IslandGenerator(5000, 5000, tiles, distance, 0.5, 10);
islandGen.draw();
