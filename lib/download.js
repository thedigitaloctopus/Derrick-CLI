/*!
 * Moonshine CLI
 *
 * 10up <sales@10up.com>
 * John Bloch <john.bloch@10up.com>
 * Eric Mann <eric.mann@10up.com>
 * Luke Woodward <luke.woodward@10up.com>
 *
 * MIT License.
 */

/**
 * Module dependencies.
 */
var transports = {
		http : require( 'http' ),
		https: require( 'https' )
	},
	fs = require( 'fs' ),
	stream = require( 'stream' ),
	url = require( 'url' ),
	NPromise = require( 'promise' );

/**
 * Downloader method
 *
 * @type {downloadFile}
 */
module.exports = downloadFile;

/**
 * Get the destination as a Writable Stream
 * @param {*} destination
 * @return {stream.Writable}
 */
function destinationAsStream( destination ) {
	"use strict";
	var destStream;
	if ( 'string' === typeof destination ) {
		destStream = fs.createWriteStream( destination, {flags: 'wx+'} );
	} else if ( destination instanceof stream.Writable ) {
		destStream = destination;
	} else {
		throw new TypeError( 'destination must be either a writable stream or string!' );
	}
	return destStream;
}

/**
 * Download the file to a destination
 *
 * @param {String} from
 * @param {stream.Writable|String} to
 * @returns {NPromise}
 */
function downloadFile( from, to ) {
	"use strict";
	return new NPromise( function ( fulfill, reject ) {
		try {
			to = destinationAsStream( to );
		} catch ( e ) {
			reject( e );
		}
		var parsedUrl = url.parse( from ),
			opts = {
				hostname: parsedUrl.hostname,
				path    : parsedUrl.path
			};
		if ( parsedUrl.port ) {
			opts.port = parsedUrl.port;
		}
		if ( parsedUrl.auth ) {
			opts.auth = parsedUrl.auth;
		}
		var transport = transports[parsedUrl.protocol.replace( /:$/, '' )],
			request = transport.request( opts, function ( response ) {
				response.pipe( to );
				response.on( 'end', function () {
					fulfill( to.path );
				} );
				response.on( 'error', reject );
			} );
		request.on( 'error', reject );
		request.end();
	} );
}