/**
 * Created by lucka on 3/24/2018.
 * @author lucka-me
 */

function getSVGFile(boundWidth, boundHeight, pointList, delaunayList, colorList) {
    var size = 1000;
    var fileText = [];
    // Header
    fileText.push("<?xml version=\"1.0\" standalone=\"no\"?>\n");
    fileText.push("<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">\n");
    fileText.push("<svg width=\"100%\" height=\"100%\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\">\n");

    // Delaunays
    for (var i = 0; i < delaunayList.length; i++) {
        fileText.push("<polygon points=\"" +
            pointList[delaunayList[i].p0Index].x / boundWidth * size +
            "," +
            (1 - pointList[delaunayList[i].p0Index].y / boundHeight) * size +
            " " +
            pointList[delaunayList[i].p1Index].x / boundWidth * size +
            "," +
            (1 - pointList[delaunayList[i].p1Index].y / boundHeight) * size +
            " " +
            pointList[delaunayList[i].p2Index].x / boundWidth * size +
            "," +
            (1 - pointList[delaunayList[i].p2Index].y / boundHeight) * size +
            "\" style=\"fill:" +
            colorList[i] +
            "; stroke:" +
            colorList[i] +
            "\"/>\n"
        )
    }

    // Footer
    fileText.push("</svg>\n");

    // Generate file
    var file = new Blob(fileText, {type: "image/svg+xml"});
    return file;
}
