import resolve from 'rollup-plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';
import commonjs from 'rollup-plugin-commonjs';
import paths from 'rollup-plugin-paths'

export default {
    input: 'lib/index.js',

    output : {
        file   : 'dist/index.js',
        format : 'umd'
    },
    external: ['encoding', 'iconv-lite'], //for fixing weird error: Unexpected token ../../node_modules/iconv-lite/encodings/tables/gb18030-ranges.jso

    plugins: [
        commonjs({
            namedExports: {
                chai: [ 'expect' ]
            }
        }),
        paths({
            "type-r" : "../../../lib/index.js"
        }),
        resolve(), //for support of `import X from "directory"` rather than verbose `import X from "directory/index"`
        sourcemaps()
    ],
    sourcemap: true
};