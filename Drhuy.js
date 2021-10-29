let Drhuy = (function(){

	let Helper = (function(){
		function arrToObject(array, szValue = true){
			let result = {};
			array.forEach(item=> {
				result[item] = szValue;
			});
			return result;
		}

		function strToAttrs(str){
			let result = {};
			let attrs = str.split(' ');
			for (var i = 0; i < attrs.length; i++) {
				let attr = attrs[i].split('=');
				if(!attr[0] || !attr[1])
					continue;
				result[attr[0]] = attr[1];
			}
			return result;
		}

		return {arrToObject, strToAttrs};
	})();

	function EventHandle(hooks = []){

		const HOOK_EMPTY = 'empty';

		let _actions 	= {};

		let events;

		function initHook(hook){
			Object.defineProperties(events, {
		        [hook]: {
		            "set": function(fn){
		            	if(typeof fn != 'function' || typeof hook != 'string')
							return;
						if(!_actions[hook])
							_actions[hook] = {};
						let fnName = fn.name? fn.name: HOOK_EMPTY;
						if(!_actions[hook][fnName])
							_actions[hook][fnName] = [];
						_actions[hook][fnName].push(fn);
		            }
		        }
		    });
		}

		function on(hook, callback){
			if(!events[hook])
				initHook(hook);
			events[hook] = callback;
		}

		function fire(hook, params = {}){
			if(!_actions[hook])
				return;
			for(let fnName in _actions[hook]){
				if(typeof _actions[hook][fnName] == 'object')
					for(let i in _actions[hook][fnName])
						if(typeof _actions[hook][fnName][i] == 'function')
							_actions[hook][fnName][i](params);
			}
		}

		function remove(hook, fn = null, type = 1){
			if(!_actions[hook])
				return;
			if(!fn)
				return delete _actions[hook];
			let fnName = fn.name? fn.name: HOOK_EMPTY;
			if(type == 1)
				delete _actions[hook][fnName];
			else{
				for(let i in _actions[hook][fnName]){
					if(_actions[hook][fnName][i] == fn)
						delete _actions[hook][fnName][i];
				}
			}
		}

		(function init(){
			events 	=  {
				fire, on, remove
			};
			_actions 	= {};
			for(let i in hooks)
				initHook(hooks[i]);
		}())

		return events;

	}
	
	function createElement(params = {}){
		let tbDefaultSkips = Helper.arrToObject(['_type', 'items', 'childs', 'text', 'tbAttrSkip']);
		let tbAttrSkip = {...params.tbAttrSkip, ...tbDefaultSkips}

		params.innerHTML = params.innerHTML? params.innerHTML: params.text;

		function setAttr(el, attrs){
			for(let szKey in attrs){
				if(tbAttrSkip[szKey] || !attrs[szKey])
					continue;
				if (el[szKey] != undefined)
					if(typeof attrs[szKey] == 'object'){
						let _attrs = setAttr(el[szKey], attrs[szKey]);
						el[szKey] = _attrs;
					}
					else
						el[szKey] = attrs[szKey];
				else
					try{
						if(typeof attrs[szKey] == 'function')
							el[szKey] = attrs[szKey];
						else
							el.setAttribute(szKey, attrs[szKey]);
					}catch(e){}	
			}
			return el;
		}

		let el = document.createElement(params._type? params._type: 'div');

		el = setAttr(el, params)

		if(params.childs){
			for(i in params.childs){
				let oChild = params.childs[i];
				eChild = oChild.appendChild? oChild: createElement(oChild);
				el.appendChild(eChild);
			}
		}
		return el;
	};

	function fastCreateElement(params = []){

		if(typeof params != 'object')
			params = [params];

		let _type = 'div';
		let attrs = null;
		let childs = null;
		let text = '';

		for(i in params){
			if(typeof params[i] == 'object'){
				childs = params[i];
				continue;
			}
			if(params[i][0] == '.'){
				text = params[i].substring(1, params[i].length);
				continue;
			}
			if(params[i].includes('='))
				attrs = Helper.strToAttrs(params[i]);
			else _type = params[i];
		}

		let el = createElement({...attrs, _type, text});

		if(childs)
			for(i in childs){
				let oChild = childs[i];
				eChild = oChild.appendChild? oChild: fastCreateElement(oChild)
				el.appendChild(eChild);
			}

		return el;
	}

	return {createElement, fastCreateElement, EventHandle};

})();