var kodor = kodor || {};

kodor.storage = function(settings) {
	kodor.storage.base.apply(this, arguments);

	this._Items = [];
	this._ItemsList = [];
	this._StorageLink = window.localStorage;
	this._StorageName = 'kodor-storage';
	this._IsSupported = false;

	this._init();
};

kodor.storage.inheritsFrom(kodor.object);

kodor.storage.itemTypes = {
	BLOCK: 'block'
};

kodor.storage.nameTemplates = {
	BLOCK: 'Block Id#{0}'
};

kodor.storage.prototype._init = function() {
	this._IsSupported = this._checkSupport();
	if (this._IsSupported)
		this.deserialize();
};

kodor.storage.prototype._checkSupport = function() {
	try {
            this._StorageLink.setItem('test', 'test');
            this._StorageLink.removeItem('test');
            return true;
    } 
    catch(e) {
            return false;
    }
};

kodor.storage.prototype._writeBlock = function(block) {
	if (!block.getIsLoaded())
		throw new Error('Block is not loaded');
	// this._Items.push(block);

	var index = this.getItemsList().indexOf(kodor.storage.nameTemplates.BLOCK.replace(/\{0\}/, block.getId()));
	if (index > -1) {
		//this.removeItem(block);
		return;
	}

	var obj = {};
	obj.ItemType = kodor.storage.itemTypes.BLOCK;
	obj.Id = block.getId() * 1;
	obj.Content = block.getContent().slice(0);
	obj.Template = block.getTemplate().slice(0);
	obj.Expires = (new Date()).valueOf() + 10 * 60 * 1000;
	// obj.Expires = (new Date()).valueOf() + 30 * 1000;

	this._Items.push(obj);
	this._ItemsList.push(kodor.storage.nameTemplates.BLOCK.replace(/\{0\}/, block.getId()));
};

kodor.storage.prototype._removeBlock = function(block) {
	for (var i = 0; i < this._ItemsList.length; i++) {
		if (this._ItemsList[i] == kodor.storage.nameTemplates.BLOCK.replace(/\{0\}/, block.getId())) {
			this._ItemsList.splice(i, 1);
			this._Items.splice(i, 1);
			// break?
		}
	}
};

kodor.storage.prototype._getBlock = function(block) {
	var index = this._ItemsList.indexOf(kodor.storage.nameTemplates.BLOCK.replace(/\{0\}/, block.getId()));
	if (index > -1)
		return this._Items[index];
	else
		return null;
};

kodor.storage.prototype._getItemName = function(item) {
 	switch (item.ItemType) {
 		case kodor.storage.itemTypes.BLOCK:
 			return kodor.storage.nameTemplates.BLOCK.replace(/\{0\}/, item.Id);
		break;

 		default:
 		throw new Error('Not implemented');
 	}
 }; 

kodor.storage.prototype._serializeBlock = function(item) {
	return JSON.stringify(item);
};

kodor.storage.prototype.writeItem = function(item) {
	if (!item)
		throw new Error("Item equals null");

	if (item instanceof kodor.block) {
		this._writeBlock(item);
	}
};

kodor.storage.prototype.removeItem = function(item) {
	if (!item)
		throw new Error('Item quals null');

	if (item instanceof kodor.block)
		this._removeBlock(item);
};

kodor.storage.prototype.getItem = function(item) {
	if (item instanceof kodor.block)
		return this._getBlock(item);
};

kodor.storage.prototype.serialize = function() {
	var items = [];
	for (var i = 0; i < this._Items.length; i++) {
		if (this._Items[i].ItemType == kodor.storage.itemTypes.BLOCK)
			items.push(this._serializeBlock(this._Items[i]));
	}
	this._StorageLink.setItem(this._StorageName, JSON.stringify(items));
};

kodor.storage.prototype.deserialize = function() {
	try {
		var items = JSON.parse(this._StorageLink.getItem(this._StorageName));
	}
	catch (e) {
		return;
	}

	if (!items)
		return;

	for (var i = 0; i < items.length; i++) {
		var item = JSON.parse(items[i]);

		// console.log(item.Id, new Date(item.Expires), new Date())
		if (item.Expires > (new Date()).valueOf()) {
			if (item.ItemType == kodor.storage.itemTypes.BLOCK) {
				this._Items.push(item);
				this._ItemsList.push(this._getItemName(item));
			}
			else 
				throw new Error('Unknown type of storage item');
		}
	}
};

kodor.storage.prototype.getIsSupported = function() {
	return this._IsSupported;
};

kodor.storage.prototype.getItemsList = function() {
	return this._ItemsList.slice(0);
};

kodor.storage.prototype.clear = function() {
	for (var i = 0; i < this._Items.length; i++)
		this._Items[i].Expires = new Date();
	// this._Items.length = 0;
	// this._ItemsList.length = 0;
};