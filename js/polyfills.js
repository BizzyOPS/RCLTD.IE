/**
 * Cross-Browser Polyfills for Robotics & Control Ltd
 * 
 * Essential polyfills for IE11 and older browser support
 * Includes polyfills for modern JavaScript features and APIs
 */

// ==================== ARRAY POLYFILLS ====================

// Array.includes() polyfill for IE
if (!Array.prototype.includes) {
    Array.prototype.includes = function(searchElement, fromIndex) {
        'use strict';
        if (this == null) {
            throw new TypeError('Array.prototype.includes called on null or undefined');
        }
        
        var O = Object(this);
        var len = parseInt(O.length) || 0;
        if (len === 0) {
            return false;
        }
        var n = parseInt(fromIndex) || 0;
        var k;
        if (n >= 0) {
            k = n;
        } else {
            k = len + n;
            if (k < 0) {k = 0;}
        }
        
        function sameValueZero(x, y) {
            return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
        }
        
        for (;k < len; k++) {
            if (sameValueZero(O[k], searchElement)) {
                return true;
            }
        }
        return false;
    };
}

// Array.find() polyfill for IE
if (!Array.prototype.find) {
    Array.prototype.find = function(predicate) {
        'use strict';
        if (this == null) {
            throw new TypeError('Array.prototype.find called on null or undefined');
        }
        if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
        }
        var list = Object(this);
        var length = parseInt(list.length) || 0;
        var thisArg = arguments[1];
        var value;

        for (var i = 0; i < length; i++) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
                return value;
            }
        }
        return undefined;
    };
}

// Array.findIndex() polyfill for IE
if (!Array.prototype.findIndex) {
    Array.prototype.findIndex = function(predicate) {
        'use strict';
        if (this == null) {
            throw new TypeError('Array.prototype.findIndex called on null or undefined');
        }
        if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
        }
        var list = Object(this);
        var length = parseInt(list.length) || 0;
        var thisArg = arguments[1];
        var value;

        for (var i = 0; i < length; i++) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
                return i;
            }
        }
        return -1;
    };
}

// Array.from() polyfill for IE
if (!Array.from) {
    Array.from = (function () {
        var toStr = Object.prototype.toString;
        var isCallable = function (fn) {
            return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
        };
        var toInteger = function (value) {
            var number = Number(value);
            if (isNaN(number)) { return 0; }
            if (number === 0 || !isFinite(number)) { return number; }
            return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
        };
        var maxSafeInteger = Math.pow(2, 53) - 1;
        var toLength = function (value) {
            var len = toInteger(value);
            return Math.min(Math.max(len, 0), maxSafeInteger);
        };

        return function from(arrayLike/*, mapFn, thisArg */) {
            var C = this;
            var items = Object(arrayLike);
            if (arrayLike == null) {
                throw new TypeError('Array.from requires an array-like object - not null or undefined');
            }
            var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
            var T;
            if (typeof mapFn !== 'undefined') {
                if (!isCallable(mapFn)) {
                    throw new TypeError('Array.from: when provided, the second argument must be a function');
                }
                if (arguments.length > 2) {
                    T = arguments[2];
                }
            }
            var len = toLength(items.length);
            var A = isCallable(C) ? Object(new C(len)) : new Array(len);
            var k = 0;
            var kValue;
            while (k < len) {
                kValue = items[k];
                if (mapFn) {
                    A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
                } else {
                    A[k] = kValue;
                }
                k += 1;
            }
            A.length = len;
            return A;
        };
    }());
}

// ==================== OBJECT POLYFILLS ====================

