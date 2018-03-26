<h1 align=center>DeMap</h1>

<p align="center">
  <a href="./CHANGELOG.md"><img alt="Version" src="https://img.shields.io/badge/version-0.1.2-green.svg"/></a>
  <a href="https://lucka.moe"><img alt="Author" src="https://img.shields.io/badge/author-Lucka-2578B5.svg"/></a>
  <a href="./LICENSE"><img alt="License" src="https://img.shields.io/badge/license-MIT-A31F34.svg"/></a><br>
  <img alt="Safari Support" src="https://img.shields.io/badge/safari-support-green.svg"/>
  <img alt="Chrome Support" src="https://img.shields.io/badge/chrome-support-green.svg"/>
  <img alt="Edge Support" src="https://img.shields.io/badge/edge-untested-orange.svg"/>
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

### Algorithm
The core algorithm of generating delaunay is modified from [zhiyishou's work](https://github.com/zhiyishou/Polyer/blob/master/lib/delaunay.js) which is based on [Bowyer–Watson algorithm](https://en.wikipedia.org/wiki/Bowyer–Watson_algorithm).

## Changelog
See [CHANGELOG.md](./CHANGELOG.md).

## TO-DO
- [ ] Optimize the algorithm of generating random points
- [ ] Edit the points manually
- [ ] Generate PNG
- [ ] Clean the code of delaunay algorithm

## License
The source code are [licensed under MIT](./LICENSE).

Please notice that the Google API Key included in the source code is owned by [Lucka](https://github.com/lucka-me) and **ONLY** for public useage in [the demo page](http://lucka.moe/DeMap/).
