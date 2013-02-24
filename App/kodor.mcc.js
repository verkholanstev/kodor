var kodor = kodor || {};

kodor.mcc = function(settings) {
	if (!settings)
		throw new Error ('No settings in mcc constructor');

	if (settings.ParentNode)
		this._ParentNode = settings.ParentNode;
	else
		throw new Error ('No parent node in mcc constructor');

	if (settings.Application && settings.Application instanceof kodor.application)
		this._Application = settings.Application
	else
		throw new Error ('No application in mcc constructor');

	this._render();
};

kodor.mcc.state = {
	'HIDED': 'hided',
	'GUEST': 'guest',
	'USER': 'user',
	'PAGEEDIT': 'pageedit'
};

kodor.mcc.prototype._render = function() {
	this._Application.getAuth().UserLoggedIn.add(new kodor.cb(this._onUserLoggedIn, this));
	this._Application.getAuth().UserLoggedOut.add(new kodor.cb(this._onUserLoggedOut, this));
	this._Application.getAuth().LoginFailed.add(new kodor.cb(this._onLoginFailed, this));

	this._Application.getPageEditor().PageSaved.add(new kodor.cb(this._onPageSaved, this));

	this._LockNode = $([
		'<div id="kodor-lock">',
		'</div>',
		].join(''))

	this._MainNode = $([
		'<div class="navbar">',
			'<div class="navbar-inner">',
				'<div id="kodor-username">',
				'</div>',
				'<ul class="nav">',
					'<li id="kodor-edit-page"></li>',
					'<li id="kodor-save-page"></li>',
					'<li id="kodor-clear-cache"></li>',
					//'<li id="kodor-logout"></li>',
					'<li class="divider-vertical"></li>',
					'<li id="kodor-message"></li>',
				'</ul>',
				'<form class="navbar-form pull-right" id="kodor-login-form">',
				'</form>',
				'<form class="navbar-form pull-right" id="kodor-logout">',
				'</form>',
			'</div>',
		'</div>'
		].join(''));

	if (this._ParentNode) {
		this._ParentNode.prepend(this._LockNode);
		this._ParentNode.prepend(this._MainNode);

		this._LockButton = new kodor.link({
			ParentNode: $('div#kodor-lock'),
			Content: '&darr;',
			Class: '',
			Click: new kodor.cb(this._onLockButtonClick, this)
		});

		this._UsernameButton = new kodor.link({
			ParentNode: $('div#kodor-username'),
			Class: 'brand',
			Content: this._Application.getAuth().getUsername(),
			Click: new kodor.cb(this._onUsernameButtonClick, this)
		});

		this._UsernameInput = new kodor.input({
			ParentNode: $('form#kodor-login-form'),
			Name: 'Username',
			Type: 'text',
			Class: 'input-small',
			Placeholder: 'Username'
		});

		this._PasswordInput = new kodor.input({
			ParentNode: $('form#kodor-login-form'),
			Name: 'Password',
			Type: 'password',
			Class: 'input-small',
			Placeholder: 'Password'
		});

		this._LoginButton = new kodor.button({
			ParentNode: $('form#kodor-login-form'),
			Content: 'Login',
			Click: new kodor.cb(this._onLoginButtonClick, this)
		});

		this._EditPageButton = new kodor.link({
			ParentNode: $('li#kodor-edit-page'),
			Content: 'Edit page',
			Click: new kodor.cb(this._onEditPageButtonClick, this)
		});

		this._SavePageButton = new kodor.link({
			ParentNode: $('li#kodor-save-page'),
			Content: 'Save page',
			Click: new kodor.cb(this._onSavePageButtonClick, this)
		});

		this._ClearCacheButton = new kodor.link({
			ParentNode: $('li#kodor-clear-cache'),
			Content: 'Clear cache',
			Click: new kodor.cb(this._onClearCacheButtonClick, this)
		});

		this._LogoutButton = new kodor.button({
			ParentNode: $('form#kodor-logout'),
			Content: 'Logout',
			Click: new kodor.cb(this._onLogoutButtonClick, this)
		});

		this._MessageLabel = new kodor.label({
			ParentNode: $('li#kodor-message'),
			Content: '',
			Class: 'navbar-text'
		})

		this.changeState(kodor.mcc.state.HIDED);
	}
};

