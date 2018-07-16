<h1 align=center><img src="./Resource/Banner.svg" alt="DeMap"></h1>

<p align="center">
  <a href="./CHANGELOG.md"><img alt="Version" src="https://img.shields.io/badge/version-1.0-brightgreen.svg"/></a>
  <a href="https://lucka.moe"><img alt="Author" src="https://img.shields.io/badge/author-Lucka-2578B5.svg"/></a>
  <a href="./LICENSE"><img alt="License" src="https://img.shields.io/badge/license-MIT-A31F34.svg"/></a><br>
  <img alt="Safari Support" src="https://img.shields.io/badge/safari-support-brightgreen.svg"/>
  <img alt="Chrome Support" src="https://img.shields.io/badge/chrome-support-brightgreen.svg"/>
  <img alt="FireFox Support" src="https://img.shields.io/badge/firefox-support-brightgreen.svg"/>
  <img alt="Edge Support" src="https://img.shields.io/badge/edge-broken-red.svg"/>
  <img alt="IE Support" src="https://img.shields.io/badge/ie-broken-red.svg"/>

</p>

<p align=center>
Generate Delaunay based on elevations of real world<br/>
<a href="http://lucka.moe/DeMap/" title="Demo">Demo</a>
</p>

## Functions
1. Generate random points in a selected area
2. Generate delaunay with the points
3. Fill the delaunay with gradient colors based on elevations
4. Generate SVG
5. [A special version](http://lucka.moe/DeMap/cn/) for China mainland
6. [A special version](http://lucka.moe/DeMap/baidu/) using Baidu Maps API

### Algorithm
The core algorithm of generating delaunay is modified from [zhiyishou's work](https://github.com/zhiyishou/Polyer/blob/master/lib/delaunay.js) which is based on [Bowyer–Watson algorithm](https://en.wikipedia.org/wiki/Bowyer–Watson_algorithm).

## Changelog
See [CHANGELOG.md](./CHANGELOG.md).

## TO-DO
- [ ] Optimize the algorithm of generating random points
- [ ] Edit the points manually
- [x] Generate PNG
- [ ] Clean the code of delaunay algorithm
- [x] Setting the width and height

## License
The source code are [licensed under MIT](./LICENSE).

Please notice that the Google API Key and Baidu API Key included in the source code is owned by [Lucka](https://github.com/lucka-me) and **ONLY** for public useage in [the demo pages](http://lucka.moe/DeMap/).
