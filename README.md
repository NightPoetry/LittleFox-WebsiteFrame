# LittleFox-WebsiteFrame
A short flexible web framework that can be integrated into any other framework.

## Introduction

This is a small and lovely framework that is designed for front-end development. In traditional front-end development, data only moves in two directions: from data to HTML or styles, and from changes in HTML or styles back to data, which is then sent to the back-end for processing. This framework allows you to create various types of "data containers", which can be thought of as custom HTML tags that give HTML tags more semantic meaning, allowing data that has been processed based on these semantics to be converted back into raw HTML structures for browser parsing.

## Usage

1. Download the only javascript file in the project and include it in your HTML tag or other desired way in your project.
2. Use the `let loader = new Loader();` method to obtain a loader, then start the framework by calling `loader.load("root dom you want to use framework on", "plugin list");`
   This method will process the DOM as a framework-specific DOM and return it.
3. Use your own HTML tags under the DOM that uses the framework.

## Example

```
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title></title>
	</head>
	<body>
		<div>
			<test></test>
		</div>
		<script src="../app.js"></script>
		<script>
			let loader = new Loader();
			let app = loader.load(document.getElementById("ok"), [{
				name: "test",
				update(props) {
					let input = document.createElement("input");
					this.static_dom = input;
					props.id ? input.id = props.id : undefined;
					return input;
				},
				style(props) {
					let s_map = this.getStyleMap();
					let background = s_map.getPropertyValue("background-color");
					let ok = s_map.getPropertyValue("--test");
					console.log(background, ok);
				}
			}]);
		</script>
	</body>
</html>
```

In this example, we have written a custom plugin that creates a custom tag named "test", which is equivalent to an input tag and has no special meaning. This is just an example to demonstrate the implementation of plugin loading and usage.

## Writing Plugins

1. Plugin creation only requires writing an object and exporting it. You can even use the factory pattern to create multiple plugins with similar features but subtle differences, as long as the plugin you use meets the requirements.
2. `name`: This attribute is used to define the name of the custom tag. Unlike the HTML standard, the name is case sensitive. However, try not to use tag names that are the same but different in case, as this can cause problems.
3. `update`: This is a required method that takes a `props` object and returns a DOM element, which is the outermost "container" of the custom tag's generated structure. You can use a variety of tool methods to obtain various information passed to the custom tag, then create a series of regular tags based on this information and return the root DOM of those tags. Note that the `props` object is just the attributes on the tag, similar to attributes on native tags.
4. `style`: This method is used to process style. You can use `this.static_dom` to get the root node of the current custom tag.
5. `collect`: This method is used to collect information, and you need to return the corresponding information as you need it. Here, you can call the `collect` method of child nodes recursively to obtain the information of the child nodes. By default, the text node returns an object, where the `name` attribute is the name of the text node, and the `value` attribute is the content of the text node. The text node is the input and textarea tags, etc.
6. `this.children`: This object contains the direct child tags of the current tag, which all have the above three methods and are recommended to be recursively called to ensure the integrity of the information chain.
7. `this.fahter`: The App object of the parent tag.

## Tool Methods

