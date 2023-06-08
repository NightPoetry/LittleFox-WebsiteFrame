function isHTML(tag) {
	let html5Tags = ['<input>', '<div>', '<html>', '<head>', '<title>', '<meta>', '<link>', '<style>', '<script>', '<noscript>', '<body>', '<header>', '<nav>', '<article>', '<section>', '<aside>', '<footer>', '<h1>', '<h2>', '<h3>', '<h4>', '<h5>', '<h6>', '<p>', '<a>', '<img>', '<video>', '<audio>', '<ul>', '<ol>', '<li>', '<dl>', '<dt>', '<dd>', '<table>', '<tr>', '<td>', '<th>', '<caption>', '<form>', '<input>', '<textarea>', '<button>', '<select>', '<option>', '<optgroup>', '<fieldset>', '<label>', '<output>', '<progress>', '<meter>', '<iframe>', '<canvas>', '<details>', '<summary>', '<menu>', '<svg>', '<math>', '<html>'];
	if (tag.nodeType === Node.TEXT_NODE) return true;
	return html5Tags.indexOf(`<${tag.tagName.toLowerCase()}>`) !== -1;
}

function isTextElement(element) {
	const tagName = element.nodeName.toLowerCase();
	return tagName === 'p' || tagName.startsWith('h') || tagName === 'textarea' || tagName === 'pre' || tagName === 'code';
}

