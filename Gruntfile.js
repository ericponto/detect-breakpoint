module.exports = function(grunt) {
	grunt.initConfig({
		uglify: {
			dist: {
				files: {
					"dist/detectBreakpoint.min.js": "src/detectBreakpoint.js"
				}
			}
		},
		copy: {
			dist: {
				src: "src/detectBreakpoint.js",
				dest: "dist/detectBreakpoint.js"
			}
		}
	});
	
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-copy");
	
	grunt.registerTask("default", ["copy", "uglify"]);
}