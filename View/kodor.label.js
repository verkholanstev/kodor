var kodor = kodor || {};

kodor.label = function(settings) {
	if (!settings)
		throw new Error('No settings in label constructor');

	if (settings.Html)
		settings.Html = null;

	kodor.label.base.apply(this, arguments);

	if (settings.Content)
		this.setContent(settings.Content);
	else
		this.setContent('');
	
}

kodor.label.inheritsFrom(kodor.uicontrol);

kodor.label.prototype.setContent = function(content) {
	var html = '<span class="' + (this._Class ? this._Class : '') + '">' + content + '</span>';
	if (this._DomNode)
		this.setHtml(html);
	else
		this.initFromHtml(html);
	this._Content = content;
};

kodor.label.prototype.getContent = function() {
	return this._Content;
};