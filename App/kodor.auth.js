var kodor = kodor || {};

kodor.auth = function (settings) {
	if (!settings)
		throw new Error ("No settings in auth constructor");

	if (settings.Service)
		this._Service = settings.Service;
	else
		throw new Error ("No service in auth constructor");

	this.UserLoggedIn = new kodor.ev();
	this.UserLoggedOut = new kodor.ev();
	this.LoginFailed = new kodor.ev();
	this.LogoutFailed = new kodor.ev();

	this._Username = null;
	this._IsHtmlAllowed = false;
};

kodor.auth.prototype._init = function() {
	
};

kodor.auth.prototype.checkSession = function() {
	this._Service.sendRequest({
		Request: {
			Command: 'CheckSession'
		},
		Callback: new kodor.cb(this._onSessionChecked, this)
	})
};

kodor.auth.prototype.sayHello = function(callback) {
	this._Service.sendRequest({
		Request: {
			Command: 'Hello'
		},
		Callback: new kodor.cb(this._onHelloRecieved, this, {Callback: callback})
	});
};

kodor.auth.prototype._onHelloRecieved = function(sender, args) {
	if (args.status.toLowerCase() == 'ok') {
		if (args.session) {
			kodor.helper.setCookie('session', args.session.sessionId, args.session.expires);
			var username = args.session.username,
				isHtmlAllowed = args.session.isHtmlAllowed;

			if (typeof isHtmlAllowed == 'string')
				isHtmlAllowed = !!parseInt(isHtmlAllowed, 10);

			this._IsHtmlAllowed = isHtmlAllowed;

			if (username)
				this.setUsername(username);
			else 
				throw new Error('No username in hello response');
			if (args.cbArgs) {
				var callback = args.cbArgs.Callback;
				delete args.cbArgs;
			}
			if (callback)
				callback.trigger(this, args);
		}
		else
			throw new Error('No session in hello response')
	}
	else if (args.status.toLowerCase() == 'sessionerror') {
		kodor.helper.removeCookie('session');
		this.sayHello(new kodor.cb(this._onHelloRecieved, this, {Callback: args.cbArgs.Callback}));
	}
		
	else
		throw new Error('No connection');
};

kodor.auth.prototype.login = function(password) {
	if (this._Username)
		this._Service.sendRequest({
			Request: {
				Command: 'Login',
				User: this._Username,
				Password: password //Must use md5 hash
			},
			Callback: new kodor.cb(this._onLoginResponse, this)
		});
	else
		throw new Error('No username in auth');
};

kodor.auth.prototype.logout = function() {
	if (this._Username) {
		this._Service.sendRequest({
			Request: {
				Command: 'Logout',
				User: this._Username
			},
			Callback: new kodor.cb(this._onLogoutResponse, this)
		})
	}
};

kodor.auth.prototype.setUsername = function(name) {
	//if (!this._Username)
	this._Username = name;
};

kodor.auth.prototype.getUsername = function() {
	return this._Username;
};

kodor.auth.prototype.getIsHtmlAllowed = function() {
	return !!this._IsHtmlAllowed;
};

kodor.auth.prototype._onSessionChecked = function(sender, args) {
	// if (args.status && args.status.toLowerCase() == 'ok') {
	// 	kodor.helper.setCookie('session', args.sessionId);
	// }
};

kodor.auth.prototype._onLoginResponse = function(sender, args) {
	if (args.status.toLowerCase() == 'loginsuccess') {
		kodor.helper.setCookie('session', args.session.sessionId, args.session.expires);
		var isHtmlAllowed = args.session.isHtmlAllowed;
		if (typeof isHtmlAllowed == 'string')
			isHtmlAllowed = parseInt(isHtmlAllowed, 10);
		this._IsHtmlAllowed = !!isHtmlAllowed;
		this.UserLoggedIn.fire(this, {Username: args.session.username});
	}
	else 
		this.LoginFailed.fire(this, {Error: args.error, Timestamp: args.timestamp});
};

kodor.auth.prototype._onLogoutResponse = function(sender, args) {
	if (args.status.toLowerCase() == 'logoutsuccess') {
		kodor.helper.removeCookie('session');
		this.sayHello(new kodor.cb(function (sender, args) {
			this.UserLoggedOut.fire(this);
		}, this));
	}
	else {
		this.LogoutFailed.fire(this, {Error: args.error, Timestamp: args.timestamp});
	}
};