var kodor = kodor || {};

kodor.object = function(settings) {
	for (var s in settings) {
		if (settings.hasOwnProperty(s)) {
			if (this['_' + s] === null)
				this['_' + s] = settings[s];
			else
				throw new Error('No such property in constructor: ' + s);
		}
	}
};