var kodor = kodor || {};

kodor.input = function(settings) {
	if (!settings)
		throw new Error('No settings in input constructor');

	if (settings.Html)
		settings.Html = null;

	kodor.input.base.apply(this, arguments);

	if (settings.Name)
		this._Name = settings.Name;
	else
		throw new Error('No name in input constructor settings');

	if (settings.Type)
		this._Type = settings.Type;
	else
		throw new Error('No type in input constructor settings');

	if (settings.Placeholder)
		this._Placeholder = settings.Placeholder;
	else
		this._Placeholder = '';

	// if (settings.Value)
	// 	this._Value = settings.Value;

	this._render();
	
}

kodor.input.inheritsFrom(kodor.uicontrol);

kodor.input.prototype._render = function(content) {
	var html = '<input name="' + this._Name + '" class="' + (this._Class ? this._Class : '') + '" type="' + this._Type + '" placeholder="' + this._Placeholder + '">';
	if (this._DomNode)
		this.setHtml(html);
	else
		this.initFromHtml(html);
	this._Content = content;
};

kodor.input.prototype.getValue = function() {
	if (this._DomNode) {
		return this._DomNode.val();
	}
};

kodor.input.prototype.setValue = function(value) {
	if (this._DomNode) {
		this._DomNode.val(value);
	}
};