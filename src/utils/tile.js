class Tile {
    constructor(polygon, elevation, imageWidth, imageHeight) {
        this.polygon = polygon;
        this.elev = elevation;
        this.width = imageWidth;
        this.height = imageHeight;
    }

    getVertices() {
        return this.polygon.vertices;
    }

    isEdge() {
        for (const vertex of this.polygon.vertices) {
            if (vertex.x === 0 || vertex.x === this.width || vertex.y === 0 || vertex.y === this.height) {
                return true;
            }
        }
        return false;
    }
    
    getBiome() {
        if (this.elev < 0.13) {
            return 'water';
        }
        if (this.elev < 0.18) {
            return 'beach';
        }
        if (this.elev < 0.25) {
            return 'grass';
        }
        if (this.elev < 0.3) {
            return 'forest'
        }
        if (this.elev < 0.4) {
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
