#!/usr/bin/env node

const UglifyJS = require('uglify-js');
const fs = require('fs');
const path = require('path');
const pwd = (...args) => path.resolve(process.cwd(), ...args);
const argv = process.argv.splice(2);
var exec = require('child_process').exec;

let onlyUglifty = false;
let stop = false;
let dirs = [];
let tsx = undefined;
let out = undefined;
let css = true;
let other = '';
let lib = 'esnext, dom, dom.iterable';
let t = 'es3';
let jsx = 'react';

for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '-c') {
    onlyUglifty = true;
    dirs = argv[i + 1].split(',');
    dirs = dirs.map(v => v.trim());
  } else if (argv[i] === '--tsx') {
    tsx = argv[i + 1];
  } else if (argv[i] === '--outDir') {
    out = argv[i + 1];
    if (dirs.length === 0) {
      dirs = argv[i + 1].split(',');
      dirs = dirs.map(v => v.trim());
    }
  } else if (argv[i] === '--lib') {
    lib = argv[i + 1];
  } else if (argv[i] === '--jsx') {
    jsx = argv[i + 1];
  } else if (argv[i] === '-t') {
    t = argv[i + 1];
  } else if (argv[i] === '-t') {
    t = argv[i + 1];
  } else if (argv[i] === '--other') {
    other = argv[i + 1];
  } else if (argv[i] === '--no-css') {
    css = false;
  } else if (argv[i] === '--help') {
    stop = true;
    console.log('--outDir: tsc --outDir');
    console.log('--c: only uglify-js dir');
    console.log(`--lib: tsc --lib  default: 'esnext, dom, dom.iterable'`);
    console.log('--t: tsc -t default: es3');
    console.log('--jsx: tsc -jsx default: react');
    console.log('--other: tsc other script');
    console.log('--help: view this');
    console.log(' ');
    console.log('example build ts|tsx and uglify-js:');
    console.log('tscu example/src/lib/* --outDir ./es');
    console.log(' ');
    console.log('example onliy uglify-js dir:');
    console.log('tscu -c ./es');
    console.log(' ');
  } else if (i === 0) {
    tsx = argv[i];
  } else {
    other += ' ' + argv[i];
  }
}

if (stop) {
  return;
}

function uglifyFn() {
  if (tsx && out && css) {
    const cssFiles = fs.readdirSync(pwd(tsx));
    cssFiles.forEach(file => {
      if (file.indexOf('.css') > 0) {
        fs.copyFileSync(pwd(tsx, file), pwd(out, file));
      }
    });
  }

  const options = {
    mangle: {
      properties: true,
    },
  };

  dirs.forEach(dir => {
    const dirFiles = fs.readdirSync(pwd(dir));
    dirFiles.forEach(file => {
      console.log('---------', file);
      // 只编译js, 忽略map
      if (
        file.indexOf('.js') > 0 &&
        file.indexOf('.map') < 0 &&
        file.indexOf('.json') < 0 &&
        file.indexOf('.jsx') < 0
      ) {
        const fps = pwd(dir, file);
        fs.writeFileSync(
          fps,
          UglifyJS.minify(
            {
              [fps]: fs.readFileSync(fps, 'utf8'),
            },
            options,
          ).code,
          'utf8',
        );
      }
    });
  });
}

if (out && !fs.existsSync(pwd(out))) {
  fs.mkdirSync(pwd(out));
}
if (onlyUglifty) {
  uglifyFn();
} else if (tsx && out) {
  let str = `npx tsc ${tsx}/* --outDir ${out} --jsx ${jsx} -d true -t ${t} --skipLibCheck true --lib '${lib}' ${other}`;
  // console.log('typescript-tsc:', str);
  exec(str, function(error, stdout, stderr) {
    if (error !== null) {
      console.log('execAsync error: ' + JSON.stringify(error));
    }
    uglifyFn();
  });
}
