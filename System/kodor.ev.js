var kodor = kodor || {};

kodor.ev = function(settings) {
	this._Listeners = [];
};

kodor.ev.prototype.add = function(cbObj) {
	if (!(cbObj instanceof kodor.cb))
		throw new Error('cbObj is not an instance of cb');
	this._Listeners.push(cbObj);
};

kodor.ev.prototype.clear = function() {
	this._Listeners.length = 0; //Clearing without creating new array
};

kodor.ev.prototype.fire = function(sender, args) {
	for (var i = 0; i < this._Listeners.length; i++) {
		this._Listeners[i].trigger(sender, args);
	}
};

