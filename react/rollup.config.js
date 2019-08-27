import resolve from 'rollup-plugin-node-resolve';
import { uglify } from 'rollup-plugin-uglify';
import sourcemaps from 'rollup-plugin-sourcemaps';

export default {
    input : 'lib/index.js',

    external : ["@type-r/models", "react"],

    output : {
        file   : 'dist/index.js',
        format : 'umd',
        name   : 'Nested',
        sourcemap: true,
        globals : {
            "@type-r/models":"Nested",
            "react" : "React"
        }
    },
    plugins: [
        resolve(), //for support of `import X from "directory"` rather than verbose `import X from "directory/index"`
        uglify(),
        sourcemaps()
    ]
};