const path = require('path')

module.exports = [
  {
    entry: './src/content/index.ts',
    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, 'build'),
    },
    devtool: 'inline-source-map',
    mode: 'production',
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
              },
            },
          ],
          exclude: [/node_modules/, path.resolve('src/bg')],
        },
      ],
    },
    plugins: [],
    resolve: {
      extensions: ['.ts', '.js'],
    },
  },
]
