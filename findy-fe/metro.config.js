const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

function stripTrailingSlash(url) {
  return url.replace(/\/$/, "");
}

/** 웹 개발 시 same-origin 프록시 (CORS 우회, Authorization 전달) */
const API_PROXIES = [
  {
    prefix: "/user-api",
    target: stripTrailingSlash(
      process.env.EXPO_PUBLIC_USER_API_URL || "http://192.168.0.32:8889",
    ),
  },
  {
    prefix: "/shopping-api",
    target: stripTrailingSlash(
      process.env.EXPO_PUBLIC_SHOPPING_API_URL || "http://192.168.0.32:8887",
    ),
  },
  {
    prefix: "/recommendation-api",
    target: stripTrailingSlash(
      process.env.EXPO_PUBLIC_RECOMMENDATION_API_URL ||
        "http://192.168.0.32:8886",
    ),
  },
];

function buildProxyHeaders(req) {
  const headers = {
    Accept: req.headers.accept || "application/json",
  };
  if (req.headers.authorization) {
    headers.Authorization = req.headers.authorization;
  }
  const contentType = req.headers["content-type"];
  if (contentType && req.method !== "GET" && req.method !== "HEAD") {
    headers["Content-Type"] = contentType;
  }
  return headers;
}

const config = getDefaultConfig(__dirname);

config.server = {
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      const route = API_PROXIES.find((entry) => req.url?.startsWith(entry.prefix));
      if (!route) {
        return middleware(req, res, next);
      }

      const pathAndQuery = req.url.replace(route.prefix, "") || "/";
      const targetUrl = `${route.target}${pathAndQuery}`;
      const chunks = [];

      req.on("data", (chunk) => chunks.push(chunk));
      req.on("end", () => {
        void (async () => {
          try {
            const body =
              req.method === "GET" || req.method === "HEAD"
                ? undefined
                : Buffer.concat(chunks);
            const proxyRes = await fetch(targetUrl, {
              method: req.method,
              headers: buildProxyHeaders(req),
              body,
            });
            res.statusCode = proxyRes.status;
            const text = await proxyRes.text();
            const contentType = proxyRes.headers.get("content-type");
            if (contentType) {
              res.setHeader("content-type", contentType);
            }
            res.end(text);
          } catch {
            res.statusCode = 502;
            res.end("API proxy error");
          }
        })();
      });
    };
  },
};

const { transformer, resolver } = config;

config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer/expo"),
};

config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
  sourceExts: [...resolver.sourceExts, "svg"],
};

module.exports = withNativeWind(config, { input: "./global.css" });
