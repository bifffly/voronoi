let Vertex = require('./point');
let VertexSet = require('./pointSet');

class Polygon {
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

module.exports = Polygon;
