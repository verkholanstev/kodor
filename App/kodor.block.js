var kodor = kodor || {};

kodor.block = function (settings) {
	if (settings) {
		if (settings.Id) {
			this._Id = settings.Id;
		}
		else {
			throw new Error('No id for block');
			return null;
		}
		if (settings.Service && settings.Service instanceof kodor.service) {
			this._Service = settings.Service;
		}
		else {
			throw new Error('No service in block constructor or service is not an instance of service');
			return null;
		}
		if (settings.Template) {
			this._Template = settings.Template;
		}
		else {
			this._Template = '<div id="' + this._Id + '">{0}</div>';
		}
		if (settings.Storage)
			this._Storage = settings.Storage;
		else
			this._Storage = null;

		//this._ParentNode = settings.ParentNode;
	}
	else {
		throw new Error('No settings for block constructor');
		return null;
	}

	this._IsLoaded = false;
	this._IsEditable = false;
	this._Content = null;

	this.BlockLoaded = new kodor.ev();
	this.RightsRefreshed = new kodor.ev();

	if (this._Storage)
		this._loadFromStorage();
};

kodor.block.prototype._loadFromStorage = function() {
	var block = this._Storage.getItem(this);
	if (block) {
		this._Template = block.Template;
		this._Content = block.Content;
		this._IsLoaded = true;
		this.refreshRights();
	}
	else
		return;
};

kodor.block.prototype.load = function(callback, force) {
	if (this._IsLoaded && !force) {
		if (callback)
			callback.trigger(this);

		this.BlockLoaded.fire(this);
		return;
	}

	this._Service.sendRequest({
		Request: {
			Command: 'GetBlock',
			Id: this._Id
		},
		Callback: new kodor.cb(this._onBlockLoaded, this, {Callback: callback})
	});
};

kodor.block.prototype.refreshRights = function() {
	if (this._IsLoaded) {
		this._Service.sendRequest({
			Request: {
				Command: 'GetBlockRights',
				Id: this._Id
			},
			Callback: new kodor.cb(this._onRightsRefreshed, this)
		});
	}
	else
		throw new Error('Block is not loaded (while refresing rights)');
};

kodor.block.prototype.setParentNode = function(node) {
	this._ParentNode = node;
};

kodor.block.prototype.setContent = function(content) {
	this._Content = content;
};

kodor.block.prototype.getParentNode = function() {
	return this._ParentNode;
};

kodor.block.prototype.getService = function() {
	return this._Service;
};

kodor.block.prototype.getIsLoaded = function() {
	return this._IsLoaded;
};

kodor.block.prototype.getDomNode = function() {
	return this._BlockNode;
};

kodor.block.prototype.getId = function() {
	return this._Id;
};

kodor.block.prototype.getTemplate = function() {
	return this._Template;
};

kodor.block.prototype.getContent = function() {
	return this._Content;
};

kodor.block.prototype.getIsEditable = function() {
	return this._IsEditable;
};

kodor.block.prototype._onBlockLoaded = function(sender, args) {
	if (!args.cbArgs) {
		throw new Error('No callback arguments');
	}

	this._Content = args.block.content;
	this._Template = args.block.template;
	this._IsEditable = args.block.editable;
	this._IsLoaded = true;

	if (args && args.cbArgs && args.cbArgs.Callback) {
		var callback = args.cbArgs.Callback;
		delete args.cbArgs;
		callback.trigger(sender, args);
	}

	this.BlockLoaded.fire(this, {Block: this});
};

kodor.block.prototype._onRightsRefreshed = function(sender, args) {
	if (args.status.toLowerCase() == 'ok') {
		this._IsEditable = args.block.editable;
		this.RightsRefreshed.fire(this, {Editable: this._IsEditable});
	}
	else
		throw new Error('Error with refreshing rights');
};