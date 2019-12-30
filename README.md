# chrome-extension-typescript-boilerplate

Basic boilerplate to get you started on your next chrome extension, with TypeScript integrated!

## Features

- ESLint / TypeScript integrated (`@typescript-eslint/parser` and `@typescript-eslint/eslint-plugin`)
- `build` script which does all of the following, in order:
  1. Removes the previous `./build` directory if existent
  2. Bundles the [content scripts](https://developer.chrome.com/extensions/content_scripts) code and outputs to `./build/index.js`
  3. Bundles the [background scripts](https://developer.chrome.com/extensions/background_pages) code and outputs to `./build/background.js`
  4. Moves the contents of `public` to `build`
- Prettier
- Content scripts are isolated away from the background scripts so you can focus on developing one or the other separately

## Configuration

### VSCode

Inside the root folder there will be a `.vscode/snippets/` folder with the files `javascript.json` and `typescript.json`. There are predefined snippets for convenience (you will need to install the [Project Snippets](https://marketplace.visualstudio.com/items?itemName=rebornix.project-snippets) extension to automatically enable them).

There is also workspace configuration settings for typescript and eslint in `.vscode/settings.json` as shown below to make the most of this boilerplate:

```json
{
  "eslint.enable": true,
  "git.ignoreLimitWarning": true,
  "eslint.format.enable": true,
  "javascript.implicitProjectConfig.checkJs": true,
  "javascript.format.semicolons": "remove",
  "typescript.format.enable": true,
  "typescript.check.npmIsInstalled": false,
  "typescript.disableAutomaticTypeAcquisition": false,
  "typescript.suggest.enabled": true,
  "typescript.validate.enable": true
}
```

## Webpack

To configure webpack for your content script files use `webpack.content.config.js`. To configure webpack for your background script files use `webpack.bg.config.js`.

## Development

Keep `src/bg` separate from `src/content` as they will be used separately by webpack to bundle your content/background script code.

## Build

To build your project just run `npm run build` and once it's finished, open up your chrome browser and type in `chrome:extensions` in the address bar. Click _Load Unpacked_ and select your `build` directory. It should work afterwards.

## Usage

Clone this project and run `npm install`