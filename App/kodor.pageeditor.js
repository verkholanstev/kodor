var kodor = kodor || {};

kodor.pageeditor = function (settings) {
	if (!settings)
		throw new Error('No settings in page editor constructor');

	if (settings.Page && settings.Page instanceof kodor.page && settings.Page.getIsLoaded())
		this._Page = settings.Page;
	else
		throw new Error('No page in page editor constructor, page is not instance of page or page is not loaded');

	if (settings.Service && settings.Service instanceof kodor.service)
		this._Service = settings.Service;
	else
		this._Service = this._Page.getService();

	this._IsHtmlAllowed = !!settings.IsHtmlAllowed;

	this._BlockEditors = [];
	this._SavedCount = 0;

	this.PageSaved = new kodor.ev();

	//this._init();
};

kodor.pageeditor.prototype._init = function() {
	this._Page.getContent(new kodor.cb(this._onPageContentGetted, this), false);
};

kodor.pageeditor.prototype.savePage = function() {
	this._SavedCount = 0;
	for (var i = 0; i < this._BlockEditors.length; i++) {
		this._BlockEditors[i].saveBlock();
	}
};

kodor.pageeditor.prototype.enable = function() {
	if (this._BlockEditors.length == 0) {
		this._init();
	}
	// else {
	// 	this._Page.refreshRights();
	// }
	
	for (var i = 0; i < this._BlockEditors.length; i++)
		this._BlockEditors[i].enable();
};

kodor.pageeditor.prototype.disable = function() {
	for (var i = 0; i < this._BlockEditors.length; i++)
		this._BlockEditors[i].disable();
};

kodor.pageeditor.prototype.setIsHtmlAllowed = function(value) {
	this._IsHtmlAllowed = !!value;
	for (var i = 0; i < this._BlockEditors.length; i++) {
		this._BlockEditors[i].setIsHtmlAllowed(this._IsHtmlAllowed);
	}
};

kodor.pageeditor.prototype._onPageContentGetted = function(sender, args) {
	for (var i = 0; i < args.length; i++) {
		var editor = new kodor.blockeditor({
			BlockView: args[i],
			IsHtmlAllowed: this._IsHtmlAllowed,
		});
		editor.BlockSaved.add(new kodor.cb(this._onBlockSaved, this));
		this._BlockEditors.push(editor);
	}
	//this._Page.refreshRights();
};

kodor.pageeditor.prototype._onBlockSaved = function(sender, args) {
	this._SavedCount++;
	if (this._SavedCount == this._BlockEditors.length)
		this.PageSaved.fire(this, {Page: this._Page});
};