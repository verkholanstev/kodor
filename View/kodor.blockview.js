var kodor = kodor || {};

kodor.blockview = function (settings) {
	this._Id = null;
	this._Service = null;
	this._ParentNode = null;
	this._Name = null;
	this._Storage = null;

	kodor.blockview.base.apply(this, arguments);

	this._Block = null;
	this._DomNode = null;

	this._init();
	//this.render();
};

kodor.blockview.inheritsFrom(kodor.object);

kodor.blockview.prototype._init = function() {
	this._Block = new kodor.block({
		Id: this._Id,
		Service: this._Service,
		Storage: this._Storage
	});
	this._Block.BlockLoaded.add(new kodor.cb(this._onBlockLoaded, this));
};

kodor.blockview.prototype._showLoader = function() {
	var content = $(
		[
		'<div class="container">',
			'<div class="row">',
				'<div class="span12 loader">',
					'<img src="/img/loader.gif"/>',
				'</div>',
			'</div>',
		'</div>'
		].join('')
	);
	this._DomNode.replaceWith(content);
	this._DomNode = content;
};

kodor.blockview.prototype.render = function() {
	

	// \this._showLoader();
	this._Block.load();
};

kodor.blockview.prototype.refresh = function() {
	if (this._Block.getIsLoaded()) {
		var template = this._Block.getTemplate().split('{0}');
		var content = $(template[0] + this._Block.getContent() + template[1]);
		if (!this._DomNode) {
			this._ParentNode.append(content);
		}
		else {
			this._DomNode.replaceWith(content);
		}
		delete this._DomNode;
		this._DomNode = content;
	}
};

kodor.blockview.prototype.getId = function() {
	return this._Id;
};

kodor.blockview.prototype.getBlock = function() {
	return this._Block;
};

kodor.blockview.prototype.setParentNode = function(node) {
	this._ParentNode = node;
};

kodor.blockview.prototype.getService = function() {
	return this._Service;
};

kodor.blockview.prototype.getParentNode = function() {
	return this._ParentNode;
};

kodor.blockview.prototype.getDomNode = function() {
	return this._DomNode;
};

kodor.blockview.prototype._onBlockLoaded = function(sender, args) {
	this.refresh();
};