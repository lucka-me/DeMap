/**
 * Created by lucka on 3/22/2018.
 * Modified from source code of zhiyishou
 * @see https://github.com/zhiyishou/Polyer/blob/master/lib/delaunay.js
 * @author lucka-me
 */

// EPSILON is the smallest positive number and used in comparing.
var EPSILON = Number.EPSILON || Math.pow(2, -52);

function getDelaunay(pointList) {
    if (pointList.length < 3) return [];

    var tempPointList = pointList.concat();

    // Use index of points instead of points themselves
    var pointIndex = new Array(tempPointList.length);
    for (var i = 0; i < pointIndex.length; i++) pointIndex[i] = i;

    // Sort
    pointIndex.sort(function (a, b) {
        return tempPointList[a].x - tempPointList[b].x;
    });

    // Get the super triangle and add to tempPointList
    var superTriangle = getSuperTriangle(pointList);
    tempPointList.push(superTriangle.p0, superTriangle.p1, superTriangle.p2);
    var open = [getCircumcircle(tempPointList, {
            p0Index: pointIndex.length,
            p1Index: pointIndex.length + 1,
            p2Index: pointIndex.length + 2
        })];
    var closed = [];

    for (var i = 0; i < pointIndex.length; i++) {
        var currentIndex = pointIndex[i];
        var buffer = [];

        // Scan the circumcircle list
        for (var j = open.length - 1; j >= 0; j--) {
            var dx = tempPointList[currentIndex].x - open[j].center.x;
            if (dx > 0 && dx * dx > open[j].radius) {
                closed.push(open[j]);
                open.splice(j, 1);
                continue;
            }

            // Skip this point if it is outside this circumcircle
            var dy = tempPointList[currentIndex].y - open[j].center.y;
            if (dx * dx + dy * dy - open[j].radius > EPSILON) continue;

            // Add edges of this triangle to buffer
            buffer.push({
                startIndex: open[j].triangle.p0Index,
                endIndex: open[j].triangle.p1Index
            }, {
                startIndex: open[j].triangle.p1Index,
                endIndex: open[j].triangle.p2Index
            }, {
                startIndex: open[j].triangle.p2Index,
                endIndex: open[j].triangle.p0Index
            });
            open.splice(j, 1);

        }

        removeDuplicate(buffer)

        for (var j = 0; j < buffer.length; j++) {
            open.push(getCircumcircle(tempPointList, {
                p0Index: buffer[j].startIndex,
                p1Index: buffer[j].endIndex,
                p2Index: currentIndex
            }))
        }
    }

    for (var i = 0; i < open.length; i++) {
        closed.push(open[i]);
    }

    var result = [];
    for (var i = 0; i < closed.length; i++) {
        if (closed[i].triangle.p0Index < pointList.length &&
            closed[i].triangle.p1Index < pointList.length &&
            closed[i].triangle.p2Index < pointList.length) {
            result.push(closed[i].triangle)
        }
    }
    return result;
}

// Get the super triangle in the first step.
function getSuperTriangle(pointList) {
    var xmin = Number.POSITIVE_INFINITY;
    var ymin = xmin;
    var ymax = 0;
    var xmax = 0;
    for (var i = 0; i < pointList.length; i++) {
        xmin = pointList[i].x < xmin ? pointList[i].x : xmin;
        xmax = pointList[i].x > xmax ? pointList[i].x : xmax;
        ymin = pointList[i].y < ymin ? pointList[i].y : ymin;
        ymax = pointList[i].y > ymax ? pointList[i].y : ymax;
    }
    var xl = xmax - xmin;
    var yl = ymax - ymin;
    var xlh = xl / 2;

    return {
        p0: {x: xmin - xlh - 2, y: ymax + 1},
        p1: {x: xmin + xlh,     y: ymin - yl},
        p2: {x: xmax + xlh + 2, y: ymax + 1}
    };
}

function getCircumcircle(pointList, triangle) {
    var x1 = pointList[triangle.p0Index].x;
    var y1 = pointList[triangle.p0Index].y;
    var x2 = pointList[triangle.p1Index].x;
    var y2 = pointList[triangle.p1Index].y;
    var x3 = pointList[triangle.p2Index].x;
    var y3 = pointList[triangle.p2Index].y;
    var fabsy1y2 = Math.abs(y1 - y2);
    var fabsy2y3 = Math.abs(y2 - y3);
    var xc, yc, m1, m2, mx1, mx2, my1, my2;

    if (fabsy1y2 < EPSILON) {
        m2 = -((x3 - x2) / (y3 - y2));
        mx2 = (x2 + x3) / 2.0;
        my2 = (y2 + y3) / 2.0;
        xc = (x2 + x1) / 2.0;
        yc = m2 * (xc - mx2) + my2;
    } else if (fabsy2y3 < EPSILON) {
        m1 = -((x2 - x1) / (y2 - y1));
        mx1 = (x1 + x2) / 2.0;
        my1 = (y1 + y2) / 2.0;
        xc = (x3 + x2) / 2.0;
        yc = m1 * (xc - mx1) + my1;
    } else {
        m1 = -((x2 - x1) / (y2 - y1));
        m2 = -((x3 - x2) / (y3 - y2));
        mx1 = (x1 + x2) / 2.0;
        mx2 = (x2 + x3) / 2.0;
        my1 = (y1 + y2) / 2.0;
        my2 = (y2 + y3) / 2.0;
        xc = (m1 * mx1 - m2 * mx2 + my2 - my1) / (m1 - m2);
        yc = (fabsy1y2 > fabsy2y3) ? m1 * (xc - mx1) + my1 : m2 * (xc - mx2) + my2;
    }

    var dx = x2 - xc;
    var dy = y2 - yc;
    return {
        center: {x: xc, y: yc},
        radius: dx * dx + dy * dy,
        triangle: triangle
    };
}

function removeDuplicate(edgeIndex) {
    for (var i = edgeIndex.length - 1; i >= 0; i--) {
        for (var j = i - 1; j >= 0; j--) {

            if ((edgeIndex[i].startIndex == edgeIndex[j].startIndex &&
                 edgeIndex[i].endIndex == edgeIndex[j].endIndex) ||
                (edgeIndex[i].startIndex == edgeIndex[j].endIndex &&
                 edgeIndex[i].endIndex == edgeIndex[j].startIndex)) {
                edgeIndex.splice(i, 1);
                edgeIndex.splice(j, 1);
                i--;
                break;
            }
        }
    }
}
