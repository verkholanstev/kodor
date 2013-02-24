var kodor = kodor || {};

kodor.blockeditor = function (settings) {
	if (!settings)
		throw new Error('No settings in block editor constructor');
	if (settings.BlockView && settings.BlockView instanceof kodor.blockview && settings.BlockView.getBlock().getIsLoaded()) 
		this._BlockView = settings.BlockView;
	else
		throw new Error('No block in block editor constructor, is not an instance of block or block is not loaded');

	if (settings.Service)
		this._Service = settings.Service;
	else
		this._Service = this._BlockView.getService();

	this._IsHtmlAllowed = settings.IsHtmlAllowed;

	this._Editor = null;
	this._EditorIsVisible = false;
	this._WasEdited = false;

	this.BlockSaved = new kodor.ev();

	this._init();
};

kodor.blockeditor.prototype._init = function() {
	this._BlockView.getBlock().RightsRefreshed.add(new kodor.cb(this._onRightsRefreshed, this));
	this._Editor = $('<textarea class="block-editor"></textarea>');
	this._BlockView.getParentNode().append(this._Editor);
	this._Editor.hide();
	this._EditorIsVisible = false;
	if (this._BlockView.getBlock().getIsEditable()) {
		this.refresh();
	}
	else {
		this._BlockView.getDomNode().addClass('kodor-not-editable');
	}
};

kodor.blockeditor.prototype.disable = function() {
	if (this._EditorIsVisible)
		this.showEditor();
	this._BlockView.getDomNode()[0].onclick = null;
	this._BlockView.getDomNode().removeClass('kodor-editable');
	this._BlockView.getDomNode().removeClass('kodor-not-editable');
};

kodor.blockeditor.prototype.enable = function() {
	this.refresh(); //Alias for referesh method
};

kodor.blockeditor.prototype.refresh = function() {
	this._BlockView.refresh();
	if (this._BlockView.getBlock().getIsEditable()) {
		this._Editor[0].onkeyup = kodor.helper.bind(new kodor.cb(this._onEditorChanged, this)); //Do not do this every refresh (only init)!!!
		this._BlockView.getDomNode()[0].onclick = kodor.helper.bind(new kodor.cb(this._onClick, this)); //Do not repeat yourself
		this._BlockView.getDomNode().addClass('kodor-editable');
		this._Editor.width(this._BlockView.getDomNode().width());
		this._refreshEditorPosition();
	}
	else
		this._BlockView.getDomNode().addClass('kodor-not-editable');
};

kodor.blockeditor.prototype._refreshEditorPosition = function() {
	var offset = this._BlockView.getDomNode().offset();
	this._Editor.css('top', offset.top + this._BlockView.getDomNode().outerHeight());
	this._Editor.css('left', offset.left);
};

kodor.blockeditor.prototype._prepareEditorContent = function(content) {
	if (this._IsHtmlAllowed)
		return content;
	else {
		var c = content.replace(/</g, '&lt;');
		c = c.replace(/>/g, '&gt;');

		c = c.replace(/^=/mg, '<h3>');
		c = c.replace(/=$/mg, '</h3>')

		c = c.replace(/\[h\]/g, '<h4>');
		c = c.replace(/\[\/h\]/g, '</h4>');

		c = c.replace(/\[b\]/g, '<b>');
		c = c.replace(/\[\/b\]/g, '</b>');

		c = c.replace(/\[i\]/g, '<i>');
		c = c.replace(/\[\/i\]/g, '</i>');

		// c = kodor.helper.markupString(c, '=', '<b>', '</b>');
		// c = kodor.helper.markupString(c, '*', '<i>', '</i>');
		// c = kodor.helper.markupString(c, '^', '<h4>', '</h4>');
		
		c = c.replace(/\n\n/g, '</p><p>');
		if (c.indexOf('</p><p>') > -1)
			c = '<p>' + c + '</p>';
		c = c.replace(/\s\s/g, '<br>');
		
		return c;
	}
};

kodor.blockeditor.prototype._prepareBlockContent = function(content) {
	if (this._IsHtmlAllowed)
		return content
	else {
		c = content.replace(/<h4>/g, '[h]');
		c = c.replace(/<\/h4>/g, '[/h]');

		c = c.replace(/<b>/g, '[b]');
		c = c.replace(/<\/b>/g, '[/b]');

		c = c.replace(/<i>/g, '[i]');
		c = c.replace(/<\/i>/g, '[/i]');

		c = c.replace(/<\/p><p>/g, '\n\n');
		if (c.indexOf('\n\n') > -1)
			c = c.replace(/<p>|<\/p>/g, '')

		c = c.replace(/<br>/g, '  ');

		c = c.replace(/&lt;/g, '<');
		c = c.replace(/&gt;/g, '>');
		return c;
	}
};

kodor.blockeditor.prototype.render = function() {
	// var callback = new kodor.cb(this._BlockView.render, this._BlockView, { Callback: new kodor.cb(this._onBlockRendered, this) });
	// callback.trigger(this); //Not a trivial solution

};

kodor.blockeditor.prototype._onBlockRendered = function(sender, args) {
	this._BlockView.getDomNode()[0].onclick = kodor.helper.bind(new kodor.cb(this._onClick, this));
};

kodor.blockeditor.prototype.showEditor = function() {
	if (this._Editor) {
		this._Editor.val(this._prepareBlockContent(this._BlockView.getBlock().getContent()));
		if (this._EditorIsVisible) {
			this._Editor.hide();
			this._EditorIsVisible = false;
		}
		else {
			this._Editor.show();
			this._EditorIsVisible = true;
			this._refreshEditorPosition();
		}
	}
};

kodor.blockeditor.prototype.refreshContent = function() {
	var content = this._prepareEditorContent(this._Editor.val());
	this._BlockView.getBlock().setContent(content);
	this.refresh();
};

kodor.blockeditor.prototype.saveBlock = function() {
	if (this._WasEdited) {
		this._Service.sendRequest({
			Request: {
				Command: 'UpdateBlock',
				Id: this._BlockView.getId(), 
				Content: this._BlockView.getBlock().getContent()
			},
			Callback: new kodor.cb(this._onBlockSaved, this)
		});
	}
	else {
		this.BlockSaved.fire(this, {BlockView: this._BlockView});
	}
};

kodor.blockeditor.prototype.setIsHtmlAllowed = function(value) {
	this._IsHtmlAllowed = !!value;
};

kodor.blockeditor.prototype._onBlockSaved = function(sender, args) {
	console.log(sender, args);
	if (args.status.toLowerCase() == 'updatesuccess') {
		this._WasEdited = false;
		this.BlockSaved.fire(this, {BlockView: this._BlockView});
	}
	else
		throw new Error('Error updating block. ' + args.message);
};

kodor.blockeditor.prototype._onClick = function(sender, args) {
	this.showEditor();
};

kodor.blockeditor.prototype._onEditorChanged = function(sender, args) {
	if (!this._WasEdited)
		this._WasEdited = true;
	this.refreshContent();
};

kodor.blockeditor.prototype._onRightsRefreshed = function(sender, args) {
	//this.refresh();
};