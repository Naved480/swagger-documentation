// Spec comes from openapi.spec.js (see npm run docs:openapi). Using `spec` avoids fetch(), which browsers block on file://.
(function () {
  var spec = window.__TOYBOX_OPENAPI__;
  var ui = {
    dom_id: "#swagger-ui",
    deepLinking: true,
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
    layout: "StandaloneLayout",
  };
  if (spec) {
    ui.spec = spec;
  } else {
    ui.url = new URL("openapi.json", window.location.href).href;
  }
  window.ui = SwaggerUIBundle(ui);
})();
