/**
 * Created by lucka on 04/07/2018.
 * @author lucka-me
 */

var map;
var mapBounds;
var pointList = [];
var markerList = [];
var delaunay = [];
var polygonList = [];
var elevationList = [];

function initMap() {
    var defaultCenter = new BMap.Point(108.9435278, 34.2651799);
    map = new BMap.Map("map");
    map.addControl(new BMap.NavigationControl());
    map.centerAndZoom(defaultCenter, 10);
}

function generatePoints() {
    clearPoints();
    clearDelaunay();
    var pointNum = parseInt(document.getElementById("pointNumInput").value);
    if (isNaN(pointNum)) {
        alert("Input type error");
        return;
    }
    if (pointNum < 3) {
        alert("Too less points, 3 at least.");
    }
    var isConnerInclude = document.getElementById("isIncludingConners").checked;
    var isPreventTooClose = document.getElementById("isPreventTooClose").checked;
    mapBounds = map.getBounds();
    var northEast = mapBounds.getNorthEast();
    var southWest = mapBounds.getSouthWest();
    var boundWidth = northEast.lng - southWest.lng;
    if (southWest < 0) {
        boundWidth += 360.0;
    }
    if (isConnerInclude) {
        pointList.push({x: 0.0, y: 0.0});
        pointList.push({x: 0.0, y: northEast.lat - southWest.lat});
        pointList.push({x: boundWidth, y: 0.0});
        pointList.push({x: boundWidth, y: northEast.lat - southWest.lat});
    }
    var boundHeight = northEast.lat - southWest.lat;
    // Prevent generating points that too close
    var closeCircleRadiusSquare = boundWidth * boundWidth / (4 * pointNum);
    for (var i = pointList.length; i < pointNum; i++) {
        var newPointX = Math.random() * (northEast.lng - southWest.lng);
        var newPointY = Math.random() * (northEast.lat - southWest.lat);
        if (isPreventTooClose) {
            var isTooClose = false;
            for (var j = 0; j < pointList.length; j++) {
                var dx = newPointX - pointList[j].x;
                var dy = newPointY - pointList[j].y;
                if (dx * dx + dy * dy < closeCircleRadiusSquare) {
                    isTooClose = true;
                    break;
                }
            }
            if (!isTooClose) {
                pointList.push({x: newPointX, y: newPointY});
            }
        } else {
            pointList.push({x: newPointX, y: newPointY});
        }

    }
    for (var i = 0; i < pointList.length; i++) {
        var markerLng = southWest.lng + pointList[i].x;
        var markerLat = southWest.lat + pointList[i].y;
        if (markerLng > 360.0) markerLng -= 360.0;
        var point = new BMap.Point(markerLng, markerLat);
        console.log("lat: " + point.lat + " lng: " + point.lng);
        var marker = new BMap.Marker(point);
        map.addOverlay(marker);
        markerList.push(marker);
    }
}

function generateDelaunay() {
    clearDelaunay();
    if (pointList.length == 0) {
        alert("Please generate points first.");
        return;
    }
    delaunayList = getDelaunay(pointList);
    var southWest = mapBounds.getSouthWest();
    for (var i = 0; i < delaunayList.length; i++) {
        var p0Lng = southWest.lng + pointList[delaunayList[i].p0Index].x;
        var p1Lng = southWest.lng + pointList[delaunayList[i].p1Index].x;
        var p2Lng = southWest.lng + pointList[delaunayList[i].p2Index].x;
        if (p0Lng > 360.0) p0Lng -= 360.0;
        if (p1Lng > 360.0) p1Lng -= 360.0;
        if (p2Lng > 360.0) p2Lng -= 360.0;
        var poly = new BMap.Polygon([
            new BMap.Point(p0Lng, southWest.lat + pointList[delaunayList[i].p0Index].y),
            new BMap.Point(p1Lng, southWest.lat + pointList[delaunayList[i].p1Index].y),
            new BMap.Point(p2Lng, southWest.lat + pointList[delaunayList[i].p2Index].y)
        ], {
            strokeColor: '#CCC',
            strokeWeight: 1,
            fillColor: '#F00',
            fillOpacity: 0.4,
        });
        map.addOverlay(poly);
        polygonList.push(poly);
    }
    document.getElementById("delaunayCount").innerHTML = delaunayList.length + " delaunays"
}