1. All tool methods need to be used as object methods after obtaining the `App` object.
2. `initStyle(props)`: This method is used to initialize the `style` method. Please call it when you define the `style` method. It will assign a class with the same name as the custom tag to the custom tag, making it easier for other frameworks to interfere with the style of the custom tag.
3. `getStyleMap(props)`: This method is used to obtain custom style passed in as props. Note that custom styles must begin with "--".
4. `getNodeByFoxID(id)`: This method is used to obtain the `App` object with the corresponding ID.
5. `getNodeByFoxClass(className)`: This method is used to obtain the `App` object with the corresponding class name.
6. `getChildrenPropsMap()`: This method is used to obtain a `Map` object that maps the `App` objects of child nodes to their corresponding `props`.
7. `setProp(prop, value)`: This method is used to set style properties for the `DOM` element associated with the `App` object.
## 简介：
这是一个小而可爱的框架，对于前端而言如果仅仅是前段，那么数据只有两个方向，一个是将处理好的数据转化为html结构或者相配套的样式，二是将变化的html数据或者样式转化回数据并送往后端处理。因此这个框架可以创建各种各样的”数据容器“，可以简单的理解为自定义各种类型的html标签，让html标签更具有语义化，同时按照这些语义对处理好的数据转化为原始的html结构，以供浏览器解析。
## 使用方法：
1. 将项目中唯一的js文件下载下来并在你的html标签或者任何你想要的方式引入你的项目。
2. let loader = new Loader();方法获得一个加载器。然后let app = loader.load(“你想要使用框架的根dom”,"插件列表");的方式启动框架。即将根dom和需要的插件填入load方法，此方法将会将dom加工为框架的专用dom并返回。
3. 在使用了框架的dom下面使用你自己的html标签。
## 样例演示：
```
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title></title>
	</head>
	<body>
		<div>
			<test></test>
		</div>
		<script src="../app.js"></script>
		<script>
			let loader = new Loader();
			let app = loader.load(document.getElementById("ok"), [{
				name: "test",
				update(props) {
					let input = document.createElement("input");
					this.static_dom = input;
					props.id ? input.id = props.id : undefined;
					return input;
				},
				style(props) {
					let s_map = this.getStyleMap();
					let background = s_map.getPropertyValue("background-color");
					let ok = s_map.getPropertyValue("--test");
					console.log(background, ok);
				}
			}]);
		</script>
	</body>
</html>
```
在这个样例中，我们编写了一个自定义插件，自定义了一个名为”test“的自定义标签，这个标签的作用是”等价于input标签“，即没有任何作用，就是演示插件的加载与使用。
## 插件编写：
1. 插件的编写只需要写一个对象并导出即可，甚至你可以用工厂模式使用参数创建许多功能类似但是有细微差异的插件，只要使用插件的时候是一个满足要求的对象即可。
2. `name`，这个属性是用来定义自定义标签的名字的，不像HTML原生标准，这个名字是分大小写的。但是尽量不用用同名但是大小写不同的标签名，容易出现问题。
3. `update`，这是必备方法，此方法接收一个`props`对象并返回一个`dom`元素，即自定义标签的产生的结构的最外层的”容器“。你可以使用各种工具方法来获得自定义标签传入的各种信息，然后根据这些信息创建一个一系列的普通标签，并将这些标签的根节点`dom`返回。注意这个`props`对象就是在标签上的属性，类似原生标签在标签上面的属性。
4. `style`方法：用来处理样式，你可以通过`this.static_dom`来获取当前自定义标签的根节点。
5. `collect`方法：用来收集信息，你需要以你需要的形式返回相应的信息。在此你可以递归的调用子节点的`collect`方法来获取子节点的信息。文本节点默认情况下返回一个对象，对象中`name`属性就是文本节点的`name`属性，`value`属性就是文本节点的内容。文本节点即`input`、`textarea`等。
6. `this.children`属性，内有自己的直接的子标签的对象，这些子标签都具有上述三种方法可以递归调用，且建议一定要递归调用以保证信息链的完整。
7. `this.fahter` 父标签的App对象。
## 工具方法：
1. 所有的工具方法都需要获得app对象之后使用作为对象方法进行使用。
2. `initStyle(props)`，用来初始化style方法，请自定义style方法的时候调用，它将会给自定义标签赋予同名的class，以方便其他框架对自定义标签的样式干涉。
3. `getStyleMap`获取css对自定义标签穿进来的自定义样式，注意自定义样式必须是--开头
4. `getNodeByFoxID`用来通过id获取对应的app对象
5. `getNodeByFoxClass`通过class获取对应的app对象
6. `getChidrenPropsMap`获取一个Map，可以通过child的app对象找到其需要填入的props
7. `setProp`给app对象所指的dom设置样式。
