class Tile {
    constructor(polygon, imageWidth, imageHeight) {
        this.polygon = polygon;
        this.centroid = polygon.centroid;
        this.vertices = polygon.vertices;
        this.elev = 0;
    }

    setElev(elev) {
        this.elev = elev;
    }
    
    getBiome() {
        if (this.elev < 0.35) {
            return 'water';
        }
        if (this.elev < 0.4) {
            return 'beach';
        }
        if (this.elev < 0.5) {
            return 'grass';
        }
        if (this.elev < 0.6) {
            return 'forest'
        }
        if (this.elev < 0.7) {
            return 'tundra';
        }
        if (this.elev < 1) {
            return 'snow';
        }
        return null;
    }
    
    getColor() {
        let biome = this.getBiome();
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
}

module.exports = Tile;
