/**
 * Created by lucka on 3/21/2018.
 * @author lucka-me
 */

var map;
var mapBounds;
var pointList = [];
var markerList = [];
var delaunay = [];
var polygonList = [];
var gradientList = [];
var elevationList = [];

function initMap() {
    var defaultCenter = {lat: 34.2651799, lng: 108.9435278};
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 10,
        center: defaultCenter,
        mapTypeId: "terrain",
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
    });
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
    mapBounds = map.getBounds();
    var northEast = mapBounds.getNorthEast();
    var southWest = mapBounds.getSouthWest();
    var boundWidth = northEast.lng() - southWest.lng();
    if (southWest < 0) {
        boundWidth += 360.0;
    }
    if (isConnerInclude) {
        pointList.push({x: 0.0, y: 0.0});
        pointList.push({x: 0.0, y: northEast.lat() - southWest.lat()});
        pointList.push({x: boundWidth, y: 0.0});
        pointList.push({x: boundWidth, y: northEast.lat() - southWest.lat()});
    }
    var boundHeight = northEast.lat() - southWest.lat();
    for (var i = pointList.length; i < pointNum; i++) {
        var newPointX = Math.random() * (northEast.lng() - southWest.lng());
        var newPointY = Math.random() * (northEast.lat() - southWest.lat());
        pointList.push({x: newPointX, y: newPointY});
    }
    for (var i = 0; i < pointList.length; i++) {
        var markerLng = southWest.lng() + pointList[i].x;
        var markerLat = southWest.lat() + pointList[i].y;
        if (markerLng > 360.0) markerLng -= 360.0;
        var marker = new google.maps.Marker({
            position: {lat: markerLat, lng: markerLng},
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 2
            },
            map: map
        });
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
        var p0Lng = southWest.lng() + pointList[delaunayList[i].p0Index].x;
        var p1Lng = southWest.lng() + pointList[delaunayList[i].p1Index].x;
        var p2Lng = southWest.lng() + pointList[delaunayList[i].p2Index].x;
        if (p0Lng > 360.0) p0Lng -= 360.0;
        if (p1Lng > 360.0) p1Lng -= 360.0;
        if (p2Lng > 360.0) p2Lng -= 360.0;
        var tri = [
            {lat: southWest.lat() + pointList[delaunayList[i].p0Index].y, lng: p0Lng},
            {lat: southWest.lat() + pointList[delaunayList[i].p1Index].y, lng: p1Lng},
            {lat: southWest.lat() + pointList[delaunayList[i].p2Index].y, lng: p2Lng}
        ];
        var poly = new google.maps.Polygon({
            path: tri,
            geodesic: true,
            strokeColor: '#CCC',
            strokeOpacity: 1.0,
            strokeWeight: 1,
            fillColor: '#F00',
            fillOpacity: 0.4,
            map: map
        });
        polygonList.push(poly);
    }
    document.getElementById("delaunayCount").innerHTML = "" + delaunayList.length + " delaunays"
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
    gradientList = getGradient(startHex, endHex, step);
    for (var i = 0; i < polygonList.length; i++) {
        polygonList[i].setOptions({
            strokeWeight: 0,
            strokeOpacity: 0.0,
            fillColor: "#" + gradientList[Math.floor(Math.random() * gradientList.length)],
            fillOpacity: 0.8
        })
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
        var center = getCircumcircle(pointList, delaunayList[i]).center;
        var centerLng = southWest.lng() + center.x;
        if (centerLng > 360.0) centerLng -= 360.0;
        var centerLocation = {lat: southWest.lat() + center.y, lng: centerLng};
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
    } else if (gradientList.length == 0) {
        alert("Please generate colors first.");
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
    var elevationStep = dElevation / gradientList.length;
    for (var i = 0; i < polygonList.length; i++) {
        if (elevationList[i]) {
            polygonList[i].setOptions({
                strokeWeight: 0,
                strokeOpacity: 0.0,
                fillColor: "#" + gradientList[Math.floor((elevationList[i].elevation - lowest) / elevationStep)],
                fillOpacity: 0.8
            })
        } else {
            polygonList[i].setOptions({
                strokeWeight: 0,
                strokeOpacity: 0.0,
                fillColor: "#" + gradientList[Math.floor(gradientList.length / 2)],
                fillOpacity: 0.8
            })
        }
    }
}

function generateElevationFillByOrder() {
    var elevationIndex = new Array(polygonList.length);
    for (var i = 0; i < elevationIndex.length; i++) elevationIndex[i] = i;
    elevationIndex.sort(function (a, b) {
        if (elevationList[a] && elevationList[b]) {
            return elevationList[a].elevation - elevationList[b].elevation;
        } else {
            return 0;
        }
    });
    var orderStep = elevationIndex.length / gradientList.length;
    var currentStep = 0;
    for (var i = 0; i < elevationIndex.length; i++) {
        if (i - currentStep * orderStep >= currentStep) {
            currentStep ++;
        }
        polygonList[elevationIndex[i]].setOptions({
            strokeWeight: 0,
            strokeOpacity: 0.0,
            fillColor: "#" + gradientList[currentStep],
            fillOpacity: 0.8
        })
    }
}

function generateSVG() {
    alert("Not finished yet, sorry. ∠( ᐛ 」∠)＿");
}

function generatePNG() {
    alert("Not finished yet, sorry. ∠( ᐛ 」∠)＿");
}

function clearPoints() {
    pointList = [];
    for (var i = 0; i < markerList.length; i++) {
        markerList[i].setMap(null);
    }
    markerList = [];
}

function clearDelaunay() {
    delaunayList = [];
    document.getElementById("delaunayCount").innerHTML = "";
    for (var i = 0; i < polygonList.length; i++) {
        polygonList[i].setMap(null);
    }
    polygonList = [];
}
