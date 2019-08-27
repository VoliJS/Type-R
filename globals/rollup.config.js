import resolve from 'rollup-plugin-node-resolve';
import { uglify } from 'rollup-plugin-uglify';
import sourcemaps from 'rollup-plugin-sourcemaps';

export default {
    input : 'lib/index.js',
    // FIXME: need to build UMD bundle properly so ext-types will be included.
    external : ["@type-r/models", "@type-r/ext-types"],

    output : {
        file   : 'dist/index.js',
        format : 'umd',
        sourcemap: true,
        globals : {
            "@type-r/models":"Nested",
            "@type-r/ext-types": "NestedExtTypes"
        }
    },
    plugins: [
        resolve(), //for support of `import X from "directory"` rather than verbose `import X from "directory/index"`
        sourcemaps(),
        uglify()
    ],
};