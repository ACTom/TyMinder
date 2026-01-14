/* global require, module */

var path = require('path');

module.exports = function(grunt) {
    'use strict';

	// Load grunt tasks automatically
	require('load-grunt-tasks')(grunt);
    grunt.loadNpmTasks('grunt-browser-sync');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.loadNpmTasks('grunt-replace');

    var pkg = grunt.file.readJSON('package.json');

	var appConfig = {
		app: require('./bower.json').appPath || 'app',
		dist: 'dist'
	};

    var banner = '/*!\n' +
        ' * ====================================================\n' +
        ' * <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
        ' * GitHub: <%= pkg.repository ? pkg.repository.url : "https://github.com/fex-team/kityminder-editor" %> \n' +
        ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= typeof pkg.author === "string" ? pkg.author : pkg.author.name %>;' +
        ' Licensed <%= pkg.license || (pkg.licenses ? _.pluck(pkg.licenses, "type").join(", ") : "BSD") %>\n' +
        ' * ====================================================\n' +
        ' */\n\n';

    var expose = '\nuse(\'expose-editor\');\n';

    // Project configuration.
    grunt.initConfig({

        // Metadata.
        pkg: pkg,

	    yeoman: appConfig,

        clean: {
            last: [
	            '.tmp',
	            'dist'
            ],
	        clstmp: ['.tmp']
        },

        // resolve dependence
        dependence: {
            options: {
                base: 'src',
                entrance: 'expose-editor'
            },
            merge: {
                files: [{
                    src: [
                        'src/**/*.js',
						'l10n/*.js'
                    ],
                    dest: '.tmp/scripts/kityminder.editor.logic.js'
                }]
            }
        },

        // browser sync for dev
		browserSync: {
            bsFiles: {
                dist: 'dist/css/*.css',
                src: 'src/**',
                ui: 'ui/**',
                html: 'index.html',
                lang: 'l10n/*.js'
            },
            options: {
                server: {
                    baseDir: './',
                    index: 'index.html',
                    watchTask: true
                },
                open: false,
                // 禁用交互同步，避免多窗口互相影响
                ghostMode: false,
                // 禁用点击、滚动、表单同步
                clicks: false,
                scroll: false,
                forms: false
            }
		},

        // concat
        concat: {
            closure: {
                options: {
                    banner: banner + '(function () {\n',
                    footer: expose + '})();'
                },
                files: {
	                'dist/kityminder.editor.js': [
		                '.tmp/scripts/kityminder.editor.logic.js',
		                '.tmp/scripts/kityminder.app.annotated.js',
		                '.tmp/scripts/templates.annotated.js',
		                '.tmp/scripts/service/*.js',
		                '.tmp/scripts/filter/*.js',
                        '.tmp/scripts/dialog/**/*.js',
		                '.tmp/scripts/directive/**/*.js'
	                ]
                }
            }
        },

        uglify: {
            options: {
                banner: banner
            },
            minimize: {
                files: [{
	                src: 'dist/kityminder.editor.js',
	                dest: 'dist/kityminder.editor.min.js'
                }]
            }
        },

        less: {
            compile: {
                options: {
                    sourceMap: true,
	                sourceMapURL: 'kityminder.editor.css.map',
                    sourceMapFilename: 'dist/kityminder.editor.css.map'
                },
                files: [{
                    dest: 'dist/kityminder.editor.css',
                    src: 'less/editor.less'
                }]
            }
        },

	    cssmin: {
	        dist: {
	            files: {
	                'dist/kityminder.editor.min.css': 'dist/kityminder.editor.css'
	         }
	       }
	    },

	    ngtemplates: {
		    kityminderEditor: {
			    src: ['ui/directive/**/*.html', 'ui/dialog/**/*.html'],
			    dest: 'ui/templates.js',
			    options: {
				    htmlmin: {
					    collapseBooleanAttributes: true,
					    collapseWhitespace: true,
					    removeComments: true
				    }
			    }
		    }
	    },

	    // Automatically inject Bower components into the app
	    wiredep: {
		    dev: {
			    src: ['index.html'],
			    devDependencies: true
		    },
		    dist: {
			    src: ['dist/index.html']
		    }
	    },

	    // Copies remaining files to places other tasks can use
	    copy: {
		    dist: {
				files: [{
				    expand: true,
				    cwd: 'ui',
					src: 'images/*',
				    dest: 'dist'
			    }, {
                    // Copy bower components CSS
                    expand: true,
                    flatten: true,
                    src: [
                        'bower_components/bootstrap/dist/css/bootstrap.css',
                        'bower_components/codemirror/lib/codemirror.css',
                        'bower_components/hotbox/hotbox.css',
                        'bower_components/color-picker/dist/color-picker.css',
                        'node_modules/tyminder-core/dist/kityminder.core.css'
                    ],
                    dest: 'dist/css'
                }, {
                    // Copy bower components JS
                    expand: true,
                    flatten: true,
                    src: [
                        'bower_components/jquery/dist/jquery.js',
                        'bower_components/bootstrap/dist/js/bootstrap.js',
                        'bower_components/angular/angular.js',
                        'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
                        'bower_components/codemirror/lib/codemirror.js',
                        'bower_components/codemirror/mode/xml/xml.js',
                        'bower_components/codemirror/mode/javascript/javascript.js',
                        'bower_components/codemirror/mode/css/css.js',
                        'bower_components/codemirror/mode/htmlmixed/htmlmixed.js',
                        'bower_components/codemirror/mode/markdown/markdown.js',
                        'bower_components/codemirror/addon/mode/overlay.js',
                        'bower_components/codemirror/mode/gfm/gfm.js',
                        'bower_components/angular-ui-codemirror/ui-codemirror.js',
                        'bower_components/marked/lib/marked.js',
                        'node_modules/kity/dist/kity.js',
                        'bower_components/hotbox/hotbox.js',
                        'node_modules/tyminder-core/dist/kityminder.core.js',
                        'bower_components/color-picker/dist/color-picker.js',
                        'bower_components/js-base64/base64.min.js',
                        'bower_components/jszip/dist/jszip.min.js'
                    ],
                    dest: 'dist/js'
                }, {
                    // Copy bootstrap fonts
                    expand: true,
                    cwd: 'bower_components/bootstrap/dist/fonts',
                    src: ['*'],
                    dest: 'dist/fonts'
                }, {
                    src: 'favicon.ico',
                    dest: 'dist/favicon.ico'
                }]
		    }
	    },

        replace: {
            dist: {
                options: {
                    patterns: [
                        {
                            match: /<link rel="stylesheet" href="bower_components\/.*\/([^\/]+\.css)" \/>/g,
                            replacement: '<link rel="stylesheet" href="css/$1" />'
                        },
                        {
                            match: /<link rel="stylesheet" href="node_modules\/.*\/([^\/]+\.css)" \/>/g,
                            replacement: '<link rel="stylesheet" href="css/$1" />'
                        },
                        {
                            match: /<script src="bower_components\/seajs\/dist\/sea\.js"><\/script>/g,
                            replacement: ''
                        },
                        {
                            match: /<script src="bower_components\/.*\/([^\/]+\.js)"><\/script>/g,
                            replacement: '<script src="js/$1"></script>'
                        },
                        {
                            match: /<script src="node_modules\/.*\/([^\/]+\.js)"><\/script>/g,
                            replacement: '<script src="js/$1"></script>'
                        },
                        {
                            match: /<script src="ui\/kityminder\.app\.js">[\s\S]*?<script src="ui\/directive\/contextMenu\/contextMenu\.directive\.js"><\/script>/,
                            replacement: '<script src="kityminder.editor.min.js"></script>'
                        },
                        {
                            match: /<link rel="stylesheet" href="dist\/kityminder\.editor\.css">/,
                            replacement: '<link rel="stylesheet" href="kityminder.editor.min.css">'
                        }
                    ]
                },
                files: [
                    {expand: true, flatten: true, src: ['index.html'], dest: 'dist/'}
                ]
            }
        },


	    // ng-annotate tries to make the code safe for minification automatically
	    // by using the Angular long form for dependency injection.
	    ngAnnotate: {
		    dist: {
			    files: [{
				    expand: true,
				    cwd: 'ui/',
				    src: '**/*.js',
				    ext: '.annotated.js',
				    extDot: 'last',
				    dest: '.tmp/scripts/'
			    }]
		    }
	    }


    });

    // Build task(s).
	grunt.registerTask('build', ['clean:last',
		//'wiredep:dist',
        'ngtemplates', 'dependence', 'ngAnnotate', 'concat', 'uglify', 'less', 'cssmin', 'copy', 'replace', 'clean:clstmp']);

	grunt.registerTask('dev', ['clean:last',
        //'wiredep:dev',
        'ngtemplates', 'dependence', 'ngAnnotate', 'concat', 'uglify', 'less', 'cssmin', 'copy', 'clean:clstmp', 'browserSync', 'watch']);
};