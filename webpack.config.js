const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: [
        './src/index.jsx'
    ],
    output: {
        path: path.join(__dirname, 'public'),
        filename: './bundle.js'
    },
    module: {
        loaders: [{
            exclude: /(node_modules|bower_components|config)/,
            loader: 'babel',
            query: {
                presets: ['react', 'es2015', 'stage-1']
            },
            test: /\.jsx?$/
        }]
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    devServer: {
        historyApiFallback: true,
        contentBase: './public',
        inline: true
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify("staging")
            }
        })
    ]
};
