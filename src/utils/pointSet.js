class PointSet {
    constructor() {
        this.arr = [];
    }

    contains(point) {
        for (const v of this.arr) {
            if (this.equals(v, point)) {
                return true;
            }
        }
        return false;
    }

    add(point) {
        if (this.contains(point)) {
            return false;
        }
        this.arr.push(point);
    }

    equals(v1, v2) {
        return v1.x === v2.x && v1.y === v2.y;
    }
}

module.exports = PointSet;
