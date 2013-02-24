var kodor = kodor || {};

kodor.page = function(settings) {
	this._IsLoaded = false;

	if (settings) {
		if (settings.Id)
			this._Id = settings.Id;
		else {
			// throw new Error('No id for page', this);
			// return null;
		}

		if (settings.Name)
			this._Name = settings.Name;
		else {
			throw new Error('No name for page', this);
		}

		if (settings.Service) 
			this._Service = settings.Service;
		else {
			throw new Error('No service for page', this._Id);
		}

		if (settings.Storage)
			this._Storage = settings.Storage
		else
			this._Storage = null;

		this._ParentNode = settings.ParentNode;
	}

	this._Content = settings.Content;
	this._Template = settings.Template;
	this._Blocks = [];
	this._ChildNodes = [];
	//this._LoaderNode = null;

	this._ActualBlocksCount = 0;
	this.PageLoaded = new kodor.ev();
	this.RightsRefreshed = new kodor.ev();

	this._init();
};

kodor.page.prototype._init = function() {
	// this.PageLoaded.add(new kodor.cb(function() {
	// 	if (this._LoaderNode)
	// 		this._LoaderNode.hide();
	// }, this));

	this._ChildNodes = kodor.helper.parseNodes(this._Template);

	this._Blocks = [];
	//var content = args.page.content;
	for (var i = 0; i < this._Content.length; i++) {
		var b = new kodor.blockview({
			Id: this._Content[i],
			//Name: this._Content[i].name,
			Service: this._Service,
			Storage: this._Storage
		});
		b.getBlock().BlockLoaded.add(new kodor.cb(this._onBlockLoaded, this));
		b.getBlock().RightsRefreshed.add(new kodor.cb(this._onRightsRefreshed, this));
		this._Blocks.push(b);
	}

	this._IsLoaded = true;

	this.render();
};

kodor.page.prototype._renderStructure = function(parent, nodes) {
	if (!parent)
		parent = this._ParentNode;
	if (!nodes)
		nodes = this._ChildNodes;

	var curBlockIndex = 0;
	for (var i = 0; i < nodes.length; i++) {
		parent.append(nodes[i].node);
		if (nodes[i].id || nodes[i].id === 0) {
			// for (var j = 0; j < this._Content.length; j++) {
			// 	if (nodes[i].id == this._Content[j].getId()) {
			// 		this._Content[j].setParentNode(nodes[i].node);
			// 		break;
			// 	}
			// }
			this._Blocks[curBlockIndex++].setParentNode(nodes[i].node);
		}
		if (nodes[i].childs) {
			this._renderStructure(nodes[i].node, nodes[i].childs);
		}
	}
};

// page.prototype._showLoader = function() {
// 	this._LoaderNode = $(
// 		[
// 		'<div class="kodor-loader">',
// 			'<img src="/img/loader.gif"/>',
// 		'</div>',
// 		].join('')
// 	);
// 	this._ParentNode.append(this._LoaderNode);
// };

// page.prototype._parseContent = function(str) {
// 	if (!str)
// 		str = this._Template;
// };

kodor.page.prototype.writeCache = function() {
	if (this._Storage && this._Storage.getIsSupported()) {
		for (var i = 0; i < this._Blocks.length; i++) {
			this._Storage.writeItem(this._Blocks[i].getBlock());
		}
	}
 };

kodor.page.prototype.render = function() {
	// if (!this._IsLoaded) {
	// 	this.load(new kodor.cb(this.render, this));
	// }
	// else {
		this._renderStructure();
		this._ActualBlocksCount = 0;
		for (var i = 0; i < this._Blocks.length; i++) {
			this._Blocks[i].render();
		}
	// }
};

kodor.page.prototype.load = function(callback) {
	if (!callback || !(callback instanceof kodor.cb)) {
		throw new Error('Callback is null or is not an instance of cb');
	}

	//this._showLoader();

	// this._Service.sendRequest({
	// 	Request: { 
	// 		Command: 'GetPage',
	// 		Id: this._Id
	// 	},
	// 	Callback: new kodor.cb(this._onPageLoaded, this, {Callback: callback})
	// })
};

kodor.page.prototype.refreshRights = function() {
	this._ActualBlocksCount = 0;
	for (var i = 0; i < this._Blocks.length; i++) {
		this._Blocks[i].getBlock().refreshRights();
	}
};

kodor.page.prototype.getName = function() {
	return this._Name;
};

kodor.page.prototype.getContent = function(callback, forceRefresh) {
	if (!callback || !(callback instanceof kodor.cb)) {
		throw new Error('Callback is null or is not an instance of cb');
	}
	if (forceRefresh || !this._IsLoaded) {
		this.load(new kodor.cb(this._onContentLoaded, this, {Callback: callback}));
	}
	if (!forceRefresh && this._IsLoaded) {
		callback.trigger(this, this._Blocks);
	}
};

kodor.page.prototype.getIsLoaded = function() {
	return this._IsLoaded;
};

kodor.page.prototype.getService = function() {
	return this._Service;
};

kodor.page.prototype._onContentLoaded = function(sender, args) {
	if (!args.cbArgs)
		throw new Error('No callback arguments in handler');

	var callback = args.cbArgs.Callback;
	delete args.cbArgs;
	callback.trigger(this, this._Blocks);
};

kodor.page.prototype._onPageLoaded = function(sender, args) {
	if (!args.cbArgs)
		throw new Error('No callback arguments in handler');

	this._Template = args.page.template;
	this._ChildNodes = kodor.helper.parseNodes(this._Template);

	this._Blocks = [];
	var content = args.page.content;
	for (var i = 0; i < content.length; i++) {
		var b = new kodor.blockview({
			Id: content[i].id,
			Name: content[i].name,
			Service: this._Service,
			Storage: this._Storage
		});
		b.getBlock().BlockLoaded.add(new kodor.cb(this._onBlockLoaded, this));
		b.getBlock().RightsRefreshed.add(new kodor.cb(this._onRightsRefreshed, this));
		this._Blocks.push(b);
	}

	this._IsLoaded = true;

	var callback = args.cbArgs.Callback;
	delete args.cbArgs;
	callback.trigger(sender, args);
};

kodor.page.prototype._onBlockLoaded = function(sender, args) {
	this._ActualBlocksCount++;
	if (this._ActualBlocksCount == this._Blocks.length) {
		this.PageLoaded.fire(this, {Page: this});
	};
};

kodor.page.prototype._onRightsRefreshed = function(sender, args) {
	this._ActualBlocksCount++;
	if (this._ActualBlocksCount == this._Blocks.length) {
		this.RightsRefreshed.fire(this, {Blocks: this._Blocks});
	}
};