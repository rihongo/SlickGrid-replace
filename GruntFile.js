module.exports = function (grunt) {
	grunt.initConfig({
		concat: {
			option : {
				stripBanners : true
			},
			js: {
				src: ['js/lib/*.js', 'js/*.js','js/plugins/*.js', 'js/lib/excel/shim.js', 'js/lib/excel/require.js', 'js/lib/excel/underscore.js',
					'js/lib/excel/jquery.slickgrid.export.excel.js', 'js/lib/excel/excel-builder.js','node_modules/xlsx/dist/xlsx.js','node_modules/xlsx/dist/jszip.js',
					'js/controls/config.grid.js','js/lib/excel/excel-parse.js','js/controls/replace.grid.js'],
				dest: 'build/script3.js'
			},
			css: {
				src: ['css/*.css'],
				dest: 'build/styles.css'
			},
		},
		watch: {
			js: {
				src: ['js/lib/*.js', 'js/*.js','js/plugins/*.js', 'js/lib/excel/require.js', 'js/lib/excel/underscore.js',
					'js/lib/excel/jquery.slickgrid.export.excel.js', 'js/lib/excel/excel-builder.js','node_modules/xlsx/dist/xlsx.full.min.js',
					'js/controls/config.grid.js','js/lib/excel/excel-parse.js','js/controls/replace.grid.js'],
				tasks: ['concat'],
			},
			css: {
				files: ['css/*.css'],
				tasks: ['concat'],
			},
		},
		uglify: {
			build: {
				src: 'build/script3.js',
				dest: 'build/replace.grid.min.js'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.registerTask('default', 'concat');

}