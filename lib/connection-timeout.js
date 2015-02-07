/*
 * edited version of 'connect-timeout' by expressjs (https://github.com/expressjs/timeout)
 *
 * limits the maximum connection time allowed for client.
 * sets a time limit via integer of miliseconds or a defaults of 10 seconds
 * and return a middleware that will set a 'timedOut' flag and will emit a 'timeout' event that will spawn an error
 */

var timeout_id,
	onTimeout = function onTimeout(time, callback) {
		var err = new Error('Request Timeout');
		err.status = 408;
		callback(err);
	};

/*
 * sets a time limit for maximum client connection time.
 * will set a 'timedOut' flag and emit a 'timeout' event (that will spawn an error) on connection timeout
 *
 * @param "time" (optional) [mixed] - time limit for ms module. can be a string (like 5s) or an integer of miliseconds
 * @return - a middleware function that sets the timer
 */
module.exports.set = function setConnectionTimeout(time) {
	time = Number(time || 10000);

	clearTimeout(timeout_id);

	return function timeout_middleware(req, res, next) {
		req.timedOut = false;

		timeout_id = setTimeout(
			function() {
				req.timedOut = true;
				req.emit('timeout', time, next);
			},
			time
		);

		req.on('timeout', onTimeout);

		next();
	}
};

/*
 * a middleware function to put between each and every route/middleware.
 * this will stop the routing progress in case of a connection timeout
 */
module.exports.haltOnTimedout = function haltOnTimedout(req, res, next) {
	if(!req.timedOut) {
		next();
	}
};