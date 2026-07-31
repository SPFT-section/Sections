const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const pkg = require('./package.json');

// Derive a sensible default public path from package.json homepage when possible.
const homepagePath = (() => {
  if (!pkg || !pkg.homepage) return '/stq-app/';
  try {
    // If homepage is a full URL, extract the pathname (e.g. /owner/repo/)
    const url = new URL(pkg.homepage, 'http://example.com');
    // Ensure pathname ends with a slash for GitHub Pages project sites
    return (url.pathname.endsWith('/') ? url.pathname : url.pathname + '/');
  } catch (e) {
    // If homepage is already a path (or invalid URL), use it directly.
    return pkg.homepage.endsWith('/') ? pkg.homepage : pkg.homepage + '/';
  }
})();

module.exports = (env, argv) => {
  const isProduction = argv && argv.mode === 'production';

  return {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? 'js/[name].[contenthash].js' : 'js/[name].js',
      chunkFilename: isProduction ? 'js/[name].[contenthash].chunk.js' : 'js/[name].chunk.js',
      clean: true,
      // GitHub Pages project sites are served from /<repo-name>/, not the domain root.
      // Override with PUBLIC_PATH env var if deploying elsewhere (e.g. a custom domain or Netlify/Vercel root).
      publicPath: isProduction ? (process.env.PUBLIC_PATH || homepagePath) : '/',
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react']
            }
          }
        },
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader'
          ]
        },
        {
          test: /\.svg$/,
          type: 'asset/resource',
          generator: {
            filename: 'images/[name].[hash][ext]'
          }
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.jsx'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@pages': path.resolve(__dirname, 'src/pages'),
        '@hooks': path.resolve(__dirname, 'src/hooks'),
        '@store': path.resolve(__dirname, 'src/store'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@config': path.resolve(__dirname, 'src/config'),
        '@assets': path.resolve(__dirname, 'src/assets')
      }
    },
    plugins: [
      new CleanWebpackPlugin(),
      // Expose the deployment sub-path to client code (used as BrowserRouter's basename)
      new webpack.DefinePlugin({
        'process.env.PUBLIC_PATH': JSON.stringify(
          isProduction ? (process.env.PUBLIC_PATH || homepagePath) : '/'
        ),
      }),
      new HtmlWebpackPlugin({
        template: './public/index.html',
        filename: 'index.html',
        // Resolve favicon path explicitly so HtmlWebpackPlugin can read it reliably.
        favicon: path.resolve(__dirname, 'public', 'logo.png'),
        inject: true, // ✅ เพิ่มบรรทัดนี้
        minify: isProduction ? {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        } : false,
      }),
      isProduction && new MiniCssExtractPlugin({
        filename: 'css/[name].[contenthash].css',
        chunkFilename: 'css/[name].[contenthash].chunk.css',
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'public',
            to: '.',
            globOptions: {
              ignore: ['**/index.html'],
            },
            noErrorOnMissing: true,
          },
        ],
      }),
    ].filter(Boolean),
    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: isProduction,
              drop_debugger: isProduction,
            },
          },
          extractComments: false,
        }),
        new CssMinimizerPlugin(),
      ],
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      },
      runtimeChunk: {
        name: 'runtime',
      },
    },
    devServer: {
      static: {
        directory: path.join(__dirname, 'public'),
      },
      compress: true,
      port: 3000,
      hot: true,
      historyApiFallback: true,
      open: true,
    },
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    performance: {
      hints: isProduction ? 'warning' : false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    },
    cache: {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
    },
  };
};
