var kodor = kodor || {};

kodor.cb = function(callback, context, args) {
	if (typeof callback != 'function') {
		throw new Error('Callback is not a function ', callback);
		return null;
	}
	else {
		this._Callback = callback;
	}

	this._Context = context;
	this._Arguments = args;
};

kodor.cb.prototype.trigger = function(sender, args) {
	if (this._Arguments) {
		if (!args)
			args = {};
		args.cbArgs = this._Arguments;
	};
	this._Callback.call(this._Context, sender, args);
};