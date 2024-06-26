const express = require("express");
const os = require("os");
const fs = require("fs");
const path = require("path");
const promClient = require("prom-client");
const promBundle = require("express-prom-bundle");
const stringReplace = require("string-replace-middleware");
const nocache = require("nocache");

const app = express();
const port = process.env.PORT ?? 8080;
const version = process.env.VERSION ?? "none";
const successThreshold = Number.parseFloat(process.env.THRESHOLD) || 0.95;
const hostname = os.hostname();
let successRate = successThreshold;

const customClient = new promClient.Gauge({
  name: "custom_success_rate",
  help: "decimal success rate precentage 1 = 100%, 0.3 = 30%",
  labelNames: ["version", "hostname"],
});

const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  includeStatusCode: true,
  includeUp: true,
  promClient: {
    collectDefaultMetrics: {},
  },
});

setDefaultSuccessrateMetric(customClient, successThreshold);

app.set("etag", false);

app.use(nocache());

// add the prometheus middleware to all routes
app.use(metricsMiddleware);

app.use(
  stringReplace({
    "[hostname not found]": hostname,
  })
);

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  const htmlTemplate = fs.readFileSync("./pages/hostname.html", "utf8");
  res.send(htmlTemplate);
});

app.get("/successrate", (req, res) => {
  const htmlTemplate = fs.readFileSync("./pages/successrate.html", "utf8");
  res.send(htmlTemplate);
});

app.get("/version", (req, res) => {
  res.send(version);
});

// api endpoints
app.get("/api/successrate", (req, res) => {
  res.send({
    successRate: successRate,
    threshold: successThreshold,
  });
});

app.get("/set", (req, res) => {
  let rate = Number(req.query["value"]);
  if (isNaN(rate) || rate > 1 || rate < 0) {
    res.status(400).send("invalid success_rate").end();
  } else {
    successRate = rate;
    customClient.set({ version: version, hostname: hostname }, successRate);
    res.send("new success_rate is " + successRate);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

/**
 * Sets the custom successrate metric with a random value.
 *
 * Based on the **successful** it decides if the number should be successful or not.
 * @param client metric client
 * @param {number} threshold threshold from which percentage the rate should be considered successful
 */
function setDefaultSuccessrateMetric(client, threshold) {
  let min = threshold;
  let max = 1;
  if (process.env.successful === "false") {
    max = min;
    min = 0;
  }
  const defaultSuccessRate =
    Math.trunc(10000 * (Math.random() * (max - min) + min)) / 10000;
  successRate = defaultSuccessRate;
  client.set({ version: version, hostname: hostname }, defaultSuccessRate);
}
