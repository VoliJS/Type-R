var webpack = require( 'webpack' ),
    path = require( 'path' );

var config = {
    entry  : {
        app : './js/main.jsx'
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
                        loader: "css-loader",
                        options: {
                            modules: true
                        }
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