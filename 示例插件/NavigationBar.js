let Navigation = {
	name: "Navigation",
	update(props) {
		const childrenProps = this.getChidrenPropsMap();
		const container = document.createElement('div');
		for(let child of this.children){
			let c_props = childrenProps.get(child);
			let dom = child.update(c_props);
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
			container.append(dom);
		}
	}
}
let NavigationItem = {
	name: "NavigationItem",
	update(props) {
		const childrenProps = this.getChidrenPropsMap();
		const container = document.createElement('div');
	}
}