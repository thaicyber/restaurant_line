'use strict';


// let deprecate = require('depd')('response-time')
const onHeaders = require('on-headers');

/**
 * Module exports.
 * @public
 */

module.exports = responseTime;

/**
 * Create a middleware to add a `X-Response-Time` header displaying
 * the response duration in milliseconds.
 *
 * @param {object|function} [options]
 * @param {number} [options.digits=3]
 * @param {string} [options.header=X-Response-Time]
 * @param {boolean} [options.suffix=true]
 * @return {function}
 * @public
 */

function responseTime(options) {
    let opts = options || {}
    if (typeof options === 'number') {
        // back-compat single number argument
        // deprecate('number argument: use {digits: ' + JSON.stringify(options) + '} instead')
        opts = { digits: options }
    }
    // get the function to invoke
    let fn = typeof opts !== 'function' ? createSetHeader(opts) : opts;

    return function responseTime(req, res, next) {
        let startAt = process.hrtime();
        onHeaders(res, function onHeaders() {
            let diff = process.hrtime(startAt);
            let time = diff[0] * 1e3 + diff[1] * 1e-6

            fn(req, res, time)
        })
        next()
    }
}

/**
 * Create function to set respoonse time header.
 * @private
 */

function createSetHeader(options) {
    // response time digits
    let digits = options.digits !== undefined ? options.digits : 3
    // header name
    let header = options.header || 'X-Response-Time'
    // display suffix
    let suffix = options.suffix !== undefined ? Boolean(options.suffix) : true
    return function setResponseHeader(req, res, time) {
        if (res.getHeader(header)) {
            return
        }
        let val = time.toFixed(digits)
        if (suffix) {
            val += 'ms'
        }
        res.setHeader(header, val)
    }
}

// module.exports = function responseTime() {
//     return function(req, res, next) {
//         let start = new Date;

//         if (res._responseTime) return next();
//         res._responseTime = true;

//         res.on('header', function() {
//             let duration = new Date - start;
//             res.setHeader('X-Response-Time', duration + 'ms');
//         });

//         next();
//     };
// };
