var kodor = kodor || {};

kodor.uicontrol = function(settings) {
	if (!settings)
		throw new Error('No settings in uicontrol constructor');

	if (settings.Click && settings.Click instanceof kodor.cb)
		this._Click = settings.Click;

	if (settings.ParentNode)
		this._ParentNode = settings.ParentNode;

	if (settings.Html)
		this.initFromHtml(settings.Html);

	if (settings.Class)
		this._Class = settings.Class;
};

kodor.uicontrol.prototype.initFromHtml = function(html) {
	if (!this._DomNode) {
		this._DomNode = $(html);
		if (this._ParentNode)
			this._ParentNode.append(this._DomNode);

		this._defineEvents();
	}
};

kodor.uicontrol.prototype.setHtml = function(html) {
	if (this._DomNode) {
		var content = $(html);
		this._DomNode.replaceWith(content);
		delete this._DomNode; //Check this out
		this._DomNode = content;

		this._defineEvents();
	}
};

kodor.uicontrol.prototype.show = function() {
	if (this._DomNode)
		this._DomNode.show();
};

kodor.uicontrol.prototype.hide = function() {
	if (this._DomNode)
		this._DomNode.hide();
};

kodor.uicontrol.prototype.getParentNode = function() {
	return this._ParentNode;
};

kodor.uicontrol.prototype.setEnabled = function(enabled) {
	var enabled = !!enabled;
	if (enabled) {
		if (this._DomNode)
			this._DomNode[0].onclick = kodor.helper.bind(this._Click, this);
	}
	else
		if (this._DomNode)
			this._DomNode[0].onclick = function () {
				return false
			};
};

kodor.uicontrol.prototype.addToNode = function(node) {
	if (node && this._DomNode)
		node.append(this._DomNode);
};

kodor.uicontrol.prototype._defineEvents = function() {
	if (this._Click)
		this._DomNode[0].onclick = kodor.helper.bind(this._Click, this);
};