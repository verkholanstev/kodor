var kodor = kodor || {};

kodor.button = function(settings) {
	if (!settings)
		throw new Error('No settings in button constructor');

	if (settings.Html)
		settings.Html = null;

	kodor.button.base.apply(this, arguments);

	if (settings.Content)
		this.setContent(settings.Content);
	else
		this.setContent('');

	this._Enabled = true;
	
}

kodor.button.inheritsFrom(kodor.uicontrol);

kodor.button.prototype.setContent = function(content) {
	var html = '<button class="' + (this._Class ? this._Class : 'btn') + '">' + content + '</button>';
	if (this._DomNode)
		this.setHtml(html);
	else
		this.initFromHtml(html);
	this._Content = content;
};

kodor.button.prototype.getContent = function() {
	return this._Content;
};

kodor.button.prototype.setEnabled = function(enabled) {
	kodor.button.base.prototype.setEnabled.apply(this, arguments);
	
	var enabled = !!enabled;
	if (enabled) {
		// this._DomNode.attr('disabled', 'disabled');
		this._DomNode.removeClass('disabled');
	}
	else
		this._DomNode.addClass('disabled');
};