function generateColor() {
    if (pointList.length == 0 || polygonList.length == 0) {
        alert("Please generate points and delaunay first.");
        return;
    }
    var startHex = document.getElementById("colorStart").value;
    var endHex = document.getElementById("colorEnd").value;
    var step = parseInt(document.getElementById("colorStep").value);
    if (!isHex(startHex)) {
        alert("Start color \"" + startHex + "\" is invalid.")
        return
    }
    if (!isHex(endHex)) {
        alert("End color \"" + endHex + "\" is invalid.")
        return
    }
    for (var i = 0; i < polygonList.length; i++) {
        var percentage = (step == 0) ? Math.random() : (Math.floor(Math.random() * (step + 1)) / step);
        polygonList[i].setFillColor("#" + getGradient(startHex, endHex, percentage));
        polygonList[i].setFillOpacity(0.8);
        polygonList[i].setStrokeOpacity(0.0);
        polygonList[i].setStrokeWeight(0);
    }
}

function getElevation() {
    if (pointList.length == 0 || polygonList.length == 0) {
        alert("Please generate points and delaunay first.");
        return;
    } else if (delaunayList.length > 512) {
        alert("Too many delaunays, the maximum is 512 but you have" + delaunayList.length + ".");
        return;
    }
    var centerLocationList = [];
    var southWest = mapBounds.getSouthWest();
    for (var i = 0; i < delaunayList.length; i++) {
        var center = getCenter(pointList, delaunayList[i]);
        var centerLng = southWest.lng + center.x;
        if (centerLng > 360.0) centerLng -= 360.0;
        var centerLocation = {lat: southWest.lat + center.y, lng: centerLng};
        centerLocationList.push(centerLocation);
    }
    var elevationService = new google.maps.ElevationService;
    elevationService.getElevationForLocations({
        "locations": centerLocationList
    }, function(results, status) {
        if (status != "OK") {
            alert("Elevation service failed due to: " + status);
            return;
        }
        elevationList = results;
        generateElevationFill();
    });
}

function generateElevationFill() {
    if (pointList.length == 0 || polygonList.length == 0) {
        alert("Please generate points and delaunay first.");
        return;
    } else if (elevationList.length == 0) {
        alert("Please get elevations first.");
        return;
    }
    var elevationStepTypeRadioList = document.getElementsByName("elevationStepType");
    var elevationStepType;
    for(var i = 0; i < elevationStepTypeRadioList.length; i++){
        if(elevationStepTypeRadioList[i].checked){
            elevationStepType = elevationStepTypeRadioList[i].value;
        }
    }
    if (elevationStepType === "order") {
        generateElevationFillByOrder();
    } else {
        generateElevationFillByHeight();
    }

}

function generateElevationFillByHeight() {
    var startHex = document.getElementById("colorStart").value;
    var endHex = document.getElementById("colorEnd").value;
    var step = parseInt(document.getElementById("colorStep").value);
    if (!isHex(startHex)) {
        alert("Start color \"" + startHex + "\" is invalid.")
        return
    }
    if (!isHex(endHex)) {
        alert("End color \"" + endHex + "\" is invalid.")
        return
    }
    var highest, lowest;
    for (var i = 0; i < elevationList.length; i++) {
        if(elevationList[i]) {
            highest = elevationList[i].elevation;
            lowest = highest;
            break;
        }
    }
    for (var i = 0; i < elevationList.length; i++) {
        if(elevationList[i]) {
            if (highest < elevationList[i].elevation) highest = elevationList[i].elevation;
            if (lowest > elevationList[i].elevation) lowest = elevationList[i].elevation;
        }
    }
    var dElevation = highest - lowest;
    for (var i = 0; i < polygonList.length; i++) {
        var percentage = elevationList[i] ?
            ((step == 0) ?
                elevationList[i].elevation / dElevation :
                (Math.floor(elevationList[i].elevation / dElevation * (step + 1)) / step)) :
            Math.random();
        polygonList[i].setFillColor("#" + getGradient(startHex, endHex, percentage));
        polygonList[i].setFillOpacity(0.8);
        polygonList[i].setStrokeOpacity(0.0);
        polygonList[i].setStrokeWeight(0);
    }
}

