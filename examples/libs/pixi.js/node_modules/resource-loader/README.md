# Resource Loader [![Build Status](https://travis-ci.org/englercj/resource-loader.svg?branch=master)](https://travis-ci.org/englercj/resource-loader)

A generic resource loader, made with web games in mind.

## Usage

```js
// ctor
const loader = new Loader();

loader
    // Chainable `add` to enqueue a resource
    .add(name, url, options)

    // Chainable `pre` to add a middleware that runs for each resource, *before* loading that resource.
    // This is useful to implement custom caching modules (using filesystem, indexeddb, memory, etc).
    .pre(cachingMiddleware)

    // Chainable `use` to add a middleware that runs for each resource, *after* loading that resource.
    // This is useful to implement custom parsing modules (like spritesheet parsers, spine parser, etc).
    .use(parsingMiddleware)

    // The `load` method loads the queue of resources, and calls the passed in callback called once all
    // resources have loaded.
    .load((loader, resources) => {
        // resources is an object where the key is the name of the resource loaded and the value is the resource object.
        // They have a couple default properties:
        // - `url`: The URL that the resource was loaded from
        // - `error`: The error that happened when trying to load (if any)
        // - `data`: The raw data that was loaded
        // also may contain other properties based on the middleware that runs.
    });

// throughout the process multiple signals can be dispatched.
loader.onProgress.add(() => {}); // called once per loaded/errored file
loader.onError.add(() => {}); // called once per errored file
loader.onLoad.add(() => {}); // called once per loaded file
loader.onComplete.add(() => {}); // called once when the queued resources all load.
```

## Building

You will need to have [node][node] and [gulp][gulp] setup on your machine.

Then you can install dependencies and build:

```js
npm i && npm run build
```

That will output the built distributables to `./dist`.

[node]:       http://nodejs.org/
[gulp]:       http://gulpjs.com/

## Supported Browsers

- IE 9+
- FF 13+
- Chrome 20+
- Safari 6+
- Opera 12.1+

## Upgrading to v2

- No more events, all signals now
- No more isJson, isXml, etc. Now use `res.type === Resource.TYPE.JSON`, etc.
- Removed `before` (in favor of `pre`) and `after` (in favor of `use`).
- If a middleware adds more resources, it *must* pass in the parent resource in options for `.add()`.
