"use strict";

exports.__esModule = true;
exports.memoryMiddlewareFactory = memoryMiddlewareFactory;
// a simple in-memory cache for resources
var cache = {};

function memoryMiddlewareFactory() {
    return function memoryMiddleware(resource, next) {
        var _this = this;

        // if cached, then set data and complete the resource
        if (cache[resource.url]) {
            resource.data = cache[resource.url];
            resource.complete(); // marks resource load complete and stops processing before middlewares
        }
        // if not cached, wait for complete and store it in the cache.
        else {
                resource.onComplete.once(function () {
                    return cache[_this.url] = _this.data;
                });
            }

        next();
    };
}
//# sourceMappingURL=memory.js.map