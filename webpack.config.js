module.exports = {
    entry: [
        './public/index.jsx'
    ],
    output: {
        path: __dirname,
        publicPath: './public',
        filename: './public/bundle.js'
    },
    module: {
        loaders: [{
            exclude: /(node_modules|bower_components)/,
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
        contentBase: './public/'
    }
};
