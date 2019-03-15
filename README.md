# SAPUI5 express middleware

This middleware plugin is created for fast UI5 development and testing

This is a node.js implementation of path routing based on neo-app.json

Also it provides sandbox Fiori launchpad which loads its UI5 resources over a localhost proxy from CDN.

# Proxy
To include also local custom ui5 libraries, the complete traffic is routed over localhost via proxy to cdn. Only the requests for the custom libraries will be handled localy.

You can find an example of using it here:
https://github.com/ThePlenkov/express-fiori-ws
