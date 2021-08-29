'use strict';

exports.__esModule = true;
exports.Resource = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _parseUri = require('parse-uri');

var _parseUri2 = _interopRequireDefault(_parseUri);

var _miniSignals = require('mini-signals');

var _miniSignals2 = _interopRequireDefault(_miniSignals);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// tests if CORS is supported in XHR, if not we need to use XDR
var useXdr = !!(window.XDomainRequest && !('withCredentials' in new XMLHttpRequest()));
var tempAnchor = null;

// some status constants
var STATUS_NONE = 0;
var STATUS_OK = 200;
var STATUS_EMPTY = 204;
var STATUS_IE_BUG_EMPTY = 1223;
var STATUS_TYPE_OK = 2;

// noop
function _noop() {} /* empty */

/**
 * Manages the state and loading of a resource and all child resources.
 *
 * @class
 */

var Resource = exports.Resource = function () {
    /**
     * Sets the load type to be used for a specific extension.
     *
     * @static
     * @param {string} extname - The extension to set the type for, e.g. "png" or "fnt"
     * @param {Resource.LOAD_TYPE} loadType - The load type to set it to.
     */
    Resource.setExtensionLoadType = function setExtensionLoadType(extname, loadType) {
        setExtMap(Resource._loadTypeMap, extname, loadType);
    };

    /**
     * Sets the load type to be used for a specific extension.
     *
     * @static
     * @param {string} extname - The extension to set the type for, e.g. "png" or "fnt"
     * @param {Resource.XHR_RESPONSE_TYPE} xhrType - The xhr type to set it to.
     */


    Resource.setExtensionXhrType = function setExtensionXhrType(extname, xhrType) {
        setExtMap(Resource._xhrTypeMap, extname, xhrType);
    };

    /**
     * @param {string} name - The name of the resource to load.
     * @param {string|string[]} url - The url for this resource, for audio/video loads you can pass
     *      an array of sources.
     * @param {object} [options] - The options for the load.
     * @param {string|boolean} [options.crossOrigin] - Is this request cross-origin? Default is to
     *      determine automatically.
     * @param {number} [options.timeout=0] - A timeout in milliseconds for the load. If the load takes
     *      longer than this time it is cancelled and the load is considered a failure. If this value is
     *      set to `0` then there is no explicit timeout.
     * @param {Resource.LOAD_TYPE} [options.loadType=Resource.LOAD_TYPE.XHR] - How should this resource
     *      be loaded?
     * @param {Resource.XHR_RESPONSE_TYPE} [options.xhrType=Resource.XHR_RESPONSE_TYPE.DEFAULT] - How
     *      should the data being loaded be interpreted when using XHR?
     * @param {Resource.IMetadata} [options.metadata] - Extra configuration for middleware and the Resource object.
     */


    function Resource(name, url, options) {
        _classCallCheck(this, Resource);

        if (typeof name !== 'string' || typeof url !== 'string') {
            throw new Error('Both name and url are required for constructing a resource.');
        }

        options = options || {};

        /**
         * The state flags of this resource.
         *
         * @private
         * @member {number}
         */
        this._flags = 0;

        // set data url flag, needs to be set early for some _determineX checks to work.
        this._setFlag(Resource.STATUS_FLAGS.DATA_URL, url.indexOf('data:') === 0);

        /**
         * The name of this resource.
         *
         * @readonly
         * @member {string}
         */
        this.name = name;

        /**
         * The url used to load this resource.
         *
         * @readonly
         * @member {string}
         */
        this.url = url;

        /**
         * The extension used to load this resource.
         *
         * @readonly
         * @member {string}
         */
        this.extension = this._getExtension();

        /**
         * The data that was loaded by the resource.
         *
         * @member {any}
         */
        this.data = null;

        /**
         * Is this request cross-origin? If unset, determined automatically.
         *
         * @member {string}
         */
        this.crossOrigin = options.crossOrigin === true ? 'anonymous' : options.crossOrigin;

        /**
         * A timeout in milliseconds for the load. If the load takes longer than this time
         * it is cancelled and the load is considered a failure. If this value is set to `0`
         * then there is no explicit timeout.
         *
         * @member {number}
         */
        this.timeout = options.timeout || 0;

        /**
         * The method of loading to use for this resource.
         *
         * @member {Resource.LOAD_TYPE}
         */
        this.loadType = options.loadType || this._determineLoadType();

        /**
         * The type used to load the resource via XHR. If unset, determined automatically.
         *
         * @member {string}
         */
        this.xhrType = options.xhrType;

        /**
         * Extra info for middleware, and controlling specifics about how the resource loads.
         *
         * Note that if you pass in a `loadElement`, the Resource class takes ownership of it.
         * Meaning it will modify it as it sees fit.
         *
         * @member {Resource.IMetadata}
         */
        this.metadata = options.metadata || {};

        /**
         * The error that occurred while loading (if any).
         *
         * @readonly
         * @member {Error}
         */
        this.error = null;

        /**
         * The XHR object that was used to load this resource. This is only set
         * when `loadType` is `Resource.LOAD_TYPE.XHR`.
         *
         * @readonly
         * @member {XMLHttpRequest}
         */
        this.xhr = null;

        /**
         * The child resources this resource owns.
         *
         * @readonly
         * @member {Resource[]}
         */
        this.children = [];

        /**
         * The resource type.
         *
         * @readonly
         * @member {Resource.TYPE}
         */
        this.type = Resource.TYPE.UNKNOWN;

        /**
         * The progress chunk owned by this resource.
         *
         * @readonly
         * @member {number}
         */
        this.progressChunk = 0;

        /**
         * The `dequeue` method that will be used a storage place for the async queue dequeue method
         * used privately by the loader.
         *
         * @private
         * @member {function}
         */
        this._dequeue = _noop;

        /**
         * Used a storage place for the on load binding used privately by the loader.
         *
         * @private
         * @member {function}
         */
        this._onLoadBinding = null;

        /**
         * The timer for element loads to check if they timeout.
         *
         * @private
         * @member {number}
         */
        this._elementTimer = 0;

        /**
         * The `complete` function bound to this resource's context.
         *
         * @private
         * @member {function}
         */
        this._boundComplete = this.complete.bind(this);

        /**
         * The `_onError` function bound to this resource's context.
         *
         * @private
         * @member {function}
         */
        this._boundOnError = this._onError.bind(this);

        /**
         * The `_onProgress` function bound to this resource's context.
         *
         * @private
         * @member {function}
         */
        this._boundOnProgress = this._onProgress.bind(this);

        /**
         * The `_onTimeout` function bound to this resource's context.
         *
         * @private
         * @member {function}
         */
        this._boundOnTimeout = this._onTimeout.bind(this);

        // xhr callbacks
        this._boundXhrOnError = this._xhrOnError.bind(this);
        this._boundXhrOnTimeout = this._xhrOnTimeout.bind(this);
        this._boundXhrOnAbort = this._xhrOnAbort.bind(this);
        this._boundXhrOnLoad = this._xhrOnLoad.bind(this);

        /**
         * Dispatched when the resource beings to load.
         *
         * The callback looks like {@link Resource.OnStartSignal}.
         *
         * @member {Signal}
         */
        this.onStart = new _miniSignals2.default();

        /**
         * Dispatched each time progress of this resource load updates.
         * Not all resources types and loader systems can support this event
         * so sometimes it may not be available. If the resource
         * is being loaded on a modern browser, using XHR, and the remote server
         * properly sets Content-Length headers, then this will be available.
         *
         * The callback looks like {@link Resource.OnProgressSignal}.
         *
         * @member {Signal}
         */
        this.onProgress = new _miniSignals2.default();

        /**
         * Dispatched once this resource has loaded, if there was an error it will
         * be in the `error` property.
         *
         * The callback looks like {@link Resource.OnCompleteSignal}.
         *
         * @member {Signal}
         */
        this.onComplete = new _miniSignals2.default();

        /**
         * Dispatched after this resource has had all the *after* middleware run on it.
         *
         * The callback looks like {@link Resource.OnCompleteSignal}.
         *
         * @member {Signal}
         */
        this.onAfterMiddleware = new _miniSignals2.default();
    }

    /**
     * When the resource starts to load.
     *
     * @memberof Resource
     * @callback OnStartSignal
     * @param {Resource} resource - The resource that the event happened on.
     */

    /**
     * When the resource reports loading progress.
     *
     * @memberof Resource
     * @callback OnProgressSignal
     * @param {Resource} resource - The resource that the event happened on.
     * @param {number} percentage - The progress of the load in the range [0, 1].
     */

    /**
     * When the resource finishes loading.
     *
     * @memberof Resource
     * @callback OnCompleteSignal
     * @param {Resource} resource - The resource that the event happened on.
     */

    /**
     * @memberof Resource
     * @typedef {object} IMetadata
     * @property {HTMLImageElement|HTMLAudioElement|HTMLVideoElement} [loadElement=null] - The
     *      element to use for loading, instead of creating one.
     * @property {boolean} [skipSource=false] - Skips adding source(s) to the load element. This
     *      is useful if you want to pass in a `loadElement` that you already added load sources to.
     * @property {string|string[]} [mimeType] - The mime type to use for the source element
     *      of a video/audio elment. If the urls are an array, you can pass this as an array as well
     *      where each index is the mime type to use for the corresponding url index.
     */

    /**
     * Stores whether or not this url is a data url.
     *
     * @readonly
     * @member {boolean}
     */


    /**
     * Marks the resource as complete.
     *
     */
    Resource.prototype.complete = function complete() {
        this._clearEvents();
        this._finish();
    };

    /**
     * Aborts the loading of this resource, with an optional message.
     *
     * @param {string} message - The message to use for the error
     */


    Resource.prototype.abort = function abort(message) {
        // abort can be called multiple times, ignore subsequent calls.
        if (this.error) {
            return;
        }

        // store error
        this.error = new Error(message);

        // clear events before calling aborts
        this._clearEvents();

        // abort the actual loading
        if (this.xhr) {
            this.xhr.abort();
        } else if (this.xdr) {
            this.xdr.abort();
        } else if (this.data) {
            // single source
            if (this.data.src) {
                this.data.src = Resource.EMPTY_GIF;
            }
            // multi-source
            else {
                    while (this.data.firstChild) {
                        this.data.removeChild(this.data.firstChild);
                    }
                }
        }

        // done now.
        this._finish();
    };

    /**
     * Kicks off loading of this resource. This method is asynchronous.
     *
     * @param {Resource.OnCompleteSignal} [cb] - Optional callback to call once the resource is loaded.
     */


    Resource.prototype.load = function load(cb) {
        var _this = this;

        if (this.isLoading) {
            return;
        }

        if (this.isComplete) {
            if (cb) {
                setTimeout(function () {
                    return cb(_this);
                }, 1);
            }

            return;
        } else if (cb) {
            this.onComplete.once(cb);
        }

        this._setFlag(Resource.STATUS_FLAGS.LOADING, true);

        this.onStart.dispatch(this);

        // if unset, determine the value
        if (this.crossOrigin === false || typeof this.crossOrigin !== 'string') {
            this.crossOrigin = this._determineCrossOrigin(this.url);
        }

        switch (this.loadType) {
            case Resource.LOAD_TYPE.IMAGE:
                this.type = Resource.TYPE.IMAGE;
                this._loadElement('image');
                break;

            case Resource.LOAD_TYPE.AUDIO:
                this.type = Resource.TYPE.AUDIO;
                this._loadSourceElement('audio');
                break;

            case Resource.LOAD_TYPE.VIDEO:
                this.type = Resource.TYPE.VIDEO;
                this._loadSourceElement('video');
                break;

            case Resource.LOAD_TYPE.XHR:
            /* falls through */
            default:
                if (useXdr && this.crossOrigin) {
                    this._loadXdr();
                } else {
                    this._loadXhr();
                }
                break;
        }
    };

    /**
     * Checks if the flag is set.
     *
     * @private
     * @param {number} flag - The flag to check.
     * @return {boolean} True if the flag is set.
     */


    Resource.prototype._hasFlag = function _hasFlag(flag) {
        return (this._flags & flag) !== 0;
    };

    /**
     * (Un)Sets the flag.
     *
     * @private
     * @param {number} flag - The flag to (un)set.
     * @param {boolean} value - Whether to set or (un)set the flag.
     */


    Resource.prototype._setFlag = function _setFlag(flag, value) {
        this._flags = value ? this._flags | flag : this._flags & ~flag;
    };

    /**
     * Clears all the events from the underlying loading source.
     *
     * @private
     */


    Resource.prototype._clearEvents = function _clearEvents() {
        clearTimeout(this._elementTimer);

        if (this.data && this.data.removeEventListener) {
            this.data.removeEventListener('error', this._boundOnError, false);
            this.data.removeEventListener('load', this._boundComplete, false);
            this.data.removeEventListener('progress', this._boundOnProgress, false);
            this.data.removeEventListener('canplaythrough', this._boundComplete, false);
        }

        if (this.xhr) {
            if (this.xhr.removeEventListener) {
                this.xhr.removeEventListener('error', this._boundXhrOnError, false);
                this.xhr.removeEventListener('timeout', this._boundXhrOnTimeout, false);
                this.xhr.removeEventListener('abort', this._boundXhrOnAbort, false);
                this.xhr.removeEventListener('progress', this._boundOnProgress, false);
                this.xhr.removeEventListener('load', this._boundXhrOnLoad, false);
            } else {
                this.xhr.onerror = null;
                this.xhr.ontimeout = null;
                this.xhr.onprogress = null;
                this.xhr.onload = null;
            }
        }
    };

    /**
     * Finalizes the load.
     *
     * @private
     */


    Resource.prototype._finish = function _finish() {
        if (this.isComplete) {
            throw new Error('Complete called again for an already completed resource.');
        }

        this._setFlag(Resource.STATUS_FLAGS.COMPLETE, true);
        this._setFlag(Resource.STATUS_FLAGS.LOADING, false);

        this.onComplete.dispatch(this);
    };

    /**
     * Loads this resources using an element that has a single source,
     * like an HTMLImageElement.
     *
     * @private
     * @param {string} type - The type of element to use.
     */


    Resource.prototype._loadElement = function _loadElement(type) {
        if (this.metadata.loadElement) {
            this.data = this.metadata.loadElement;
        } else if (type === 'image' && typeof window.Image !== 'undefined') {
            this.data = new Image();
        } else {
            this.data = document.createElement(type);
        }

        if (this.crossOrigin) {
            this.data.crossOrigin = this.crossOrigin;
        }

        if (!this.metadata.skipSource) {
            this.data.src = this.url;
        }

        this.data.addEventListener('error', this._boundOnError, false);
        this.data.addEventListener('load', this._boundComplete, false);
        this.data.addEventListener('progress', this._boundOnProgress, false);

        if (this.timeout) {
            this._elementTimer = setTimeout(this._boundOnTimeout, this.timeout);
        }
    };

    /**
     * Loads this resources using an element that has multiple sources,
     * like an HTMLAudioElement or HTMLVideoElement.
     *
     * @private
     * @param {string} type - The type of element to use.
     */


    Resource.prototype._loadSourceElement = function _loadSourceElement(type) {
        if (this.metadata.loadElement) {
            this.data = this.metadata.loadElement;
        } else if (type === 'audio' && typeof window.Audio !== 'undefined') {
            this.data = new Audio();
        } else {
            this.data = document.createElement(type);
        }

        if (this.data === null) {
            this.abort('Unsupported element: ' + type);

            return;
        }

        if (this.crossOrigin) {
            this.data.crossOrigin = this.crossOrigin;
        }

        if (!this.metadata.skipSource) {
            // support for CocoonJS Canvas+ runtime, lacks document.createElement('source')
            if (navigator.isCocoonJS) {
                this.data.src = Array.isArray(this.url) ? this.url[0] : this.url;
            } else if (Array.isArray(this.url)) {
                var mimeTypes = this.metadata.mimeType;

                for (var i = 0; i < this.url.length; ++i) {
                    this.data.appendChild(this._createSource(type, this.url[i], Array.isArray(mimeTypes) ? mimeTypes[i] : mimeTypes));
                }
            } else {
                var _mimeTypes = this.metadata.mimeType;

                this.data.appendChild(this._createSource(type, this.url, Array.isArray(_mimeTypes) ? _mimeTypes[0] : _mimeTypes));
            }
        }

        this.data.addEventListener('error', this._boundOnError, false);
        this.data.addEventListener('load', this._boundComplete, false);
        this.data.addEventListener('progress', this._boundOnProgress, false);
        this.data.addEventListener('canplaythrough', this._boundComplete, false);

        this.data.load();

        if (this.timeout) {
            this._elementTimer = setTimeout(this._boundOnTimeout, this.timeout);
        }
    };

    /**
     * Loads this resources using an XMLHttpRequest.
     *
     * @private
     */


    Resource.prototype._loadXhr = function _loadXhr() {
        // if unset, determine the value
        if (typeof this.xhrType !== 'string') {
            this.xhrType = this._determineXhrType();
        }

        var xhr = this.xhr = new XMLHttpRequest();

        // set the request type and url
        xhr.open('GET', this.url, true);

        xhr.timeout = this.timeout;

        // load json as text and parse it ourselves. We do this because some browsers
        // *cough* safari *cough* can't deal with it.
        if (this.xhrType === Resource.XHR_RESPONSE_TYPE.JSON || this.xhrType === Resource.XHR_RESPONSE_TYPE.DOCUMENT) {
            xhr.responseType = Resource.XHR_RESPONSE_TYPE.TEXT;
        } else {
            xhr.responseType = this.xhrType;
        }

        xhr.addEventListener('error', this._boundXhrOnError, false);
        xhr.addEventListener('timeout', this._boundXhrOnTimeout, false);
        xhr.addEventListener('abort', this._boundXhrOnAbort, false);
        xhr.addEventListener('progress', this._boundOnProgress, false);
        xhr.addEventListener('load', this._boundXhrOnLoad, false);

        xhr.send();
    };

    /**
     * Loads this resources using an XDomainRequest. This is here because we need to support IE9 (gross).
     *
     * @private
     */


    Resource.prototype._loadXdr = function _loadXdr() {
        // if unset, determine the value
        if (typeof this.xhrType !== 'string') {
            this.xhrType = this._determineXhrType();
        }

        var xdr = this.xhr = new XDomainRequest(); // eslint-disable-line no-undef

        // XDomainRequest has a few quirks. Occasionally it will abort requests
        // A way to avoid this is to make sure ALL callbacks are set even if not used
        // More info here: http://stackoverflow.com/questions/15786966/xdomainrequest-aborts-post-on-ie-9
        xdr.timeout = this.timeout || 5000; // XDR needs a timeout value or it breaks in IE9

        xdr.onerror = this._boundXhrOnError;
        xdr.ontimeout = this._boundXhrOnTimeout;
        xdr.onprogress = this._boundOnProgress;
        xdr.onload = this._boundXhrOnLoad;

        xdr.open('GET', this.url, true);

        // Note: The xdr.send() call is wrapped in a timeout to prevent an
        // issue with the interface where some requests are lost if multiple
        // XDomainRequests are being sent at the same time.
        // Some info here: https://github.com/photonstorm/phaser/issues/1248
        setTimeout(function () {
            return xdr.send();
        }, 1);
    };

    /**
     * Creates a source used in loading via an element.
     *
     * @private
     * @param {string} type - The element type (video or audio).
     * @param {string} url - The source URL to load from.
     * @param {string} [mime] - The mime type of the video
     * @return {HTMLSourceElement} The source element.
     */


    Resource.prototype._createSource = function _createSource(type, url, mime) {
        if (!mime) {
            mime = type + '/' + this._getExtension(url);
        }

        var source = document.createElement('source');

        source.src = url;
        source.type = mime;

        return source;
    };

    /**
     * Called if a load errors out.
     *
     * @param {Event} event - The error event from the element that emits it.
     * @private
     */


    Resource.prototype._onError = function _onError(event) {
        this.abort('Failed to load element using: ' + event.target.nodeName);
    };

    /**
     * Called if a load progress event fires for an element or xhr/xdr.
     *
     * @private
     * @param {XMLHttpRequestProgressEvent|Event} event - Progress event.
     */


    Resource.prototype._onProgress = function _onProgress(event) {
        if (event && event.lengthComputable) {
            this.onProgress.dispatch(this, event.loaded / event.total);
        }
    };

    /**
     * Called if a timeout event fires for an element.
     *
     * @private
     */


    Resource.prototype._onTimeout = function _onTimeout() {
        this.abort('Load timed out.');
    };

    /**
     * Called if an error event fires for xhr/xdr.
     *
     * @private
     */


    Resource.prototype._xhrOnError = function _xhrOnError() {
        var xhr = this.xhr;

        this.abort(reqType(xhr) + ' Request failed. Status: ' + xhr.status + ', text: "' + xhr.statusText + '"');
    };

    /**
     * Called if an error event fires for xhr/xdr.
     *
     * @private
     */


    Resource.prototype._xhrOnTimeout = function _xhrOnTimeout() {
        var xhr = this.xhr;

        this.abort(reqType(xhr) + ' Request timed out.');
    };

    /**
     * Called if an abort event fires for xhr/xdr.
     *
     * @private
     */


    Resource.prototype._xhrOnAbort = function _xhrOnAbort() {
        var xhr = this.xhr;

        this.abort(reqType(xhr) + ' Request was aborted by the user.');
    };

    /**
     * Called when data successfully loads from an xhr/xdr request.
     *
     * @private
     * @param {XMLHttpRequestLoadEvent|Event} event - Load event
     */


    Resource.prototype._xhrOnLoad = function _xhrOnLoad() {
        var xhr = this.xhr;
        var text = '';
        var status = typeof xhr.status === 'undefined' ? STATUS_OK : xhr.status; // XDR has no `.status`, assume 200.

        // responseText is accessible only if responseType is '' or 'text' and on older browsers
        if (xhr.responseType === '' || xhr.responseType === 'text' || typeof xhr.responseType === 'undefined') {
            text = xhr.responseText;
        }

        // status can be 0 when using the `file://` protocol so we also check if a response is set.
        // If it has a response, we assume 200; otherwise a 0 status code with no contents is an aborted request.
        if (status === STATUS_NONE && (text.length > 0 || xhr.responseType === Resource.XHR_RESPONSE_TYPE.BUFFER)) {
            status = STATUS_OK;
        }
        // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
        else if (status === STATUS_IE_BUG_EMPTY) {
                status = STATUS_EMPTY;
            }

        var statusType = status / 100 | 0;

        if (statusType === STATUS_TYPE_OK) {
            // if text, just return it
            if (this.xhrType === Resource.XHR_RESPONSE_TYPE.TEXT) {
                this.data = text;
                this.type = Resource.TYPE.TEXT;
            }
            // if json, parse into json object
            else if (this.xhrType === Resource.XHR_RESPONSE_TYPE.JSON) {
                    try {
                        this.data = JSON.parse(text);
                        this.type = Resource.TYPE.JSON;
                    } catch (e) {
                        this.abort('Error trying to parse loaded json: ' + e);

                        return;
                    }
                }
                // if xml, parse into an xml document or div element
                else if (this.xhrType === Resource.XHR_RESPONSE_TYPE.DOCUMENT) {
                        try {
                            if (window.DOMParser) {
                                var domparser = new DOMParser();

                                this.data = domparser.parseFromString(text, 'text/xml');
                            } else {
                                var div = document.createElement('div');

                                div.innerHTML = text;

                                this.data = div;
                            }

                            this.type = Resource.TYPE.XML;
                        } catch (e) {
                            this.abort('Error trying to parse loaded xml: ' + e);

                            return;
                        }
                    }
                    // other types just return the response
                    else {
                            this.data = xhr.response || text;
                        }
        } else {
            this.abort('[' + xhr.status + '] ' + xhr.statusText + ': ' + xhr.responseURL);

            return;
        }

        this.complete();
    };

    /**
     * Sets the `crossOrigin` property for this resource based on if the url
     * for this resource is cross-origin. If crossOrigin was manually set, this
     * function does nothing.
     *
     * @private
     * @param {string} url - The url to test.
     * @param {object} [loc=window.location] - The location object to test against.
     * @return {string} The crossOrigin value to use (or empty string for none).
     */


    Resource.prototype._determineCrossOrigin = function _determineCrossOrigin(url, loc) {
        // data: and javascript: urls are considered same-origin
        if (url.indexOf('data:') === 0) {
            return '';
        }

        // A sandboxed iframe without the 'allow-same-origin' attribute will have a special
        // origin designed not to match window.location.origin, and will always require
        // crossOrigin requests regardless of whether the location matches.
        if (window.origin !== window.location.origin) {
            return 'anonymous';
        }

        // default is window.location
        loc = loc || window.location;

        if (!tempAnchor) {
            tempAnchor = document.createElement('a');
        }

        // let the browser determine the full href for the url of this resource and then
        // parse with the node url lib, we can't use the properties of the anchor element
        // because they don't work in IE9 :(
        tempAnchor.href = url;
        url = (0, _parseUri2.default)(tempAnchor.href, { strictMode: true });

        var samePort = !url.port && loc.port === '' || url.port === loc.port;
        var protocol = url.protocol ? url.protocol + ':' : '';

        // if cross origin
        if (url.host !== loc.hostname || !samePort || protocol !== loc.protocol) {
            return 'anonymous';
        }

        return '';
    };

    /**
     * Determines the responseType of an XHR request based on the extension of the
     * resource being loaded.
     *
     * @private
     * @return {Resource.XHR_RESPONSE_TYPE} The responseType to use.
     */


    Resource.prototype._determineXhrType = function _determineXhrType() {
        return Resource._xhrTypeMap[this.extension] || Resource.XHR_RESPONSE_TYPE.TEXT;
    };

    /**
     * Determines the loadType of a resource based on the extension of the
     * resource being loaded.
     *
     * @private
     * @return {Resource.LOAD_TYPE} The loadType to use.
     */


    Resource.prototype._determineLoadType = function _determineLoadType() {
        return Resource._loadTypeMap[this.extension] || Resource.LOAD_TYPE.XHR;
    };

    /**
     * Extracts the extension (sans '.') of the file being loaded by the resource.
     *
     * @private
     * @return {string} The extension.
     */


    Resource.prototype._getExtension = function _getExtension() {
        var url = this.url;
        var ext = '';

        if (this.isDataUrl) {
            var slashIndex = url.indexOf('/');

            ext = url.substring(slashIndex + 1, url.indexOf(';', slashIndex));
        } else {
            var queryStart = url.indexOf('?');
            var hashStart = url.indexOf('#');
            var index = Math.min(queryStart > -1 ? queryStart : url.length, hashStart > -1 ? hashStart : url.length);

            url = url.substring(0, index);
            ext = url.substring(url.lastIndexOf('.') + 1);
        }

        return ext.toLowerCase();
    };

    /**
     * Determines the mime type of an XHR request based on the responseType of
     * resource being loaded.
     *
     * @private
     * @param {Resource.XHR_RESPONSE_TYPE} type - The type to get a mime type for.
     * @return {string} The mime type to use.
     */


    Resource.prototype._getMimeFromXhrType = function _getMimeFromXhrType(type) {
        switch (type) {
            case Resource.XHR_RESPONSE_TYPE.BUFFER:
                return 'application/octet-binary';

            case Resource.XHR_RESPONSE_TYPE.BLOB:
                return 'application/blob';

            case Resource.XHR_RESPONSE_TYPE.DOCUMENT:
                return 'application/xml';

            case Resource.XHR_RESPONSE_TYPE.JSON:
                return 'application/json';

            case Resource.XHR_RESPONSE_TYPE.DEFAULT:
            case Resource.XHR_RESPONSE_TYPE.TEXT:
            /* falls through */
            default:
                return 'text/plain';
        }
    };

    _createClass(Resource, [{
        key: 'isDataUrl',
        get: function get() {
            return this._hasFlag(Resource.STATUS_FLAGS.DATA_URL);
        }

        /**
         * Describes if this resource has finished loading. Is true when the resource has completely
         * loaded.
         *
         * @readonly
         * @member {boolean}
         */

    }, {
        key: 'isComplete',
        get: function get() {
            return this._hasFlag(Resource.STATUS_FLAGS.COMPLETE);
        }

        /**
         * Describes if this resource is currently loading. Is true when the resource starts loading,
         * and is false again when complete.
         *
         * @readonly
         * @member {boolean}
         */

    }, {
        key: 'isLoading',
        get: function get() {
            return this._hasFlag(Resource.STATUS_FLAGS.LOADING);
        }
    }]);

    return Resource;
}();

