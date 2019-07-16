let Point = require('../utils/Point');

class IslandSeedGenerator {
    constructor(n, width, height, centerWidthProp, centerHeightProp) {
        this.width = width;
        this.height = height;
        this.points = [];
        let centerWidth = centerWidthProp * width;
        let centerHeight = centerHeightProp * height;
        let minX = (width - centerWidth) / 2;
        let minY = (height - centerHeight) / 2;
        for (let i = 0; i < n; i++) {
            let x = (Math.random() * centerWidth) + minX;
            let y = (Math.random() * centerHeight) + minY;
            let point = new Point(x, y);
            this.points.push(point);
        }
    }

    distanceFunction() {
        function distance(p1, p2) {
            return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
        }

        return (x, y) => {
            let maxDist = distance(new Point(0, 0), new Point(this.width, this.height));
            let point = new Point(x, y);
            if (this.points.length > 0) {
                let currPoint = this.points[0];
                let currDist = distance(point, currPoint);
                let minDist = currDist;
                for (const pt of this.points) {
                    currDist = distance(point, pt);
                    if (currDist < minDist) {
                        minDist = currDist;
                    }
                }
                return 1 - Math.pow(minDist / maxDist, 0.3);
            }
            return null;
        };
    }
}

module.exports = IslandSeedGenerator;
