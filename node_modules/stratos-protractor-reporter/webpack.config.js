
let libraryName = 'ScreenshotReporter';

module.exports = {
    entry: ['babel-polyfill', './app/reporter.js'],
    target: 'node',
    node: {
        __dirname: false,
        __filename: false,
    },

    output: {
        filename: 'index.js',
        library: libraryName,
        libraryTarget: 'commonjs-module',
        umdNamedDefine: true
    },

    module: {
        loaders: [
            {
                test: /reporter\.js?$/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015', "stage-0"],
                    plugins: ['babel-plugin-add-module-exports']
                },
                exclude: /node_modules/
            }
        ]
    }
};