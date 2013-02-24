var kodor = kodor || {};

kodor.service = function(settings) {
	if (settings) {
		if (settings.EntryPointUrl && typeof settings.EntryPointUrl == 'string')
			this._EntryPointUrl = settings.EntryPointUrl;
		else 
			throw new Error ('Service entry point is not a string');
	};

	this.StartRequest = new kodor.ev();
	this.EndRequest = new kodor.ev();
}

kodor.service.prototype._init = function() {
	
};

kodor.service.prototype.sendRequest = function(request) {
	if (!request || !(request.Callback instanceof kodor.cb))
		throw new Error('Wrong callback for service request');

	this.StartRequest.fire(this);

	$.ajax({
		url: this.getEntryPoint(),
		type: 'POST',
		data: {
			'request' : JSON.stringify(request.Request)
		},
		context: this
	}).done(this._onResponseRecieved(request.Callback, this));
};

kodor.service.prototype._onResponseRecieved = function(callback, self) {
	return function(data, status) {
		if (callback) {
			var json = typeof data == 'string' ? JSON.parse(data) : data;
			self.EndRequest.fire(self);
			callback.trigger(this, json);
		}
	}
};

kodor.service.prototype.getEntryPoint = function() {
	return this._EntryPointUrl + (navigator.userAgent.indexOf('OS 6_0') > -1 ? '?t=' + new Date().valueOf() : '');
};