// Object.assign() polyfill for IE
if (typeof Object.assign !== 'function') {
    Object.assign = function(target, varArgs) {
        'use strict';
        if (target == null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }

        var to = Object(target);

        for (var index = 1; index < arguments.length; index++) {
            var nextSource = arguments[index];

            if (nextSource != null) {
                for (var nextKey in nextSource) {
                    if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
        }
        return to;
    };
}

// Object.keys() polyfill for IE8
if (!Object.keys) {
    Object.keys = (function() {
        'use strict';
        var hasOwnProperty = Object.prototype.hasOwnProperty,
            hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
            dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ],
            dontEnumsLength = dontEnums.length;

        return function(obj) {
            if (typeof obj !== 'function' && (typeof obj !== 'object' || obj === null)) {
                throw new TypeError('Object.keys called on non-object');
            }

            var result = [], prop, i;

            for (prop in obj) {
                if (hasOwnProperty.call(obj, prop)) {
                    result.push(prop);
                }
            }

            if (hasDontEnumBug) {
                for (i = 0; i < dontEnumsLength; i++) {
                    if (hasOwnProperty.call(obj, dontEnums[i])) {
                        result.push(dontEnums[i]);
                    }
                }
            }
            return result;
        };
    }());
}

// Object.values() polyfill for older browsers
if (!Object.values) {
    Object.values = function(obj) {
        if (obj !== Object(obj)) {
            throw new TypeError('Object.values called on non-object');
        }
        var val = [], key;
        for (key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                val.push(obj[key]);
            }
        }
        return val;
    };
}

// ==================== PROMISE POLYFILL ====================

// Simple Promise polyfill for IE11
if (typeof Promise === 'undefined') {
    window.Promise = function(executor) {
        var self = this;
        self.state = 'pending';
        self.value = undefined;
        self.handlers = [];

        function resolve(result) {
            if (self.state === 'pending') {
                self.state = 'fulfilled';
                self.value = result;
                self.handlers.forEach(handle);
                self.handlers = null;
            }
        }

        function reject(error) {
            if (self.state === 'pending') {
                self.state = 'rejected';
                self.value = error;
                self.handlers.forEach(handle);
                self.handlers = null;
            }
        }

        function handle(handler) {
            if (self.state === 'pending') {
                self.handlers.push(handler);
            } else {
                if (self.state === 'fulfilled' && typeof handler.onFulfilled === 'function') {
                    handler.onFulfilled(self.value);
                }
                if (self.state === 'rejected' && typeof handler.onRejected === 'function') {
                    handler.onRejected(self.value);
                }
            }
        }

        this.then = function(onFulfilled, onRejected) {
            return new Promise(function(resolve, reject) {
                handle({
                    onFulfilled: function(result) {
                        try {
                            var returnValue = onFulfilled ? onFulfilled(result) : result;
                            resolve(returnValue);
                        } catch (ex) {
                            reject(ex);
                        }
                    },
                    onRejected: function(error) {
                        try {
                            var returnValue = onRejected ? onRejected(error) : error;
                            reject(returnValue);
                        } catch (ex) {
                            reject(ex);
                        }
                    }
                });
            });
        };

        this.catch = function(onRejected) {
            return this.then(null, onRejected);
        };

        // Execute the executor function
        try {
            executor(resolve, reject);
        } catch (ex) {
            reject(ex);
        }
    };

    // Promise.resolve static method
    Promise.resolve = function(value) {
        return new Promise(function(resolve) {
            resolve(value);
        });
    };

    // Promise.reject static method
    Promise.reject = function(reason) {
        return new Promise(function(resolve, reject) {
            reject(reason);
        });
    };
}

// ==================== FETCH API POLYFILL ====================

