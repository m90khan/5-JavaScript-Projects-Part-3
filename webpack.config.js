const path = require('path');
//- to determine which npm script ran dev or build
const currentTask = process.env.npm_lifecycle_event;
//- for deleting the file on load so to download fresh copy
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
//- extracting css from the bundled js file
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
//- to add the generated css and js files to HTml file
const HtmlWebpackPlugin = require('html-webpack-plugin');
//- for handling multiple html files, ideal would be <10, if not using static site generator
const fse = require('fs-extra');

//- post css plugins
const postCSSPlugins = [require('autoprefixer')];

let cssConfig = {
  test: /\.scss$/i,
  use: [
    // Step3: Creates `style` nodes from JS strings
    // "style-loader",
    // Ste2: Translates CSS into CommonJS
    'css-loader',
    // Step: 1Compiles Sass to CSS
    'sass-loader',
    { loader: 'postcss-loader', options: { plugins: postCSSPlugins } },
  ],
};

// - search and get the array of files ends with html . loop over the array
// - using map and create new instance to get  each file
let pages = fse
  .readdirSync('./app')
  .filter(function (file) {
    return file.endsWith('.html');
  })
  .map(function (page) {
    return new HtmlWebpackPlugin({
      filename: page,
      template: `./app/${page}`, // points twoards current looped file
    });
  });
// -  to get the images after build
class RunAfterCompile {
  apply(compiler) {
    compiler.hooks.done.tap('Copy images', function () {
      fse.copySync('./app/assets/images', './docs/assets/images');
    });
  }
}
// ----------------------------------------
// * common configs
let config = {
  entry: './app/assets/scripts/APP.js',
  plugins: pages,
  module: {
    rules: [
      //- condition for mini-css-extract to only use for build task
      cssConfig,

      // ** to include React

      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-react',
              [
                '@babel/preset-env',
                {
                  targets: {
                    esmodules: true,
                  },
                },
              ],
            ],
            plugins: ['@babel/plugin-proposal-class-properties'],
          },
        },
      },
    ],
  },
};

//run tasks for dev and build
if (currentTask == 'dev-server') {
  //to add the style-loader during development
  cssConfig.use.unshift('style-loader');
  //name of the bundles js file in development
  config.output = {
    filename: 'bundled.js',
    path: path.resolve(__dirname, 'app'),
  };
  config.devServer = {
    before: function (app, server) {
      server._watch('./app/**/*.html');
    },
    contentBase: path.join(__dirname, 'app'),
    hot: true,
    port: 3010,
    host: '0.0.0.0',
  };
  config.mode = 'development';
}
if (currentTask == 'build') {
  // to handle broswer support of js files
  // ** for plain js

  // config.module.rules.push({
  //   test: /\.js$/,
  //   exclude: /(node_modules)/,
  //   use: {
  //     loader: "babel-loader",
  //     options: {
  //       presets: ["@babel/preset-env"],
  //     },
  //   },
  // });

  // to extract css from the bundled js file after builld process
  cssConfig.use.unshift(MiniCssExtractPlugin.loader);
  // css nano : to minify the generated css in the build
  postCSSPlugins.push(require('cssnano'));

  // seperate js files instead of single file

  config.output = {
    filename: '[name].[chunkhash].js',
    chunkFilename: '[name].[chunkhash].js',
    path: path.resolve(__dirname, 'docs'),
  };
  config.mode = 'production';
  // run less tasks , caching , vendor code seperation, chunking, only download data that changed
  config.optimization = {
    splitChunks: { chunks: 'all' },
  };
  config.plugins.push(
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({ filename: 'styles.[chunkhash].css' }),
    new RunAfterCompile()
  );
}

module.exports = config;
