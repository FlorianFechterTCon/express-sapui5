"use strict";

const proxy = require("http-proxy-middleware");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const noCache = require("nocache");

let serveUi5 = function(oSettings, app) {
  var oNeoApp = oSettings.neoApp,
    oDestinations = oSettings.destinations,
    oManifest = oSettings.manifest,
    oAgent = oSettings.agent;

  let cdn = oSettings.cdn || "https://ui5.sap.com";

  const homePage =
    oSettings.version + "/test-resources/sap/ushell/shells/sandbox/fioriSandbox.html";
  // redirect to FLP
  app.get("/", async (req, res) => {
    res.redirect(homePage);
  });
  
  // proxy ui5 to cdn
  app.use("/" + oSettings.version + "/test-resources", proxy({
    target: cdn,
    changeOrigin: true
  }));
  app.use("/" + oSettings.version + "/resources/", proxy({
    target: cdn,
    changeOrigin: true
  }));

  // no odata cache (including metadata)
  app.use("/sap/opu", noCache());

  if (oNeoApp && oNeoApp.routes) {
    oNeoApp.routes.forEach(function(oRoute) {
      var oTarget = oRoute.target;
      if (oTarget && !(oRoute.path.startsWith("/resources") || oRoute.path.startsWith("/test-resources"))) {
        // proxy options
        var oOptions = {};

        // search for destination
        if (oDestinations && oTarget.name) {
          var oDestination = oDestinations[oTarget.name];
          if (oDestination) {
            oOptions.target = oDestination.target;
            oOptions.changeOrigin = true;
            oOptions.secure = false;
            if (oDestination.useProxy) {
              oOptions.agent = oAgent;
            }

            let sVersion = oSettings.version || oTarget.version;

            if (oTarget.name === "sapui5" && sVersion) {
              oOptions.target = oOptions.target + "/" + sVersion;
            }
          }
        }

        if (oRoute.path && oTarget.entryPath) {
          var oRouteNew = {};
          var sPathOld = "^" + oRoute.path;
          oRouteNew[sPathOld] = oTarget.entryPath;
          oOptions.pathRewrite = oRouteNew;
        }

        app.use(oRoute.path, proxy(oOptions));
      }
    });
  }

  return app;
};

let bInitialized;

module.exports = oSettings => (req, res, next) => {
  if (!bInitialized) {
    bInitialized = true;
    serveUi5(oSettings, req.app);
  }
  next();
};
