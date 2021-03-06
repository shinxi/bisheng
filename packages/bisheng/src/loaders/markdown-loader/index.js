

const path = require('path');
const loaderUtils = require('loader-utils');
const getBishengConfig = require('../../utils/get-bisheng-config');
const getThemeConfig = require('../../utils/get-theme-config');
const resolvePlugins = require('../../utils/resolve-plugins');
const markdownData = require('../../utils/markdown-data');
const stringify = require('../../utils/stringify');
const boss = require('./boss');

module.exports = function markdownLoader(content) {
  if (this.cacheable) {
    this.cacheable();
  }
  const webpackRemainingChain = loaderUtils.getRemainingRequest(this).split('!');
  const fullPath = webpackRemainingChain[webpackRemainingChain.length - 1];
  const filename = path.relative(process.cwd(), fullPath);

  const query = loaderUtils.parseQuery(this.query);
  const bishengConfig = getBishengConfig(query.config);
  const themeConfig = getThemeConfig(bishengConfig.theme);
  const plugins = resolvePlugins(themeConfig.plugins, 'node');

  const callback = this.async();
  if (!callback) {
    const parsedMarkdown = markdownData
            .process(filename, content, plugins, query.isBuild);
    return `module.exports = ${stringify(parsedMarkdown)};`;
  }

  boss.queue({
    filename,
    content,
    plugins,
    isBuild: query.isBuild,
    callback,
  });
};
