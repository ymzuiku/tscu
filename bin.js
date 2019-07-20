#!/usr/bin/env node

const UglifyJS = require('uglify-js');
const fs = require('fs-extra');
const path = require('path');
const pwd = (...args) => path.resolve(process.cwd(), ...args);
const argv = process.argv.splice(2);
var exec = require('child_process').exec;

let onlyUglifty = false;
let stop = false;
let dirs = [];
let noc = false;
let tsx = undefined;
let outDir = undefined;
let css = true;
let other = '';
let lib = 'esnext,dom,dom.iterable';
let outLib = undefined;
let t = 'es3';
let jsx = 'react';
let copy = undefined;
let copyDir = undefined;

for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '-c') {
    onlyUglifty = true;
    dirs = argv[i + 1].split(',');
    dirs = dirs.map((v) => v.trim());
  } else if (argv[i] === '--tsx') {
    tsx = argv[i + 1];
  } else if (argv[i] === '--outDir') {
    outDir = argv[i + 1];
    if (dirs.length === 0) {
      dirs = argv[i + 1].split(',');
      dirs = dirs.map((v) => v.trim());
    }
  } else if (argv[i] === '--lib') {
    lib = argv[i + 1];
  } else if (argv[i] === '--outLib') {
    outLib = argv[i + 1];
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
  } else if (argv[i] === '--no-c') {
    noc = true;
  } else if (argv[i] === '--copy') {
    const str = argv[i + 1].split(',');
    copy = [];
    str.forEach((v) => {
      if (v) {
        v = v.trim();
        v = v.replace(/\'/g, '');
        copy.push(v);
      }
    });
  } else if (argv[i] === '--copyDir') {
    copyDir = argv[i + 1];
  } else if (argv[i] === '--help') {
    stop = true;
    console.log('--outDir: tsc --outDir');
    console.log('--c: only uglify-js dir');
    console.log(`--lib: tsc --lib  default: 'esnext, dom, dom.iterable'`);
    console.log('--t: tsc -t default: es3');
    console.log('--jsx: tsc -jsx default: react');
    console.log('--no-css: no copy .css|.scss|.less|.styl file');
    console.log('--copy: copy files to --outDir or --copyDir(if have)');
    console.log('--copyDir: copy files to --copyDir');
    console.log('--other: tsc other script');
    console.log('--help: view this');
    console.log(' ');
    console.log('example build ts|tsx and uglify-js:');
    console.log(`tscu example/src/lib/*.tsx --outDir ./es --copy 'package.json, README.md, .npmignore' `);
    console.log(' ');
    console.log('example onliy uglify-js dir:');
    console.log('tscu -c ./es');
    console.log(' ');
  } else if (i === 0) {
    tsx = argv[i];
  }
}

if (stop) {
  return;
}

const makeAndClearDir = (dirPath) => {
  if (fs.existsSync(dirPath)) {
    fs.removeSync(dirPath);
  }
  fs.mkdirSync(dirPath);
};

function uglifyFn() {
  if (noc) {
    return;
  }
  if (tsx && outDir && css) {
    const cssFiles = fs.readdirSync(pwd(tsx));
    cssFiles.forEach((file) => {
      if (
        file.indexOf('.css') > 0 ||
        file.indexOf('.less') > 0 ||
        file.indexOf('.scss') > 0 ||
        file.indexOf('.styl') > 0
      ) {
        fs.copyFileSync(pwd(tsx, file), pwd(outDir, file));
      }
    });
  }
  // 如果包含 outLib，则拷贝tsx文件夹到outLib
  if (tsx && outLib) {
    makeAndClearDir(pwd(outLib));
    fs.copySync(pwd(tsx), pwd(outLib));
  }
  const options = {
    // mangle: {
    //   properties: true,
    // },
    // nameCache: JSON.parse(fs.readFileSync(cacheFileName, 'utf8')),
  };

  dirs.forEach((dir) => {
    const dirFiles = fs.readdirSync(pwd(dir));
    dirFiles.forEach((file) => {
      // 只编译js, 忽略map
      if (
        file.indexOf('.js') > 0 &&
        file.indexOf('.map') < 0 &&
        file.indexOf('.json') < 0 &&
        file.indexOf('.jsx') < 0
      ) {
        console.log('--------- uglify: ', file);
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

  if (copy) {
    copyDir = copyDir || outDir;
    copy.forEach((file) => {
      console.log('--------- copy: ', file);
      fs.copyFileSync(pwd(file), pwd(copyDir, file));
    });
  }
}

if (outDir) {
  makeAndClearDir(pwd(outDir));
}

if (onlyUglifty) {
  uglifyFn();
} else if (tsx && outDir) {
  const files = fs.readdirSync(pwd(tsx));
  let tsxAllPaths = '';
  files.forEach((v) => {
    if ((v.indexOf('.ts') > -1 || v.indexOf('.tsx') > -1) && v.indexOf('.d.ts') < 0) {
      tsxAllPaths += ' ' + pwd(tsx, v);
    }
  });

  let str;

  if (lib === 'default') {
    str = `npx tsc${tsxAllPaths} --outDir ${outDir} --jsx ${jsx} -d true -t ${t} --skipLibCheck true ${other}`;
    console.log(
      `npx tsc ${tsx}/*.(ts|tsx) --outDir ${outDir} --jsx ${jsx} -d true -t ${t} --skipLibCheck true ${other}`,
    );
  } else {
    str = `npx tsc${tsxAllPaths} --outDir ${outDir} --jsx ${jsx} -d true -t ${t} --skipLibCheck true --lib ${lib} ${other}`;
    console.log(
      `npx tsc ${tsx}/*.(ts|tsx) --outDir ${outDir} --jsx ${jsx} -d true -t ${t} --skipLibCheck true --lib ${lib} ${other}`,
    );
  }

  exec(str, function(error, stdout, stderr) {
    console.log(stdout);
    uglifyFn();
  });
}
