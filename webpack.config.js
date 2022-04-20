/*
So as of recent versions of GraphiQL or codemirror (or both), one of those has started using dynamic imports
which don't work by default in Grafana plugins. This fixes that. See this issue: https://github.com/grafana/grafana/issues/40671
 */
const pluginJson = require('./src/plugin.json');
module.exports.getWebpackConfig = (config, options) => ({
  ...config,
  output: {
    ...config.output,
    publicPath: `public/plugins/${pluginJson.id}/`,
  },
});
