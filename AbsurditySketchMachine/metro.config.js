// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Sanitize the input path for Windows (force forward slashes)
const inputPath = './global.css'.replace(/\\/g, '/');

module.exports = withNativeWind(config, { input: inputPath });
// module.exports = config;
