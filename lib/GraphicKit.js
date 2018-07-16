/**
 * Created by lucka on 3/24/2018.
 * @author lucka-me
 */

function getSVGFile(boundWidth, boundHeight, imgWidth, imgHeight, pointList, delaunayList, colorList) {
    var fileText = [];
    // Header
    fileText.push("<?xml version=\"1.0\" standalone=\"no\"?>\n");
    fileText.push("<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">\n");
    fileText.push("<svg width=\"" + imgWidth + "px\" height=\"" + imgHeight + "px\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\">\n");

    // Prevent the gaps between polygons
    for (var i = 0; i < delaunayList.length; i++) {
        fileText.push("<polygon points=\"" +
            pointList[delaunayList[i].p0Index].x / boundWidth * imgWidth +
            "," +
            (1 - pointList[delaunayList[i].p0Index].y / boundHeight) * imgHeight +
            " " +
            pointList[delaunayList[i].p1Index].x / boundWidth * imgWidth +
            "," +
            (1 - pointList[delaunayList[i].p1Index].y / boundHeight) * imgHeight +
            " " +
            pointList[delaunayList[i].p2Index].x / boundWidth * imgWidth +
            "," +
            (1 - pointList[delaunayList[i].p2Index].y / boundHeight) * imgHeight +
            "\" style=\"stroke:" +
            colorList[i] +
            ";\"/>\n"
        )
    }

    // Delaunays
    for (var i = 0; i < delaunayList.length; i++) {
        fileText.push("<polygon points=\"" +
            pointList[delaunayList[i].p0Index].x / boundWidth * imgWidth +
            "," +
            (1 - pointList[delaunayList[i].p0Index].y / boundHeight) * imgHeight +
            " " +
            pointList[delaunayList[i].p1Index].x / boundWidth * imgWidth +
            "," +
            (1 - pointList[delaunayList[i].p1Index].y / boundHeight) * imgHeight +
            " " +
            pointList[delaunayList[i].p2Index].x / boundWidth * imgWidth +
            "," +
            (1 - pointList[delaunayList[i].p2Index].y / boundHeight) * imgHeight +
            "\" style=\"fill:" +
            colorList[i] +
            "; stroke:" +
            colorList[i] +
            "; stroke-width:0\"/>\n"
        )
    }

    // Footer
    fileText.push("</svg>\n");

    // Generate file
    var file = new Blob(fileText, {type: "image/svg+xml"});
    return file;
}
