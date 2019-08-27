import resolve from 'rollup-plugin-node-resolve';
import { uglify } from 'rollup-plugin-uglify';
import sourcemaps from 'rollup-plugin-sourcemaps';


export default {
    input : 'lib/index.js',
    external : "@type-r/models",

    output : {
        file   : 'dist/index.js',
        format : 'umd',
        name : 'NestedExtTypes',
        sourcemap: true,
        globals : {
            "@type-r/models":"Nested"
        }
    },
    plugins: [
        resolve(), //for support of `import X from "directory"` rather than verbose `import X from "directory/index"`
        sourcemaps(),
        uglify()
    ],
};