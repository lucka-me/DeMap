/**
 * Created by lucka on 3/23/2018.
 * Most of the algorithms and methods are from the Internet.
 * @see https://stackoverflow.com/questions/8027423/
 * @see https://stackoverflow.com/questions/5623838/
 * @author lucka-me
 */

function getGradient(startHex, endHex, percentage) {
    var startRGB = getRGB(startHex);
    var endRGB = getRGB(endHex);
    return getHex({
        r: Math.round(startRGB.r + (endRGB.r - startRGB.r) * percentage),
        g: Math.round(startRGB.g + (endRGB.g - startRGB.g) * percentage),
        b: Math.round(startRGB.b + (endRGB.b - startRGB.b) * percentage)
    })
}

function isHex(string) {
    var reg = /(^[0-9a-fA-F]{6}$)|(^[0-9a-fA-F]{3}$)/;
    return string && reg.test(string);
}

function getRGB(hex) {
    // Transform short hex to full
    var shorthandRegex = /^([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function getHex(rgb) {
    return ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b)
        .toString(16).slice(1);
}
