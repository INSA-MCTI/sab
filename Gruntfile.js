// Generated on 2016-07-15 using generator-angular 0.15.1
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
  var http = require('http');
  var https = require('https');
  var urlParser = require('url');
  // Compatibility shim for legacy connect/send packages on modern Node versions.
  if (!Object.getOwnPropertyDescriptor(http.ServerResponse.prototype, '_headers')) {
    Object.defineProperty(http.ServerResponse.prototype, '_headers', {
      configurable: true,
      enumerable: false,
      get: function() {
        return this.getHeaders ? this.getHeaders() : {};
      }
    });
  }

  var api;
  var env = grunt.option('env');
  if (env==="prod") {
    api = require('./bower.json').production;
  } else {
    api = require('./bower.json').development;
  }

  function createApiProxy(targetBaseUrl) {
    var target = urlParser.parse(targetBaseUrl);
    var transport = target.protocol === 'https:' ? https : http;
    var targetPath = (target.pathname || '').replace(/\/$/, '');

    return function(req, res, next) {
      if (req.url.indexOf('/api') !== 0) {
        return next();
      }

      var proxyRequest = transport.request({
        protocol: target.protocol,
        hostname: target.hostname,
        port: target.port || (target.protocol === 'https:' ? 443 : 80),
        method: req.method,
        path: targetPath + req.url.replace(/^\/api/, ''),
        headers: Object.assign({}, req.headers, {
          host: target.host
        })
      }, function(proxyResponse) {
        res.writeHead(proxyResponse.statusCode, proxyResponse.headers);
        proxyResponse.pipe(res);
      });

      proxyRequest.on('error', function(error) {
        res.statusCode = 502;
        res.end('API proxy error: ' + error.message);
      });

      req.pipe(proxyRequest);
    };
  }

  var apiProxyMiddleware = createApiProxy(api);

  var
    path = require('path'),
    swPrecache = require('sw-precache'),
    cacheConfig = require('./cache-config.js'),
    sassCompiler = require('sass');

  grunt.loadNpmTasks('grunt-string-replace');
  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Explicit task loading for compatibility with legacy plugins on modern Node versions.
  [
    'grunt-angular-templates',
    'grunt-concurrent',
    'grunt-contrib-clean',
    'grunt-contrib-concat',
    'grunt-contrib-connect',
    'grunt-contrib-copy',
    'grunt-contrib-cssmin',
    'grunt-contrib-htmlmin',
    'grunt-contrib-imagemin',
    'grunt-contrib-jshint',
    'grunt-contrib-uglify',
    'grunt-contrib-watch',
    'grunt-filerev',
    'grunt-jscs',
    'grunt-ng-annotate',
    'grunt-postcss',
    'grunt-string-replace',
    'grunt-svgmin',
    'grunt-usemin',
    'grunt-wiredep',
    'grunt-ssh',
    'grunt-ssh-deploy'
  ].forEach(grunt.loadNpmTasks);

  // Configurable paths for the application
  var appConfig = {
    app: require('./bower.json').appPath || 'app',
    dist: 'dist'
  };

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    yeoman: appConfig,

    // Load credentials (optional in local development)
    secret: grunt.file.exists('secret.json') ? grunt.file.readJSON('secret.json') : {
      development: {},
      production: {}
    },

    environments: {
      options: {
        local_path: 'dist',
        current_symlink: 'olhonagua'
      },
      dev: {
          options: {
              host: '<%= secret.development.host %>',
              username: '<%= secret.development.username %>',
              password: '<%= secret.production.password %>',
              port: '<%= secret.development.port %>',
              deploy_path: '<%= secret.development.deploy_path %>',
              debug: true,
              releases_to_keep: '3'
          }
      },
      prod: {
          options: {
              host: '<%= secret.production.host %>',
              username: '<%= secret.production.username %>',
              password: '<%= secret.production.password %>',
              port: '<%= secret.production.port %>',
              deploy_path: '<%= secret.production.deploy_path %>',
              releases_to_keep: '5'
          }
      }
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['wiredep']
      },
      js: {
        files: ['<%= yeoman.app %>/scripts/{,*/}*.js'],
        tasks: ['newer:jshint:all', 'newer:jscs:all'],
        options: {}
      },
      jsTest: {
        files: ['test/spec/{,*/}*.js'],
        tasks: ['newer:jshint:test', 'newer:jscs:test', 'karma']
      },
      styles: {
        files: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}'],
        tasks: ['sassCompile:server', 'postcss:server']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost'
      },
      livereload: {
        options: {
          open: true,
          middleware: function (connect) {
            return [
              apiProxyMiddleware,
              connect.static('.tmp'),
              connect().use(
                '/bower_components',
                connect.static('./bower_components')
              ),
              connect().use(
                '/app/styles',
                connect.static('./app/styles')
              ),
              connect.static(appConfig.app)
            ];
          }
        }
      },
      test: {
        options: {
          port: 9001,
          middleware: function (connect) {
            return [
              connect.static('.tmp'),
              connect.static('test'),
              connect().use(
                '/bower_components',
                connect.static('./bower_components')
              ),
              connect.static(appConfig.app)
            ];
          }
        }
      },
      dist: {
        options: {
          open: true,
          base: '<%= yeoman.dist %>'
        }
      }
    },

    // Make sure there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: {
        src: [
          'Gruntfile.js',
          '<%= yeoman.app %>/scripts/{,*/}*.js'
        ]
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/spec/{,*/}*.js']
      }
    },

    // Make sure code styles are up to par
    jscs: {
      options: {
        config: '.jscsrc',
        verbose: true
      },
      all: {
        src: [
          'Gruntfile.js',
          '<%= yeoman.app %>/scripts/{,*/}*.js'
        ]
      },
      test: {
        src: ['test/spec/{,*/}*.js']
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/{,*/}*',
            '!<%= yeoman.dist %>/.git{,*/}*'
          ]
        }]
      },
      server: '.tmp'
    },

    // Add vendor prefixed styles
    postcss: {
      options: {
        processors: [
          require('autoprefixer-core')({browsers: ['last 1 version']})
        ]
      },
      server: {
        options: {
          map: true
        },
        files: [{
          expand: true,
          cwd: '.tmp/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/styles/'
        }]
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/styles/'
        }]
      }
    },

    // Automatically inject Bower components into the app
    wiredep: {
      app: {
        src: ['<%= yeoman.app %>/index.html'],
        ignorePath:  /\.\.\//
      },
      test: {
        devDependencies: true,
        src: '<%= karma.unit.configFile %>',
        ignorePath:  /\.\.\//,
        fileTypes:{
          js: {
            block: /(([\s\t]*)\/{2}\s*?bower:\s*?(\S*))(\n|\r|.)*?(\/{2}\s*endbower)/gi,
              detect: {
                js: /'(.*\.js)'/gi
              },
              replace: {
                js: '\'{{filePath}}\','
              }
            }
          }
      },
      sass: {
        src: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}'],
        ignorePath: /(\.\.\/){1,2}bower_components\//
      }
    },

    // Compiles Sass to CSS using dart-sass (Node), replacing compass/ruby
    sassCompile: {
      server: {
        options: {
          style: 'expanded',
          sourceMap: true
        },
        files: [{
          src: '<%= yeoman.app %>/styles/main.scss',
          dest: '.tmp/styles/main.css'
        }]
      },
      test: {
        options: {
          style: 'expanded',
          sourceMap: false
        },
        files: [{
          src: '<%= yeoman.app %>/styles/main.scss',
          dest: '.tmp/styles/main.css'
        }]
      },
      dist: {
        options: {
          style: 'expanded',
          sourceMap: false
        },
        files: [{
          src: '<%= yeoman.app %>/styles/main.scss',
          dest: '.tmp/styles/main.css'
        }]
      }
    },

    // Renames files for browser caching purposes
    filerev: {
      dist: {
        src: [
          '<%= yeoman.dist %>/scripts/{,*/}*.js',
          '<%= yeoman.dist %>/styles/{,*/}*.css',
          '<%= yeoman.dist %>/images/*.{png,jpg,jpeg,gif,webp,svg}',
          '<%= yeoman.dist %>/styles/fonts/*'
        ]
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: '<%= yeoman.app %>/index.html',
      options: {
        dest: '<%= yeoman.dist %>',
        flow: {
          html: {
            steps: {
              js: ['concat', 'uglifyjs'],
              css: ['cssmin']
            },
            post: {}
          }
        }
      }
    },

    // Performs rewrites based on filerev and the useminPrepare configuration
    usemin: {
      html: ['<%= yeoman.dist %>/{,*/}*.html'],
      css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
      js: ['<%= yeoman.dist %>/scripts/{,*/}*.js'],
      options: {
        assetsDirs: [
          '<%= yeoman.dist %>',
          '<%= yeoman.dist %>/images',
          '<%= yeoman.dist %>/styles'
        ],
        patterns: {
          js: [[/(images\/[^''""]*\.(png|jpg|jpeg|gif|webp|svg))/g, 'Replacing references to images']]
        }
      }
    },

    // The following *-min tasks will produce minified files in the dist folder
    // By default, your `index.html`'s <!-- Usemin block --> will take care of
    // minification. These next options are pre-configured if you do not wish
    // to use the Usemin blocks.
    // cssmin: {
    //   dist: {
    //     files: {
    //       '<%= yeoman.dist %>/styles/main.css': [
    //         '.tmp/styles/{,*/}*.css'
    //       ]
    //     }
    //   }
    // },
    // uglify: {
    //   dist: {
    //     files: {
    //       '<%= yeoman.dist %>/scripts/scripts.js': [
    //         '<%= yeoman.dist %>/scripts/scripts.js'
    //       ]
    //     }
    //   }
    // },
    // concat: {
    //   dist: {}
    // },

    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.{png,jpg,jpeg,gif}',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.svg',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },

    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          conservativeCollapse: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>',
          src: ['*.html'],
          dest: '<%= yeoman.dist %>'
        }]
      }
    },

    ngtemplates: {
      dist: {
        options: {
          module: 'sabApp',
          htmlmin: '<%= htmlmin.dist.options %>',
          usemin: 'scripts/scripts.js'
        },
        cwd: '<%= yeoman.app %>',
        src: 'views/{,*/}*.html',
        dest: '.tmp/templateCache.js'
      }
    },

    // ng-annotate tries to make the code safe for minification automatically
    // by using the Angular long form for dependency injection.
    ngAnnotate: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat/scripts',
          src: '*.js',
          dest: '.tmp/concat/scripts'
        }]
      }
    },

    // Replace Google CDN references
    cdnify: {
      dist: {
        html: ['<%= yeoman.dist %>/*.html']
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            '*.{ico,png,txt}',
            '*.html',
            'images/{,*/}*.{webp}',
            'styles/fonts/{,*/}*.*',
            'manifest.json'
          ]
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: '<%= yeoman.dist %>/images',
          src: ['generated/*']
        }, {
          expand: true,
          cwd: '.',
          src: 'bower_components/bootstrap-sass-official/assets/fonts/bootstrap/*',
          dest: '<%= yeoman.dist %>'
        }, {
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>/images',
          src: 'icons/*'
        }]
      },
      styles: {
        expand: true,
        cwd: '<%= yeoman.app %>/styles',
        dest: '.tmp/styles/',
        src: '{,*/}*.css'
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        'sassCompile:server'
      ],
      test: [
        'sassCompile:test'
      ],
      dist: [
        'sassCompile:dist',
        'imagemin',
        'svgmin'
      ]
    },

    // Test settings
    karma: {
      unit: {
        configFile: 'test/karma.conf.js',
        singleRun: true
      }
    },

    'string-replace': {
      dist: {
        files: {
          'dist/scripts/': 'dist/scripts/*.js'
        },
        options: {
          replacements: [{
            pattern: /http:\/\/localhost:5003\/api/ig,
            replacement: api
          }]
        }
      }
    },

    // Service worker
    swPrecache:{
      build: {
        handleFetch: true,
        rootDir: '<%= yeoman.dist %>'
      }
    }
  });

  grunt.registerMultiTask('sassCompile', function() {
    var options = this.options({
      style: 'expanded',
      sourceMap: false
    });

    this.files.forEach(function(file) {
      var src = file.src && file.src[0];
      if (!src || !grunt.file.exists(src)) {
        grunt.fail.warn('Sass source file not found: ' + src);
        return;
      }

      var result = sassCompiler.compile(src, {
        style: options.style,
        sourceMap: !!options.sourceMap,
        loadPaths: [
          path.resolve('app/styles'),
          path.resolve('bower_components')
        ]
      });

      grunt.file.write(file.dest, result.css);

      if (options.sourceMap && result.sourceMap) {
        grunt.file.write(file.dest + '.map', JSON.stringify(result.sourceMap));
      }
    });
  });

  grunt.registerMultiTask('swPrecache', function() {
    var done = this.async();
    var rootDir = this.data.rootDir;
    var handleFetch = this.data.handleFetch;

    swPrecache.write(path.join(rootDir, 'service-worker.js'), cacheConfig, function(error) {
      if (error) {
        grunt.fail.warn(error);
      }
      done();
    });
  });

  grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'wiredep',
      'concurrent:server',
      'postcss:server',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('server', 'DEPRECATED TASK. Use the "serve" task instead', function (target) {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve:' + target]);
  });

  grunt.registerTask('test', [
    'clean:server',
    'wiredep',
    'concurrent:test',
    'postcss',
    'connect:test',
    'karma'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'wiredep',
    'useminPrepare',
    'concurrent:dist',
    'postcss',
    'ngtemplates',
    'concat',
    'ngAnnotate',
    'copy:dist',
    'cssmin',
    'uglify',
    'filerev',
    'usemin',
    'htmlmin',
    'string-replace',
    'swPrecache'
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'newer:jscs',
    'test',
    'build'
  ]);

  grunt.registerTask('teste', [
    'string-replace']);

};