kodor.mcc.prototype._hideAll = function() {
	for (var el in this) {
		if (this[el] instanceof kodor.uicontrol)
			this[el].hide();
	}
	this._LockNode.hide();
	this._MainNode.hide();
};

kodor.mcc.prototype.setMessage = function(message) {
	//this._MessageLabel.hide();
	this._MessageLabel.setContent(message);
	//this._MessageLabel.show(500);
};

kodor.mcc.prototype.changeState = function(state) {
	this._hideAll();
	this._UsernameButton.show();
	this._MessageLabel.show();
	this._UsernameButton.setContent(this._Application.getAuth().getUsername());
	switch (state) {
		case kodor.mcc.state.HIDED:
			this._LockNode.show();

			this._LockButton.show();
		break;

		case kodor.mcc.state.GUEST:
			this._MainNode.show();
			this._ClearCacheButton.show();

			this._UsernameInput.show();
			this._PasswordInput.show();
			this._LoginButton.show();
			this._LoginButton.setEnabled(true);
		break;

		case kodor.mcc.state.USER:
			this._MainNode.show();
			this._ClearCacheButton.show();

			this._EditPageButton.show();
			//this._SavePageButton.show();
			this._LogoutButton.show()
		break;

		case kodor.mcc.state.PAGEEDIT:
			this._MainNode.show();
			this._ClearCacheButton.show();

			this._SavePageButton.show();
			this._LogoutButton.show()
		break;
	}
};

kodor.mcc.prototype.hide = function() {
	if (this._MainNode)
		this._MainNode.hide();
};

kodor.mcc.prototype.show = function() {
	if (this._MainNode)
		this._MainNode.show();
};

kodor.mcc.prototype._onLockButtonClick = function(sender, args) {
	if (this._Application.getAuth().getUsername().toLowerCase() === 'guest')
		this.changeState(kodor.mcc.state.GUEST);
	else
		this.changeState(kodor.mcc.state.USER);
};

kodor.mcc.prototype._onUsernameButtonClick = function(sender, args) {
	console.log(sender, args);
};

kodor.mcc.prototype._onLoginButtonClick = function(sender, args) {
	var username = this._UsernameInput.getValue(), 
		password = this._PasswordInput.getValue();

	if (username && password) {
		this._LoginButton.setEnabled(false);

		//this._UsernameInput.setValue('');
		this._PasswordInput.setValue('');

		this._Application.getAuth().setUsername(username);
		this._Application.getAuth().login(password);
	}
};

kodor.mcc.prototype._onLogoutButtonClick = function(sender, args) {
	this._Application.getAuth().logout();
	if (this._Application.getPageEditor()) {
		this._Application.getPageEditor().disable();
	}
};

kodor.mcc.prototype._onEditPageButtonClick = function(sender, args) {
	this._Application.getPageEditor().enable();
	this.changeState(kodor.mcc.state.PAGEEDIT);
};

kodor.mcc.prototype._onSavePageButtonClick = function(sender, args) {
	var editor = this._Application.getPageEditor();
	if (editor)
		editor.savePage();
	else {
		console.log('No page editor!');
	}
};

kodor.mcc.prototype._onClearCacheButtonClick = function(sender, args) {
	if (this._Application.getStorage())
		this._Application.getStorage().clear();
};

kodor.mcc.prototype._onUserLoggedIn = function(sender, args) {
	this.changeState(kodor.mcc.state.USER);
};

kodor.mcc.prototype._onUserLoggedOut = function(sender, args) {
	this.changeState(kodor.mcc.state.GUEST);
	if (this._Application.getPageEditor()) {
		this._Application.getPageEditor().disable();
	}
};

kodor.mcc.prototype._onLoginFailed = function(sender, args) {
	this._LoginButton.setEnabled(true);
};

kodor.mcc.prototype._onPageSaved = function(sender, args) {
	this._Application.getPageEditor().disable();
	this.changeState(kodor.mcc.state.USER);
};