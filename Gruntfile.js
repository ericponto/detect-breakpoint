module.exports = function(grunt) {
	grunt.initConfig({
		propToContent: {
			example: {
				src: "example/styles.css",
				dest: "example/built-styles.css"
			}
		}
	});
	
	grunt.loadTasks("task");
	
	grunt.registerTask("default", ["propToContent"]);
}