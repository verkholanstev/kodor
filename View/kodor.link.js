var kodor = kodor || {};

kodor.link = function(settings) {
	if (!settings)
		throw new Error('No settings in link constructor');

	if (settings.Html)
		settings.Html = null;

	kodor.link.base.apply(this, arguments);

	if (settings.Content)
		this.setContent(settings.Content);
	else
		this.setContent('');
	
}

kodor.link.inheritsFrom(kodor.uicontrol);

kodor.link.prototype.setContent = function(content) {
	var html = '<a href="#" class="' + (this._Class ? this._Class : '') + '">' + content + '</a>';
	if (this._DomNode)
		this.setHtml(html);
	else
		this.initFromHtml(html);
	this._Content = content;
};
kodor.link.prototype.getContent = function() {
	return this._Content;
};