function APP(vdom) {
	this.vdom = vdom;
	this.name = "html_label";
	this.children = []; //存着一堆APP等待运行，update将会使用这些APP进行解析
	this.fahter = []; //父APP
	this.static_dom; //存储不需要变换的dom，即不需要重复生成的dom，（需要重复生成的dom用户可以建立相应的机制来实现复用）
	this.update = (props) => { //更新,vdom是利用原生dom机制而创建的vdom，不是实际发挥作用的dom
		let doms = [];
		let dom = this.static_dom ?? document.createElement(vdom.tagName); // 创建相同类型的新dom
		if (vdom.nodeType === Node.TEXT_NODE) {
			dom = this.static_dom ?? document.createTextNode("");
			dom.textContent = props?.text;
			if (!dom.textContent.trim()) dom.textContent = vdom.textContent;
		} else if (dom.nodeType === Node.ELEMENT_NODE && (dom.tagName === 'INPUT' || dom.tagName === 'TEXTAREA')) {
			dom.value = props.value;
		} else {
			//将props的属性赋值到dom上
			for (let key in props) {
				if (key === 'className') {
					dom.setAttribute('class', props[key]);
				} else if (key === 'style') {
					const style_obj = props[key];
					Object.keys(style_obj).forEach(attr => {
						dom.style[attr] = style_obj[attr];
					});
				} else {
					dom.setAttribute(key, props[key]);
				}
			}
		}
		for (let child of this.children) {
			let attributes = child.vdom.attributes;
			let child_props = {};
			// 遍历元素的所有属性
			for (let i = 0; i < attributes?.length ?? 0; i++) {
				let attrName = attributes[i].nodeName;
				let attrValue = attributes[i].nodeValue;
				// 将属性名和属性值以key，value的形式存储到属性对象中
				child_props[attrName] = attrValue;
			}
			let child_dom = child.update(child_props);
			if (child_dom) {
				doms.push(child_dom);
			}
		}
		// 将doms里面的全部的dom插入到dom中
		for (let i = 0; i < doms.length; i++) {
			dom.appendChild(doms[i]);
		}
		this.static_dom = dom; //普通标签都是静止标签
		return dom; //每个update都会返回被管辖的doms，作为默认的标签行为将会返回同类型标签的实例一个。
	}
	this.style = (props) => {
		// 赋值针对性样式
		function applyStyles(styles, element) {
			for (let prop in styles) {
				element.style[prop] = styles[prop];
			}
		}
		applyStyles(props, this.static_dom);
		// 递归调用 children 中的 style 方法
		if (this.children) {
			this.children.forEach(child => {
				child.style();
			});
		}
	};
	this.collect = () => { //收集
		let data = [];
		if (this.static_dom.tagName.toLowerCase() === "input" || this.static_dom.tagName.toLowerCase() === "textarea") {
			return {
				name: this.static_dom.getAttribute("name"),
				value: this.static_dom.value
			};
		} else {
			let children = this.children;
			for (let i = 0; i < children.length; i++) {
				let child_data = children[i].collect();
				if (child_data !== null) {
					if (child_data.name == null) child_data.name = `${this.name}_${i}`;
					data.push(child_data);
				}
			}
		}
		if (data.length === 0) {
			return null;
		} else if (data.length === 1) {
			return data[0];
		} else {
			return data;
		}
	}
	//下面全是工具方法
	this.initStyle = (props) => {
		// 赋值默认的 class
		if (!isHTML(this.vdom)) {
			this.static_dom.classList.add(this.name);
		}
		// 递归调用 children 中的 style 方法
		if (this.children) {
			this.children.forEach(child => {
				child.initStyle();
			});
		}
	}
	this.getStyleMap = () => {
		return window.getComputedStyle(this.static_dom);
	}
	this.getNodeByFoxID = (fox_id) => {
		if (this.vdom && this.vdom.getAttribute("fox_id") === fox_id) {
			return this; // 如果当前对象的vdom属性的fox_id和传入的fox_id相同，则返回当前对象
		} else if (this.children && this.children.length > 0) {
			for (let i = 0; i < this.children.length; i++) {
				const childNode = this.children[i].getNodeByFoxID(fox_id); // 递归调用子节点的getNodeByFoxID方法
				if (childNode) {
					return childNode; // 如果当前子节点匹配成功，则返回该子节点
				}
			}
		}
		return null; // 如果遍历完所有子节点都没有匹配成功，则返回null
	}
	this.getNodeByFoxClass = (fox_class) => {
		const result = [];
		if (this.vdom && this.vdom.getAttribute("fox_class") === fox_class) {
			result.push(this);
		}
		for (const child of this.children) {
			result.push(...child.getNodeByFoxClass(fox_class));
		}
		return result;
	}
	this.getChidrenPropsMap = () => {
		const propsMap = new Map(); // 创建一个新的Map用于存储key value对象
		// 遍历this.children数组获得每一个app
		this.children.forEach(app => {
			const {
				vdom
			} = app; // 获取app的vdom属性
			if (vdom) {
				const {
					attributes
				} = vdom; // 获取此DOM元素的全部标签属性
				const propsObj = {}; // 用于存储key value对象的对象

				// 遍历标签属性并将其以key value的形式保存为对象
				for (const attribute of attributes) {
					propsObj[attribute.name] = attribute.value;
				}

				propsMap.set(app, propsObj); // 将遍历中生成的全部key value对象以app为key，key value对象为value保存到Map中
			}
		});
		return propsMap; // 返回新建立的Map
	}
	this.setProp = (key, value) => {
		// Get the vdom element
		let vdom = this.vdom;

		// Check if the vdom element exists
		if (!vdom) {
			console.error('vdom element does not exist!');
			return;
		}
		vdom.setAttribute(key, value);
	};
}

function MakeApp(vdom, app_message) { //app_message可能是function也可能是obj
	let app = new APP(vdom);
	if (typeof app_message === 'function') {
		if (!app_message.name) {
			throw new Error('Error: Function name missing!');
		}
		app.update = app_message;
		app.name = app_message.name;
	} else if (typeof app_message === 'object' && app_message !== null) {
		Object.assign(app, app_message);
	} else {
		//返回一个默认的常规HTML标签处理函数
	}
	return app;
}

