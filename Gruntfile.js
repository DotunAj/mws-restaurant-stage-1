
module.exports = function(grunt) {

    grunt.initConfig({
      responsive_images: {
        dev: {
          options: {
            sizes: [
              {
                width: 500,
                suffix: "",
                quality: 90
              }
          ]
          },

          files: [{
            expand: true,
            src: ['*.{gif,jpg,png}'],
            cwd: 'img_src/',
            dest: 'img/'
          }]
        }
      },

      /* Clear out the images directory if it exists */
      clean: {
        dev: {
          src: ['img'],
        },
      },

      /* Generate the images directory if it is missing */
      mkdir: {
        dev: {
          options: {
            create: ['img']
          },
        },
      },

      /* Copy the "fixed" images that don't go through processing into the images/directory */
      copy: {
        main: {
          expand: true,
          cwd: 'img_src',
          src: '**',
          dest: 'img/',
        },
      },
    });

    grunt.loadNpmTasks('grunt-responsive-images');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-mkdir');
    grunt.registerTask('default', ['clean', 'mkdir', 'copy', 'responsive_images']);

  };
