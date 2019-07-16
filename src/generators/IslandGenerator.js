let SimplexNoise = require('simplex-noise');
let ndarray = require('ndarray');


class IslandGenerator {
    constructor(width, height, tiles, distanceFunction, noiseWeight, granularity) {
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
        this.tiles = tiles;
    }
}

module.exports = IslandGenerator;


