/**
 * Created by lucka on 3/24/2018.
 * @author lucka-me
 */

function getSVGString(boundWidth, boundHeight, imgWidth, imgHeight, pointList, delaunayList, colorList) {
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

    return fileText;
}

function getSVGFile(boundWidth, boundHeight, imgWidth, imgHeight, pointList, delaunayList, colorList) {
    var svgString = getSVGString(boundWidth, boundHeight, imgWidth, imgHeight, pointList, delaunayList, colorList);
    // Generate file
    var file = new Blob(svgString, {type: "image/svg+xml"});
    return file;
}

function generateSVG() {
    if (pointList.length == 0 ||
        delaunayList.length == 0 ||
        polygonList.length == 0) {
        alert("Please generate points and delaunay first.");
        return;
    }
    // Get Size
    var northEast = mapBounds.getNorthEast();
    var southWest = mapBounds.getSouthWest();
    var boundWidth = northEast.lng() - southWest.lng();
    var boundHeight = northEast.lat() - southWest.lat();
    if (southWest < 0) {
        boundWidth += 360.0;
    }
    var imgWidth = document.getElementById("imgWidth").value;
    var imgHeight = document.getElementById("imgHeight").value;
    if (isNaN(imgWidth) || isNaN(imgHeight)) {
        alert("Size error");
        return;
    }
    // Get colorList from polygonList
    var colorList = [];
    for (var i = 0; i < polygonList.length; i++) {
        colorList.push(polygonList[i].get("fillColor"));
    }
    var file = getSVGFile(boundWidth, boundHeight, imgWidth, imgHeight, pointList, delaunayList, colorList);
    var element = document.createElement("a");
    element.href = window.URL.createObjectURL(file)
    element.download = "DeMap.svg";;
    element.style.display = "none";
    element.click();
}

function generatePNG() {
    if (pointList.length == 0 ||
        delaunayList.length == 0 ||
        polygonList.length == 0) {
        alert("Please generate points and delaunay first.");
        return;
    }
    // Get Size
    var northEast = mapBounds.getNorthEast();
    var southWest = mapBounds.getSouthWest();
    var boundWidth = northEast.lng() - southWest.lng();
    var boundHeight = northEast.lat() - southWest.lat();
    if (southWest < 0) {
        boundWidth += 360.0;
    }
    var imgWidth = document.getElementById("imgWidth").value;
    var imgHeight = document.getElementById("imgHeight").value;
    if (isNaN(imgWidth) || isNaN(imgHeight)) {
        alert("Size error");
        return;
    }
    // Get colorList from polygonList
    var colorList = [];
    for (var i = 0; i < polygonList.length; i++) {
        colorList.push(polygonList[i].get("fillColor"));
    }
    // Convert SVG to PNG
    //   Reference: http://techslides.com/demos/d3/convert-svg-png.html
    var svgFile = getSVGFile(boundWidth, boundHeight, imgWidth, imgHeight, pointList, delaunayList, colorList);
    var image = new Image;
    image.src = URL.createObjectURL(svgFile);
    image.onload = function() {
        var canvas = document.createElement("canvas");
        canvas.width = imgWidth;
        canvas.height = imgHeight;
        var context = canvas.getContext("2d");
        context.drawImage(image, 0, 0);
        var element = document.createElement("a");
        element.href = canvas.toDataURL("image/png");
        element.download = "DeMap.png";
        element.style.display = "none";
        element.click();
    }
}
