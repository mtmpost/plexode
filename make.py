#!/usr/bin/python

import os
import os.path
import shutil
import subprocess
import sys
import time
import py
from py import *

# The basic file layout extends beyond what's in git.
# You can have a root directory anywhere.  I call it "dev", but you can call it
# anything, as it's never referred to by name in the code.
#
# The closure compiler goes here:
# dev/tools/closure-compiler/compiler.jar
#
# The git directory for project plexode goes here:
# dev/src/plexode
# so that this file ends up at
# dev/src/plexode/make.py
#
# Invoke it from dev/src/plexode, like this:
# ./make.py
#
# That erases the ../../build/plexode directory and rebuilds it, like this:
# dev/build/plexode/cgi-bin/{some python CGI scripts}
# dev/build/plexode/public_html/index.html
# dev/build/plexode/public_html/insta-html/index.html
# etc.
# dev/build/plexode/public_html/vorp/index.html
# dev/build/plexode/public_html/vorp/vorp_sometimestamp.js
# etc.




def ensureDir(f):
  d = os.path.dirname('%s/' % f)
  print 'ensuring %s' % d
  if not os.path.exists(d):
    os.makedirs(d)


def writePublicHtml(bdir, path, content):
  print "  %s/index.html" % path
  d = '%s/public_html%s' % (bdir, path)
  ensureDir(d)
  f = open('%s/index.html' % d, 'w')
  f.write(content)
  f.close()


def buildPlexode(bdir):
  print "START building plexode"

  if os.path.exists(bdir):
    print "removing old %s" % bdir
    shutil.rmtree(bdir)
  
  print "creating %s" % bdir
  os.makedirs(bdir)
  
  print "copying stuff to %s" % bdir
  shutil.copytree("cgi-bin", "%s/cgi-bin" % bdir)
  shutil.copytree("public_html",  "%s/public_html" % bdir)
  
  print "compiling vorp JS"
  vorpJsName = 'vorp_%s.js' % str(int(time.time() * 1000))
  compileJs(
    '../../tools/closure-compiler',
    getVorpJsCompFlags(bdir, getVorpJsFileNames(), vorpJsName))

  print "generating index.html files"
  writePublicHtml(bdir,'', mainpage.formatMain())
  writePublicHtml(bdir, '/insta-html', instahtml.formatInstaHtml())
  writePublicHtml(bdir, '/eval', eval1.formatEval())
  writePublicHtml(bdir, '/eval2', eval2.formatEval2())
  writePublicHtml(bdir, '/eval3', eval3.formatEval3())
  writePublicHtml(bdir, '/eval3quirks', eval3quirks.formatEval3Quirks())
  writePublicHtml(bdir, '/fracas', fracas.formatFracas())
  writePublicHtml(bdir, '/vorp', vorp.formatVorp())
  writePublicHtml(bdir, '/vorp/level1', vorp.formatVorpLevel(vorpJsName, "Level 1", "first level ever"))
  writePublicHtml(bdir, '/vorp/level2', vorp.formatVorpLevel(vorpJsName, "Level 2", "wall of death test"))
  writePublicHtml(bdir, '/vorp/level3', vorp.formatVorpLevel(vorpJsName, "Level 3", "first proper level"))
  writePublicHtml(bdir, '/vorp/level4', vorp.formatVorpLevel(vorpJsName, "Level 4", "sensor and door test"))
  writePublicHtml(bdir, '/vorp/level5', vorp.formatVorpLevel(vorpJsName, "Level 5", "zero-gravity grip-switch test"))
  writePublicHtml(bdir, '/vorp/level6', vorp.formatVorpLevel(vorpJsName, "Level 6", "second proper level"))
  writePublicHtml(bdir, '/chordo', chordo.formatChordo())

  print "DONE building plexode"


def getJsFileNamesInPath(startPath):
  js = []
  # Add all JS files in the vorp tree
  for root, dirs, files in os.walk(startPath):
    for fname in files:
      if (fname[-3:] == ".js"):
        js.append(os.path.join(root, fname))
  return js


def getVorpJsFileNames():
  js = []
  prefix = 'public_html/js/'
  js.extend(getJsFileNamesInPath('%sgaam' % prefix))
  miscDeps = [
    'circularqueue.js',
    'gameutil.js',
    'skipqueue.js',
    'util.js',
    'vec2d.js',
    'plex/array.js',
    'plex/point.js',
    'plex/rect.js',
    'plex/type.js',
  ]
  for dep in miscDeps:
    js.append('%s%s' % (prefix, dep))

  vorpJs = getJsFileNamesInPath('public_html/vorp')
  for dep in vorpJs:
    if dep[-8:] != 'level.js':
      js.append(dep)

  return js


def getVorpJsCompFlags(bdir, jsFileNames, vorpJsName):
  flags = []
  flags.extend(['--js_output_file', '%s/public_html/vorp/%s' % (bdir, vorpJsName)])
  flags.extend(['--compilation_level', 'WHITESPACE_ONLY'])
  #flags.extend(['--compilation_level', 'SIMPLE_OPTIMIZATIONS'])
  # SIMPLE_OPTIMIZATIONS works, with lots of good warnings but little compression win.
  # ADVANCED_OPTIMIZATIONS doesn't work yet.

  warnings = ['checkVars', 'undefinedVars', 'missingProperties']
  for warning in warnings:
    flags.append('--jscomp_warning')
    flags.append(warning)

  for jsFileName in jsFileNames:
    flags.append('--js')
    flags.append(jsFileName)
    
  return flags


def compileJs(pathOfCompilerJar, jsCompFlags):
  compilerJarPath = os.path.join(pathOfCompilerJar, 'compiler.jar')
  while not os.path.isfile(compilerJarPath):
    print 'You must download the closure compiler to %s' % compilerJarPath
    response = raw_input('Would you like to download the compiler? [Y/n] ')
    if not response or response.upper() == 'Y':
      downloadClosure(pathOfCompilerJar)
    else:
      print 'not downloading'
      exit(1)

  argList = ['java', '-jar', compilerJarPath]
  argList.extend(jsCompFlags)
  runCommand(argList)


def downloadClosure(pathOfCompilerJar):
  ensureDir(pathOfCompilerJar)
  argList = [
      'curl', '-O',
      'http://closure-compiler.googlecode.com/files/compiler-latest.zip']
  runCommand(argList)
  argList = [
      'unzip', 'compiler-latest.zip', 'compiler.jar', '-d', pathOfCompilerJar]
  runCommand(argList)
  argList = ['rm', 'compiler-latest.zip']
  runCommand(argList)


def runCommand(argList):
  print 'calling'
  print ' '.join(argList)
  print 'now...'
  subprocess.check_call(argList)

def printHelp():
  print("Usage: make.py -build_dir DIRECTORY")
    

def main():
  d = {}
  if len(sys.argv) == 3 and sys.argv[1] == '-build_dir':
    buildPlexode(sys.argv[2])
  else:
    printHelp()
    sys.exit(2)
    

if __name__ == "__main__":
  main()

