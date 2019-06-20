## tscu

> tscu = tsc + uglify-js

### example:

Build tsx and uglify-js, and copy css files:

```sh
npx tscu example/src/lib --outDir ./es
```

Only uglify-js dir:

```sh
npx tscu -c ./es
```
