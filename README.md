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