/**
 * The types of resources a resource could represent.
 *
 * @static
 * @readonly
 * @enum {number}
 */


Resource.STATUS_FLAGS = {
    NONE: 0,
    DATA_URL: 1 << 0,
    COMPLETE: 1 << 1,
    LOADING: 1 << 2
};

/**
 * The types of resources a resource could represent.
 *
 * @static
 * @readonly
 * @enum {number}
 */
Resource.TYPE = {
    UNKNOWN: 0,
    JSON: 1,
    XML: 2,
    IMAGE: 3,
    AUDIO: 4,
    VIDEO: 5,
    TEXT: 6
};

/**
 * The types of loading a resource can use.
 *
 * @static
 * @readonly
 * @enum {number}
 */
Resource.LOAD_TYPE = {
    /** Uses XMLHttpRequest to load the resource. */
    XHR: 1,
    /** Uses an `Image` object to load the resource. */
    IMAGE: 2,
    /** Uses an `Audio` object to load the resource. */
    AUDIO: 3,
    /** Uses a `Video` object to load the resource. */
    VIDEO: 4
};

/**
 * The XHR ready states, used internally.
 *
 * @static
 * @readonly
 * @enum {string}
 */
Resource.XHR_RESPONSE_TYPE = {
    /** string */
    DEFAULT: 'text',
    /** ArrayBuffer */
    BUFFER: 'arraybuffer',
    /** Blob */
    BLOB: 'blob',
    /** Document */
    DOCUMENT: 'document',
    /** Object */
    JSON: 'json',
    /** String */
    TEXT: 'text'
};