function generateElevationFillByOrder() {
    var startHex = document.getElementById("colorStart").value;
    var endHex = document.getElementById("colorEnd").value;
    var step = parseInt(document.getElementById("colorStep").value);
    if (!isHex(startHex)) {
        alert("Start color \"" + startHex + "\" is invalid.")
        return
    }
    if (!isHex(endHex)) {
        alert("End color \"" + endHex + "\" is invalid.")
        return
    }
    var elevationIndex = new Array(polygonList.length);
    for (var i = 0; i < elevationIndex.length; i++) elevationIndex[i] = i;
    elevationIndex.sort(function (a, b) {
        if (elevationList[a] && elevationList[b]) {
            return elevationList[a].elevation - elevationList[b].elevation;
        } else {
            return 0;
        }
    });
    for (var i = 0; i < elevationIndex.length; i++) {
        var percentage = (step == 0) ?
            (i / elevationIndex.length) :
            (Math.floor(i / elevationIndex.length * (step + 1)) / step);
        polygonList[elevationIndex[i]].setFillColor("#" + getGradient(startHex, endHex, percentage));
        polygonList[elevationIndex[i]].setFillOpacity(0.8);
        polygonList[elevationIndex[i]].setStrokeOpacity(0.0);
        polygonList[elevationIndex[i]].setStrokeWeight(0);
    }
}

function generateSVG() {
    if (pointList.length == 0 ||
        delaunayList.length == 0 ||
        polygonList.length == 0) {
        alert("Please generate points and delaunay first.");
        return;
    }
    // Get boundWidth
    var northEast = mapBounds.getNorthEast();
    var southWest = mapBounds.getSouthWest();
    var boundWidth = northEast.lng - southWest.lng;
    var boundHeight = northEast.lat - southWest.lat;
    if (southWest < 0) {
        boundWidth += 360.0;
    }
    // Get colorList from polygonList
    var colorList = [];
    for (var i = 0; i < polygonList.length; i++) {
        colorList.push(polygonList[i].getFillColor());
    }
    var file = getSVGFile(boundWidth, boundHeight, pointList, delaunayList, colorList);
    var downloadButton = document.getElementById("downloadFile");
    downloadButton.href = window.URL.createObjectURL(file);
    downloadButton.download = "DeMap.svg";
    downloadButton.className = "button";
    downloadButton.style.display = "inline-block";
}

function generatePNG() {
    if (pointList.length == 0 ||
        delaunayList.length == 0 ||
        polygonList.length == 0) {
        alert("Please generate points and delaunay first.");
        return;
    }
    // Get size
    var size = parseInt(document.getElementById("pngSize").value);
    if (isNaN(size)) {
        alert("Graphic size error");
        return;
    }
    alert("Not finished yet, sorry. ∠( ᐛ 」∠)＿");
}

function clearPoints() {
    pointList = [];
    for (var i = 0; i < markerList.length; i++) {
        map.removeOverlay(markerList[i]);
    }
    markerList = [];
}

function clearDelaunay() {
    delaunayList = [];
    document.getElementById("delaunayCount").innerHTML = "";
    for (var i = 0; i < polygonList.length; i++) {
        map.removeOverlay(polygonList[i]);
    }
    polygonList = [];
}
