const path = require('path')
module.exports = {
    entry: path.join(__dirname, 'src/js', 'index.js'), // Our frontend will be inside the src folder
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'build.js' // The final file will be created in dist/build.js
    },
    mode: "development",
    devtool: "source-map",
    module: {
        rules: [{
            test: /\.css$/, // To load the css in react
            use: ['style-loader', 'css-loader'],
            include: /src/
        }, {
            test: /\.jsx?$/, // To load the js and jsx files
            use: [{
                loader: 'babel-loader',
                options: {
                    presets: ['env', 'react', 'stage-2']
                }
            }],
            exclude: /node_modules/
        }]
    }
}