Resource._loadTypeMap = {
    // images
    gif: Resource.LOAD_TYPE.IMAGE,
    png: Resource.LOAD_TYPE.IMAGE,
    bmp: Resource.LOAD_TYPE.IMAGE,
    jpg: Resource.LOAD_TYPE.IMAGE,
    jpeg: Resource.LOAD_TYPE.IMAGE,
    tif: Resource.LOAD_TYPE.IMAGE,
    tiff: Resource.LOAD_TYPE.IMAGE,
    webp: Resource.LOAD_TYPE.IMAGE,
    tga: Resource.LOAD_TYPE.IMAGE,
    svg: Resource.LOAD_TYPE.IMAGE,
    'svg+xml': Resource.LOAD_TYPE.IMAGE, // for SVG data urls

    // audio
    mp3: Resource.LOAD_TYPE.AUDIO,
    ogg: Resource.LOAD_TYPE.AUDIO,
    wav: Resource.LOAD_TYPE.AUDIO,

    // videos
    mp4: Resource.LOAD_TYPE.VIDEO,
    webm: Resource.LOAD_TYPE.VIDEO
};

Resource._xhrTypeMap = {
    // xml
    xhtml: Resource.XHR_RESPONSE_TYPE.DOCUMENT,
    html: Resource.XHR_RESPONSE_TYPE.DOCUMENT,
    htm: Resource.XHR_RESPONSE_TYPE.DOCUMENT,
    xml: Resource.XHR_RESPONSE_TYPE.DOCUMENT,
    tmx: Resource.XHR_RESPONSE_TYPE.DOCUMENT,
    svg: Resource.XHR_RESPONSE_TYPE.DOCUMENT,

    // This was added to handle Tiled Tileset XML, but .tsx is also a TypeScript React Component.
    // Since it is way less likely for people to be loading TypeScript files instead of Tiled files,
    // this should probably be fine.
    tsx: Resource.XHR_RESPONSE_TYPE.DOCUMENT,

    // images
    gif: Resource.XHR_RESPONSE_TYPE.BLOB,
    png: Resource.XHR_RESPONSE_TYPE.BLOB,
    bmp: Resource.XHR_RESPONSE_TYPE.BLOB,
    jpg: Resource.XHR_RESPONSE_TYPE.BLOB,
    jpeg: Resource.XHR_RESPONSE_TYPE.BLOB,
    tif: Resource.XHR_RESPONSE_TYPE.BLOB,
    tiff: Resource.XHR_RESPONSE_TYPE.BLOB,
    webp: Resource.XHR_RESPONSE_TYPE.BLOB,
    tga: Resource.XHR_RESPONSE_TYPE.BLOB,

    // json
    json: Resource.XHR_RESPONSE_TYPE.JSON,

    // text
    text: Resource.XHR_RESPONSE_TYPE.TEXT,
    txt: Resource.XHR_RESPONSE_TYPE.TEXT,

    // fonts
    ttf: Resource.XHR_RESPONSE_TYPE.BUFFER,
    otf: Resource.XHR_RESPONSE_TYPE.BUFFER
};

// We can't set the `src` attribute to empty string, so on abort we set it to this 1px transparent gif
Resource.EMPTY_GIF = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

/**
 * Quick helper to set a value on one of the extension maps. Ensures there is no
 * dot at the start of the extension.
 *
 * @ignore
 * @param {object} map - The map to set on.
 * @param {string} extname - The extension (or key) to set.
 * @param {number} val - The value to set.
 */
function setExtMap(map, extname, val) {
    if (extname && extname.indexOf('.') === 0) {
        extname = extname.substring(1);
    }

    if (!extname) {
        return;
    }

    map[extname] = val;
}

/**
 * Quick helper to get string xhr type.
 *
 * @ignore
 * @param {XMLHttpRequest|XDomainRequest} xhr - The request to check.
 * @return {string} The type.
 */
function reqType(xhr) {
    return xhr.toString().replace('object ', '');
}

// Backwards compat
if (typeof module !== 'undefined') {
    module.exports.default = Resource; // eslint-disable-line no-undef
}
//# sourceMappingURL=Resource.js.map