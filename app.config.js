const fs = require("fs");
const path = require("path");
const appJson = require("./app.json");

function parseKeyValueFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  for (const rawLine of fs.readFileSync(filePath, "utf8").split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || !line.includes("=")) {
      continue;
    }

    const separator = line.indexOf("=");
    const key = line.slice(0, separator).trim();
    const value = line
      .slice(separator + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "");

    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

parseKeyValueFile(path.join(__dirname, ".env"));
parseKeyValueFile(path.join(__dirname, "android", "local.properties"));

function readMapsApiKeyFromConfig() {
  const configPath = path.join(__dirname, "utils", "config.ts");
  if (!fs.existsSync(configPath)) {
    return "";
  }
  const match = fs
    .readFileSync(configPath, "utf8")
    .match(/mapsApiKey:\s*"([^"]*)"/);
  return match?.[1] ?? "";
}

const googleMapsApiKey =
  process.env.GOOGLE_MAPS_API_KEY || readMapsApiKeyFromConfig();

const plugins = (appJson.expo.plugins ?? []).map((plugin) => {
  if (plugin === "react-native-maps") {
    return [
      "react-native-maps",
      {
        androidGoogleMapsApiKey: googleMapsApiKey,
      },
    ];
  }
  return plugin;
});

module.exports = {
  expo: {
    ...appJson.expo,
    android: {
      ...appJson.expo.android,
      config: {
        ...(appJson.expo.android?.config ?? {}),
        googleMaps: {
          apiKey: googleMapsApiKey,
        },
      },
    },
    extra: {
      ...(appJson.expo.extra ?? {}),
      googleMapsApiKey,
    },
    plugins,
  },
};
