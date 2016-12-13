# Carwings Javascript API Library and Tools

This code is meant for interacting with the Nissan Leaf Carwings API. This API allows one to query a swath of information about the vehicle, some of it cached in the cloud and some pulled directly from the vehicle over its cellular connectivity. The API also allows modifying a limited set of vehicle states (AC on/off, charge start/stop).

It is written for [node.js](https://nodejs.org) and uses the [babel transpiler](https://babeljs.io) mainly for taking advantage of es6 modules and es8(?) async/await to make network ops more pleasant to work with.

## Getting Started

The code in `src` is the non-transpiled source, and in `lib` can be found the transpiled library that is ready to be `require()`'d directly from node >= ^6.9 (may work on older, but this is untested).

After cloning the code (and installing node.js) simply run `npm install` to install required dependencies.

## Development

There are currently a couple simple helper scripts defined in `package.json`:

- `npm run build` will transpile from `src` to `lib`
- `npm run bstart` will run the code from `src` directly using [babel-node](https://babeljs.io/docs/usage/cli/#babel-node) for a simplified dev cycle.

## License

MIT, yo.
