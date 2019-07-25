var webpack = require( 'webpack' ),
    path = require( 'path' );

var config = {
    entry  : {
        app : './src/index.jsx'
    },

    output : {
        // export itself to a global var
        path       : __dirname + '/dist',
        publicPath : '/dist/',
        filename   : '[name].js'
    },

    devtool : 'source-map',

    resolve : {
        modules : [ 'node_modules', 'src' ],
        // alias : { //use `npm run deploy:examples` in main project
        //     'react-mvx' : path.resolve(__dirname, '../..' )
        // }
    },

    module : {
        rules : [
            {
                test : /\.css$/,
                use : [
                    {
                        loader: "style-loader"
                    },
                    {
                        loader: "css-loader"
                    }
                ]
            },
            {
                test    : /\.jsx?$/,
                exclude : /(node_modules|lib)/,
                loader  : 'babel-loader'
            },
            {
                test: /\.js$/,
                use: ["source-map-loader"],
                enforce: "pre"
            }
        ]
    }
};

module.exports = config;