module.exports = function (grunt) {
	grunt.initConfig({
		concat: {
			option : {
				stripBanners:  {
					force: true,
					all: true
				}
			},
			js: {
				src: ['js/lib/jquery-ui-1.8.16.custom.min.js','js/lib/jquery.event.drag-2.2.js','js/lib/jquery.event.drop-2.2.js','js/slick.core.js','js/slick.editors.js',
					'js/slick.grid.js','js/plugins/slick.cellrangeselector.js','js/plugins/slick.cellexternalcopymanager.js','js/plugins/slick.cellselectionmodel.js',
					'js/plugins/slick.cellrangedecorator.js','js/plugins/slick.dataview.js','js/lib/util/shim.js','js/lib/util/underscore.js','js/plugins/moxie.js',
					'js/plugins/fileupload.js','node_modules/xlsx/dist/jszip.js','node_modules/xlsx/dist/xlsx.js','js/lib/util/typedarray.js','js/lib/util/Blob.js',
					'js/lib/util/FileSaver.js','js/lib/util/downloadify.min.js','js/lib/util/swfobject.js','js/lib/util/base64.min.js','js/lib/util/excel-parse.js',
					'js/controls/config.grid.js','js/controls/replace.grid.js'],
				dest: 'build/script.js'
			},
			css: {
				src: ['css/*.css'],
				dest: 'build/styles.css'
			},
		},
		watch: {
			js: {
				src: ['js/lib/jquery-ui-1.8.16.custom.min.js','js/lib/jquery.event.drag-2.2.js','js/lib/jquery.event.drop-2.2.js','js/slick.core.js','js/slick.editors.js',
					'js/slick.grid.js','js/plugins/slick.cellrangeselector.js','js/plugins/slick.cellexternalcopymanager.js','js/plugins/slick.cellselectionmodel.js',
					'js/plugins/slick.cellrangedecorator.js','js/plugins/slick.dataview.js','js/lib/util/shim.js','js/lib/util/underscore.js','js/plugins/moxie.js',
					'js/plugins/fileupload.js','node_modules/xlsx/dist/jszip.js','node_modules/xlsx/dist/xlsx.js','js/lib/util/typedarray.js','js/lib/util/Blob.js',
					'js/lib/util/FileSaver.js','js/lib/util/downloadify.min.js','js/lib/util/swfobject.js','js/lib/util/base64.min.js','js/lib/util/excel-parse.js',
					'js/controls/config.grid.js','js/controls/replace.grid.js'],
				tasks: ['concat'],
			},
			css: {
				files: ['css/*.css'],
				tasks: ['concat'],
			},
		},
		uglify: {
			option: {
				beautify: false,
				compress: {
					dropconsole: true
				}
			},
			build: {
				src: 'build/script.js',
				dest: 'build/replace.grid.min.js'
			}
		}
	});

	grunt.file.defaultEncoding = 'utf-8';
	grunt.file.preserveBOM = true;
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.registerTask('default', 'concat');

}