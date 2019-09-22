## tscu

> tscu = `tsc` + `uglify`

To publish a library with typescript more easily

## Need dependencies

Project need typescript dependencies

## Example:

Build tsx and uglify-js, and copy css files:

```sh
npx tscu example/src/lib --outDir ./es --outLib ./lib --copy 'package.json, README.md'
```

Only uglify-js dir:

```sh
npx tscu -c ./es
# or
npx tscu src/barm --outDir es-barm -t es5
# or
npx tscu src/barm --outDir es-barm --no-clear
```