function Loader() {
	this.app_messages = [];
	const load = (dom) => {
		if (dom.nodeType === Node.TEXT_NODE) {
			return MakeApp(dom);
		} else if (isHTML(dom)) {
			// 如果dom是常规html标签，调用MakeApp方法得到返回值并赋值给app变量
			let app = MakeApp(dom);
			if (isTextElement(dom)) { //如果是文本标签
				// 遍历dom的直接子节点（非孙子节点），将遍历的内容作为参数输入到load方法中得到一个返回值，然后将这个返回值添加到一个数组中
				let children = Array.from(dom.childNodes).map(child => load(child));
				// 在结束遍历后将在遍历中得到的数组作为添加到app对象的children属性数组中
				app.children.push(...children);
			} else {
				// 遍历dom的直接子节点（非孙子节点），将遍历的内容作为参数输入到load方法中得到一个返回值，然后将这个返回值添加到一个数组中
				let children = Array.from(dom.children).map(child => load(child));
				// 在结束遍历后将在遍历中得到的数组作为添加到app对象的children属性数组中
				app.children.push(...children);
			}
			//给children添加father
			for (const child of app.children) child.father = app;
			// 返回app对象
			return app;
		} else {
			// 如果dom不是常规html标签，查找对应的app_message对象
			let app_message = this.app_messages.find(app => (app.name).toLowerCase() === dom.localName);
			// 如果找到了对应的app_message对象，调用MakeApp方法并将app_message对象作为参数传入，得到返回值并赋值给app变量
			if (app_message) {
				let appResult = MakeApp(dom, app_message);
				// 遍历dom的直接子节点（非孙子节点），将遍历的内容作为参数输入到load方法中得到一个返回值，然后将这个返回值添加到一个数组中
				let children = Array.from(dom.children).map(child => load(child));
				// 在结束遍历后将在遍历中得到的数组作为添加到app对象的children属性数组中
				appResult.children.push(...children);
				//给children添加father
				for (const child of appResult.children) child.father = appResult;
				// 返回app对象
				return appResult;
			} else {
				// 如果没有找到对应的app_message对象则报错
				throw new Error(`${dom.tagName} not found about app`);
			}
		}
	}
	this.load = (dom, app_messages) => { //启动APP进行网页解析（update）
		this.app_messages.push(...app_messages); //将装载的操作对象保存，有助于后续操作。
		let app = load(dom);
		let root = app.update({});
		app.initStyle();
		// 复制现有dom的属性
		for (let attr of dom.attributes) {
			root.setAttribute(attr.name, attr.value);
		}
		// 取代原先的dom的位置
		dom.parentNode.replaceChild(root, dom);
		// 等待 DOM 树解析完成之后执行
		document.addEventListener('DOMContentLoaded', function() {
			console.log('The document is parsed and ready to be manipulated.');
			app.style();
		});
		return app;
	}
	this.reload = (root_app, chilren_messages) => {
		function createDOM(msg) {
			const {
				name,
				props,
				children
			} = msg;
			const el = document.createElement(name);
			//将props参数作为产生的DOM的标签属性。
			for (const prop in props) {
				if (props.hasOwnProperty(prop)) { //抛弃继承属性
					el.setAttribute(prop, props[prop]);
				}
			}
			if (children) {
				children.forEach(child => {
					const childEl = createDOM(child);
					el.appendChild(childEl);
				});
			}
			return el;
		}

		function traverse(msg) {
			const {
				name,
				children
			} = msg;
			if (!name) {
				return;
			}
			const el = createDOM(msg);
			if (children) {
				let doms = [];
				for (const child of children) {
					el.appendChild(traverse(child));
				}
			}
			return el;
		}
		while (root_app.vdom.firstChild) {
			root_app.vdom.removeChild(root_app.vdom.firstChild);
		}
		for (const child_message of chilren_messages) {
			root_app.vdom.appendChild(traverse(child_message));
		}
		const app = load(root_app.vdom);
		const befor_dom = root_app.static_dom;
		const root = app.update({});
		// 复制现有dom的属性
		for (let attr of befor_dom.attributes) {
			root.setAttribute(attr.name, attr.value);
		}
		// 取代原先的dom的位置
		befor_dom.parentNode.replaceChild(root, befor_dom);
		return app;
	}
}