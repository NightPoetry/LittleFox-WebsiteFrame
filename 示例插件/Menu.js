/*
编写一个update方法，参数为props，props内是一个对象。该方法存在于一个APP对象内，有this.children属性，是App对象的列表。
App对象都含有一个update方法，参数为props与要编写的update方法中的props是相同的含义，但是不是同一个对象。
可以通过调用当前App对象的getProps方法获得一个Map，key为this.children中的App对象，value是这个对象对应的props对象。
通过调用this.children中的App的update方法可以得到一个HTML DOM组成的数组。
下面将会描述正式功能：
this.children中包含的App对象有一个name属性，如果这个属性的值不是“MenuTitle”则将打印警告，提示此App为无效标签。
否则将所有的调用此App对象的update方法得到的dom添加到一个新建的div中，并将props中的style属性赋值到新建div的style中。
调用update方法是将参数props添加一个属性，即head_sapce，
head_space是通过当前app的head_space以及当前调用update对象所需的props中的head_space想加得到的。
如果没有则默认为1.5。
完成这一切之后将新建的dom返回。
*/
const MenuLeft = {
	name: "MenuLeft",
	update(props) {
		const div = document.createElement("div");
		const props_map = this.getChidrenPropsMap() ?? new Map();
		const child_doms = [];
		for (const child of this.children) {
			if (child.name !== "MenuTitle") {
				console.warn("Invalid tag: " + child.name + ", cannot render");
			} else {
				let child_props = props_map.get(child);
				child_props.head_space = props.head_space ?? 0 + child_props.head_space ?? 1.5;
				child_doms.push(child.update());
			}
		}

		div.setAttribute("style", JSON.stringify(props.style || {}));
		//因为没有设计动态属性，所以将全部的属性复制到标签中，属于静态属性。
		Object.keys(props).forEach(key => {
			div.setAttribute(key, props[key]);
		});
		child_doms.forEach((child_dom) => {
			div.appendChild(child_dom);
		});
		return div;
	}
}
/*
编写一个方法（具体方法的编写在后面描述）该方法存在于一个APP对象内，有this.children属性，是App对象的列表。
App对象都含有一个update方法，参数为props与要编写的update方法中的props是相同的含义，但是不是同一个对象。
可以通过调用当前App对象的getProps方法获得一个Map，key为this.children中的App对象，value是这个对象对应的props对象。
通过调用this.children中的App的update方法可以得到一个HTML DOM组成的数组。
下面将会描述正式功能：
编写一个update方法，参数为props，props内是一个对象。
this.children中包含的App对象有一个name属性
调用this.children中的App对象（命名为child）的update方法得到的dom添加到一个新建的div中，并将props中的style属性赋值到新建div的style中。
将props中的全部属性放到新建的div中。
调用update方法时，
如果child对象的name属性不为“MenuTitle”或者“MenuItme”，则将获得的对象在展开和关闭时不参与计算。
如果child对象的name属性为“MenuTitle”则将调用获得的div设置为可展开状态，通过点击此div可以将其展开显示内部子内容。
如果child对象的name属性为“MenuItme”则讲调用获得的div设置为点击后调用props中的click方法（如果是个字符串就用eval执行），如果是个方法则参数为child对象和当前的div对象
完成这一切之后将新建的dom返回。
*/
const MenuTitle = {
	name: "MenuTitle",
	open: true,
	update(props) {
		const childrenProps = this.getChidrenPropsMap();
		const container = document.createElement('div');
		let control_doms = []; //被控制节点
		let others = [];
		for (const child of this.children) {
			const props = childrenProps.get(child);
			const childHTML = child.update(props);
			if (child.name !== 'MenuTitle' && child.name !== 'MenuItem') {
				others.push({
					app: child,
					dom: childHTML
				});
			} else {
				control_doms.push({
					app: child,
					dom: childHTML
				});
			}
			container.append(childHTML);
		}
		container.style = props?.style ?? {};
		for (const [key, value] of Object.entries(props ?? {})) {
			if (key !== 'style') {
				container.setAttribute(key, value);
			}
		}
		//设置折叠功能(只折叠内部元素，标识元素不被折叠)
		let removed_elements = []; // 定义一个数组来存储被移除的元素
		//遍历数组others每个元素都执行addEventListener方法。
		others.forEach(({
			app,
			dom
		}) => {
			dom.addEventListener('click', () => {
				const addFromList = (node_list) => {
					for (const root of node_list) {
						// 重新加入被移除的元素
						removed_elements.forEach((element) => {
							container.appendChild(element);
						});
						this.open = true;
					}
				}
				const removeFromList = (node_list) => {
					for (const root of node_list) {
						let remove_dom = root.dom;
						removed_elements.push(remove_dom);
						container.removeChild(remove_dom);
						this.open = false;
					}

				}
				if (this.open == false) {
					addFromList(control_doms);
				} else {
					removeFromList(control_doms);
				}
			});
		});
		return container;
	}
}
/*
编写一个方法（具体方法的编写在后面描述）该方法存在于一个APP对象内，有this.children属性，是App对象的列表。
App对象都含有一个update方法，参数为props与要编写的update方法中的props是相同的含义，但是不是同一个对象。
可以通过调用当前App对象的getProps方法获得一个Map，key为this.children中的App对象，value是这个对象对应的props对象。
通过调用this.children中的App的update方法可以得到一个HTML DOM组成的数组。
通过this.getProps方法的调用可以获得此App节点下所有的子App节点所对应的props并与App节点组成Map
提示，并不需要写出除这个方法之外的部分，那些部分已经存在。
附加条件：
当前App对象（即this）将会在开头新建一个div，并且将这个div在方法的最后返回，且这个div存储到名为container的变量中。
当你试图填入this.children中子元素App的update参数时并调用时请提前使用this.getProps获得映射，并从map中找到与的那个钱子元素匹配的props。
下面将会描述正式功能：
调用this.children中的App对象（命名为child）的update方法得到的dom添加到container中。
给container添加一个点击事件，此点击后可以触发相应的点击事件，这个点击事件来自props中的click。
如果click是方法则直接执行，如果是string则eval执行。如果都不是则报错"MuneItem的点击事件非法"，
如果是空或者未定义则警告“MenuItem的点击事件不存在”
*/
const MenuItem = {
	name: "MenuItem",
	update(props) {
		const container = document.createElement('div');
		const children_props = this.getChidrenPropsMap();
		for (const child of this.children) {
			const props = children_props.get(child);
			const child_dom = child.update(props);
			container.appendChild(child_dom);
		}
		const click = props.click;
		if (click) {
			container.addEventListener('click', () => {
				if (typeof click === 'function') {
					click();
				} else if (typeof click === 'string') {
					eval(click);
				} else {
					throw new Error('MenuItem的点击事件非法');
				}
			});
		} else if (click === undefined) {
			console.warn('MenuItem的点击事件不存在');
		}
		return container;
	}
}
export default [MenuLeft, MenuTitle, MenuItem]
// {
// 	MenuLeft: MenuLeft,
// 	MenuTitle: MenuTitle,
// 	MenuItem: MenuItem,
// 	Menu: [MenuLeft, MenuTitle, MenuItem]
// }
// NightPoetry 下午 7:22:31
// 没记，如果标记的节点不删除

// NightPoetry 下午 7:22:36
// 也就是标题用的节点

/*
使用注意事项使用了这个脚本之后文本要用专用的标签存储不要随便放到一个div中了。
*/
/*
编写代码前的通用规定：
1、命名规范：所有的方法使用大小驼峰命名法，但是用于生成对象的（即使用new）方法使用首字母大写的大小驼峰命名法。其他命名使用下划线命名法，即多个单词之间用下划线连接（第一个单词之前不需要添加下划线）
2、如果不是直接要求遍历一个map则不要去直接遍历map而是遍历所要求的列表并且通过map来获取遍历过程中对应的信息，以保证信息的顺序性。
编码环境：
编码要求：
*/