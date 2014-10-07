module.exports = function(grunt) {
	var postcss = require("postcss");
	
	var convertCssProps = postcss(function(css) {
		css.eachDecl(function(decl) {
			if (decl.prop.indexOf("--") === 0) {
				var parent = decl.parent;
				var selector = "[data-selector=\""+ parent.selector + "__detectBreakpoint__\"]:before";
				parent.parent.insertAfter(
					parent, postcss.rule({ selector: selector })
						.append({ prop: "content", value: "\"" + decl.value + "\"" })
						.append({ prop: "display", value: "none" })
				);
			}
		});
	});
	
	grunt.registerMultiTask("propToContent", "Convert a CSS custom property to a pseudo element's content", function() {
		var options = this.options();

		var css = grunt.file.read(this.files[0].src);

		grunt.file.write(this.files[0].orig.dest, convertCssProps.process(css).css);
	});
};