// Basic fetch polyfill for older browsers
if (!window.fetch) {
    window.fetch = function(input, init) {
        return new Promise(function(resolve, reject) {
            var request = new XMLHttpRequest();
            var url = typeof input === 'string' ? input : input.url;
            var method = (init && init.method) || 'GET';
            var headers = (init && init.headers) || {};
            var body = (init && init.body) || null;

            request.open(method, url, true);

            // Set headers
            for (var key in headers) {
                if (headers.hasOwnProperty(key)) {
                    request.setRequestHeader(key, headers[key]);
                }
            }

            request.onload = function() {
                var responseText = request.responseText;
                var response = {
                    ok: request.status >= 200 && request.status < 300,
                    status: request.status,
                    statusText: request.statusText,
                    text: function() {
                        return Promise.resolve(responseText);
                    },
                    json: function() {
                        return Promise.resolve(JSON.parse(responseText));
                    }
                };
                resolve(response);
            };

            request.onerror = function() {
                reject(new TypeError('Network request failed'));
            };

            request.ontimeout = function() {
                reject(new TypeError('Network request timed out'));
            };

            request.send(body);
        });
    };
}

// ==================== STRING POLYFILLS ====================

// String.includes() polyfill for IE
if (!String.prototype.includes) {
    String.prototype.includes = function(search, start) {
        'use strict';
        if (typeof start !== 'number') {
            start = 0;
        }
        
        if (start + search.length > this.length) {
            return false;
        } else {
            return this.indexOf(search, start) !== -1;
        }
    };
}

// String.startsWith() polyfill for IE
if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position) {
        position = position || 0;
        return this.substr(position, searchString.length) === searchString;
    };
}

// String.endsWith() polyfill for IE
if (!String.prototype.endsWith) {
    String.prototype.endsWith = function(searchString, length) {
        if (length === undefined || length > this.length) {
            length = this.length;
        }
        return this.substring(length - searchString.length, length) === searchString;
    };
}

// ==================== DOM POLYFILLS ====================

// Element.matches() polyfill for IE
if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector ||
                                Element.prototype.webkitMatchesSelector;
}

// Element.closest() polyfill for IE
if (!Element.prototype.closest) {
    Element.prototype.closest = function(s) {
        var el = this;
        do {
            if (el.matches(s)) return el;
            el = el.parentElement || el.parentNode;
        } while (el !== null && el.nodeType === 1);
        return null;
    };
}

// Node.remove() polyfill for IE
if (!('remove' in Element.prototype)) {
    Element.prototype.remove = function() {
        if (this.parentNode) {
            this.parentNode.removeChild(this);
        }
    };
}

// ==================== CUSTOM EVENT POLYFILL ====================

// CustomEvent polyfill for IE
if (typeof window.CustomEvent !== 'function') {
    function CustomEvent(event, params) {
        params = params || {bubbles: false, cancelable: false, detail: undefined};
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }
    CustomEvent.prototype = window.Event.prototype;
    window.CustomEvent = CustomEvent;
}

// ==================== REQUESTANIMATIONFRAME POLYFILL ====================

// requestAnimationFrame polyfill
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] ||
                                      window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
}());

// ==================== CONSOLE POLYFILL ====================

// Console polyfill for IE8/9
if (!window.console) {
    window.console = {
        log: function() {},
        error: function() {},
        warn: function() {},
        info: function() {},
        debug: function() {}
    };
}

// ==================== INITIALIZATION ====================

// Feature detection helper
window.BrowserCompat = {
    supportsFlexbox: function() {
        var elem = document.createElement('div');
        return 'flex' in elem.style ||
               'webkitFlex' in elem.style ||
               'msFlex' in elem.style;
    },
    
    supportsGrid: function() {
        var elem = document.createElement('div');
        return 'grid' in elem.style ||
               'msGrid' in elem.style;
    },
    
    supportsTransforms: function() {
        var elem = document.createElement('div');
        return 'transform' in elem.style ||
               'webkitTransform' in elem.style ||
               'msTransform' in elem.style;
    },
    
    isIE: function() {
        return navigator.userAgent.indexOf('MSIE') !== -1 || 
               navigator.userAgent.indexOf('Trident') !== -1;
    },
    
    isIE11: function() {
        return navigator.userAgent.indexOf('Trident') !== -1;
    }
};

console.log('Cross-browser polyfills loaded successfully');