## tscu

> tscu = `tsc` + `uglify`

To publish a library with typescript more easily

## Need dependencies

Project need typescript dependencies

### #xample:

Build tsx and uglify-js, and copy css files:

```sh
npx tscu example/src/lib --outDir ./es
```

Only uglify-js dir:

```sh
npx tscu -c ./es
```
