Function.prototype.inheritsFrom = function (base) {
	var Inheritance = function () {}; //функция-конструктор для пустого класса
	Inheritance.prototype = base.prototype; //записываем ссылку на прототип суперкласса в прототип пустого класса
	
	this.prototype = new Inheritance(); //Создаем новый объект пустого класса в прототипе подкласса (this указывает на объект подкласса)
	this.prototype.constructor = this; //Возвращаем ссылку на конструктор подкласса, а не надкласса
	this.base = base; //Записываем в свойства класса ссылку на объект надкласса
};

var kodor = kodor || {};

kodor.helper = {};

kodor.helper.getCloseTagIndex = function (str) {
	var level = 0;
    for(var i = 0; i < str.length; i++) {
        if (str[i] == '<' && str[i + 1] == '/') {
            if (level == 0)
                return i;
            else
                level--;
        }
        else if (str[i] == '<' && str[i + 1] != '/')
            level++; 
    }
};

kodor.helper.getTagLength = function (str, index) { //Индекс символа "<" у тега
	var l = 0;
	for (var i = index; i < str.length; i++) {
		l++;
		if (str[i] == '>')
			return l;
	}
	return -1;
};

kodor.helper.parseNodes = function (str) {
	if (typeof str != 'string' || str === '')
		return null;

	if (str[0] != '<')
		throw new Error('Parse error');

	var s = str; //записываем в s ссылку на str
	var nodes = [];
	
	while (s) {
		var rAbIndex = s.indexOf('>') + 1; //Ищем конец тега (Символ ">")
		var oTag = s.substr(0, rAbIndex); //Достаем открывающий тег
		s = s.substr(rAbIndex, s.length - rAbIndex); //Вырезаем из строки открывающий тег

		var closeTagIndex = kodor.helper.getCloseTagIndex(s); //Ищем индекс закрывающего тега
		var closeTagLength = kodor.helper.getTagLength(s, closeTagIndex); //Длина закрывающего тега
		var cTag = s.substr(closeTagIndex, closeTagLength); //Достаем зыкрывающий тег
		var childs = s.substr(0, closeTagIndex); //Достаем дочернюю субстроку
		var id = null;
		if (childs[0] == '{' && childs[childs.length - 1] == '}') { //Проверка на '{0}'
			id = parseInt(childs.substr(1, childs.length - 2), 10); //Достаем id
			childs = ''; //Обнуляем дочернюю субстроку, чтобы рекурсия не упала
		}
		s = s.substr(closeTagIndex + closeTagLength, s.length - (closeTagIndex + closeTagLength)); //Обрезаем строку после закрывающего тега
		var node = {
			'node': $(oTag + cTag),
			'id': id,
			'childs': kodor.helper.parseNodes(childs)
		}
		nodes.push(node);
	}

	return nodes;
};

kodor.helper.markupString = function (string, chr, oTag, cTag) {
	if (chr && chr.length) { // && chr.length == 1) {
		if (chr.length == 1 && /[\(\)\[\]\\\.\^\$\|\?\+\*]/.test(chr))
			chr = '\\' + chr;

		var reg = new RegExp('(.*)' + chr + '\\b(.+)\\b' + chr + '(.*)', 'g');
		if (!reg.test(string))
			return string;
		var arr = reg.exec(string);
		return kodor.helper.markupString(arr[1], chr, oTag, cTag) + oTag + arr[2] + cTag + arr[3];

	}
	else
		return '';
};

kodor.helper.setCookie = function (name, value, expires) {
	document.cookie = name + '=' + escape(value) + 
	(expires ? '; expires=' + new Date(expires).toGMTString() : '') +
	'; path=/';
};

kodor.helper.removeCookie = function (name) {
	document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT' 
};

kodor.helper.bind = function(callback, sender) {
	return function () {
		callback.trigger((sender ? sender : this), arguments);
		return false;
	}
};