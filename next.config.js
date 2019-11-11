const path = require('path');
// const { parsed: localEnv } = require('dotenv').config();
const Dotenv = require('dotenv-webpack');
// const webpack = require('webpack');
const withLess = require('@zeit/next-less');

// fix: prevents error when .less files are required by node
if (typeof require !== 'undefined') {
    require.extensions['.less'] = file => {}
}

const assertPrefix = process.env.NODE_ENV === 'production' ? '/dist/next' : '';
module.exports = withLess({
    assertPrefix,
    webpack(config) {
        //to replace the env variable
        config.plugins.push(new Dotenv());
        config.module.rules.push({
            test: /\.js$/,
            enforce: 'pre',
            exclude: /node-modules/,
            loader: 'eslint-loader',
            options: {
                //Eslint errors are shown in dev
                emitWarning: true,
                configFile: path.resolve('.eslintrc'),
                eslint: {
                    configFile: path.resolve(__dirname, '.eslintrc'),
                }
            }
        });

        config.module.rules.push({
            test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
            use: {
                loader: 'url-loader',
                options: {
                    limit: 100000
                }
            }
        });
        // Do not run type checking twice:
        //if (options.isServer) config.plugins.push(new ForkTsCheckerWebpackPlugin());
        config.resolve.modules.unshift(__dirname);

        return config
    },
    cssModules: false,
    lessLoaderOptions: {
        javascriptEnabled: true
        // modifyVars: {
        //     //these variables are used to replace the path
        //    // '@foth-path': `${assertPrefix}/static`
        // }
    }
});