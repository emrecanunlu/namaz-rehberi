const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Ada modeli (scripts/island/build_island.py)
config.resolver.assetExts.push("glb");

// three 0.186+ CJS girişi Node'a özgü process.emitWarning çağırıyor (RN'de yok);
// her zaman ESM build'ine yönlendir
const threeModule = path.join(__dirname, "node_modules/three/build/three.module.js");
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "three") {
    return { type: "sourceFile", filePath: threeModule };
  }
  return (defaultResolveRequest ?? context.resolveRequest)(context, moduleName, platform);
};

config.transformer.getTransformOptions = async () => ({
  transform: {
    inlineRequires: true,
  },
});

module.exports = withNativeWind(config, { input: "./global.css" });
