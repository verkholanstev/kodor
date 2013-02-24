var kodor = kodor || {};

kodor.application = function (settings) {
	if (settings.InitPage)
		this._InitPage = settings.InitPage.toLowerCase();
	else
		this._InitPage = 'index';
	this._Service = null;
	this._Storage = null;
	this._Auth = null;
	this._Modules = null;
	this._Pages = [];
	this._CurrentPage = null;
	this._PageEditor = null;

	$.ajax({
		// url: '/settings.json',
		url: 'settings.json',
		type: 'GET',
		context: this
	}).done(this._onSettingsRecieved);
};

kodor.application.prototype._onSettingsRecieved = function(data, status) {
	 if (typeof data == "string")
	 	data = JSON.parse(data);

	this._Settings = data;
	this._init(data);
};

kodor.application.prototype._showLoader = function() {
	if (this._LoaderNode)
		this._LoaderNode.show();
};

kodor.application.prototype._hideLoader = function() {
	if (this._LoaderNode)
		this._LoaderNode.hide();
};

kodor.application.prototype._init = function (settings) {
	this._LoaderNode = $(
		[
		'<div class="kodor-loader">',
			// '<img src="/img/loader.gif"/>',
			'<img src="img/loader.gif"/>',
		'</div>',
		].join('')
	);
	$('body').append(this._LoaderNode);
	this._hideLoader();

	window.onunload = kodor.helper.bind(new kodor.cb(this._onUnload, this));

	this._Service = new kodor.service({
		EntryPointUrl: this._Settings.EntryPointUrl
	});
	this._Service.StartRequest.add(new kodor.cb(function () {
		this._showLoader();
	}, this));
	this._Service.EndRequest.add(new kodor.cb(function () {
		this._hideLoader();
	}, this));

	this._Storage = new kodor.storage();

	this._Auth = new kodor.auth({
		Service: this._Service
	});
	this._Auth.UserLoggedIn.add(new kodor.cb(this._onUserLoggedIn, this));
	this._Auth.LoginFailed.add(new kodor.cb(this._onError, this));
	this._Auth.LogoutFailed.add(new kodor.cb(this._onError, this));

	this._Auth.sayHello(new kodor.cb(this._onHelloRecieved, this));
};

kodor.application.prototype._render = function() {
	this._Mcc = new kodor.mcc({
		ParentNode: $('body'),
		Application: this
	});
};

kodor.application.prototype.getCurrentPage = function() {
	return this._CurrentPage;
};

kodor.application.prototype.setPageEditor = function(editor) {
	if (editor && editor instanceof kodor.pageeditor) {
		this._PageEditor = editor;
	}
};

kodor.application.prototype.getPageEditor = function() {
	return this._PageEditor;
};

kodor.application.prototype.getAuth = function() {
	return this._Auth;
};

kodor.application.prototype.getStorage = function() {
	return this._Storage;
};

kodor.application.prototype._onHelloRecieved = function(sender, args) {
	this._Service.sendRequest({
		Request: {
			Command: 'GetPage',
			Name: this._InitPage
		},
		Callback: new kodor.cb(this._onPageRecieved, this)
	});

	// this._Service.sendRequest({
	// 	Request: {
	// 		Command: 'GetPages'
	// 	},
	// 	Callback: new kodor.cb(this._onGetPages, this)
	// });
};

kodor.application.prototype._onPageRecieved = function(sender, args) {
	if (args.status.toLowerCase() == 'ok') {
		this._CurrentPage = new kodor.page({
			Id: args.page.id,
			Name: args.page.name,
			Url: args.page.url,
			Template: args.page.template,
			Content: JSON.parse(args.page.content),
			Service: this._Service,
			Storage: this._Storage,
			ParentNode: $('body')
		})
		this._CurrentPage.PageLoaded.add(new kodor.cb(this._onPageLoaded, this));
		this._CurrentPage.render();
	}
	else
		this._showNoPageMessage();
};

kodor.application.prototype._onGetPages = function(sender, args) {
	if (args.status.toLowerCase() == 'ok') {

		this._Pages = [];

		for (var i = 0; i < args.pages.length; i++) {
			var p = new kodor.page({
				Id: args.pages[i].id,
				Name: args.pages[i].name,
				Url: args.pages[i].url,
				Service: this._Service,
				Storage: this._Storage,
				ParentNode: $('body')
			});
			this._Pages.push(p);
		};

		var haveIndex = false;

		for (var i = 0; i < this._Pages.length; i++) {
			if(this._Pages[i].getName().toLowerCase() == this._InitPage.toLowerCase()) {
				this._Pages[i].PageLoaded.add(new kodor.cb(this._onPageLoaded, this));
				this._Pages[i].render();
				this._CurrentPage = this._Pages[i];
				haveIndex = true;
				break;
			}
		}
		if (!haveIndex) {
			// throw new Error ('There is no index page');
			this._showNoPageMessage();
		}
	}
	else
		throw new Error('Can\'t get pages');
};

kodor.application.prototype._showNoPageMessage = function() {
	var message = $([
		'<div class="kodor-no-page-msg">',
			'<div class="kodor-no-page-msg-header">',
				this._Settings.NoPageMessage.Header,
			'</div>',
			'<div class="kodor-no-page-msg-text">',
				this._Settings.NoPageMessage.Txt,
			'</div>',
		'</div>'
		].join(''));
	$('body').append(message);
};

kodor.application.prototype._onPageLoaded = function(sender, args) {
	this._PageEditor = new kodor.pageeditor({
		Page: this._CurrentPage,
		IsHtmlAllowed: this._Auth.getIsHtmlAllowed()
	});

	this._PageEditor.PageSaved.add(new kodor.cb(this._onPageSaved, this));

	this._render();
};

kodor.application.prototype._onGetIndexPage = function(sender, args) {
	//console.log('Index page recieved', args);
};

kodor.application.prototype._onUserLoggedIn = function(sender, args) {
	if (this._CurrentPage)
		this._CurrentPage.refreshRights();
	if (this._PageEditor)
		this._PageEditor.setIsHtmlAllowed(this._Auth.getIsHtmlAllowed());
};

kodor.application.prototype._onPageSaved = function(sender, args) {
	this._Mcc.setMessage('Page saved');
};

kodor.application.prototype._onError = function(sender, args) {
	this._Mcc.setMessage(args.Error + ' (' + new Date(args.Timestamp).toLocaleString() + ')');
};

kodor.application.prototype._onUnload = function(sender, args) {
	if (this._Storage && this._Storage.getIsSupported()) {
		this._CurrentPage.writeCache();
		this._Storage.serialize();
	}
};