#!/bin/sh
#
# Script for deploying the "release" version of the currently set JS layers via the profile file.
# It will create (or overwrite) the release folder in the JS_LIB/custom/ directory,
# i.e. JS_LIB/custom/release/RELEASE_VERSION
#
# @author Matthias Kerstner <matthias@kerstner.at>
#
 
#profile file should reside inside current directory
PROFILE_FILE=custom.profile.js
 
CWD="$(cygpath -aw $(pwd))"
#UNIX: $(pwd)
 
#(absolute) path to PHP, or simply 'php' if it is in the PATH
PHP_PATH="/cygdrive/c/xampp/php/php.exe"
#UNIX: "/opt/lampp/bin/php"
 
#release number should be read from config/base.php
PHP_REQUIRE="require('$(cygpath -aw $(pwd)/../src/config/base.php)')"
#UNIX: "require('$(pwd)/../src/config/base.php');"
 
#get release version from config file
RELEASE_VERSION=`$PHP_PATH -r "$PHP_REQUIRE; echo MY_VERSION;"`
 
#determine release path
RELEASE_PATH="$(cygpath -aw $(pwd)/../src/web/js/release/)"
#UNIX: $(pwd)/../src/web/js/release/
 
# remove any previous releases
if [ -d $RELEASE_PATH ]; then
  echo "removing existing releases..."
  rm -r $RELEASE_PATH
fi
 
# create release directory again
mkdir $RELEASE_PATH
 
# path to dojo buildscript
DOJO_BUILDSCRIPT_PATH=$(pwd)/../src/web/js/util/buildscripts/
 
echo switching to buildscript path $DOJO_BUILDSCRIPT_PATH
 
#change to buildscripts folder as required by dojo's build.sh
cd $DOJO_BUILDSCRIPT_PATH
 
#call dojo's build script with profile specified above
#UNIX: build.sh
#WINDOWS: build.bat
exec ./build.bat profileFile=../../profile/"$PROFILE_FILE" \
action=release cssOptimize=comments optimize=shrinkSafe releaseName=$RELEASE_VERSION
 
#change to lib/js folder
cd $(cygpath -aw $(pwd)/../../)
#UNIX: $(pwd)/../../