#CAT-ANGULAR#

In this repository we will share our common angular js code


##local development##

- fork: https://github.com/Catalysts/cat-angular/fork
- clone your fork
- open up the ide of your choice
- ensure node.js is installed
- run 'npm install'
- ensure bower cli is installed (npm install -g bower)
- run 'bower install'
- run 'gulpw watch'
- code
- commit and push your changes to your fork
- create merge request

##integration into other projects##

cat-angular is published via bower, just call 'bower install cat-angular' to install it.
add the --save option to automatically add it to your bower.json file as dependency

##getting local changes into other projects##
- execute 'bower link' within the 'dist' folder of cat-angular
- execute 'bower link cat-angular' in the directory containing your bower.json file of your project - **NOTE** _admin privileges required_