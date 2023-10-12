const express = require("express");
const os = require("os");
const fs = require("fs");
const path = require("path");
const promClient = require('prom-client');
const promBundle = require("express-prom-bundle");

const app = express();
const port = process.env.port ?? 8080;
const version = process.env.version ?? "none";
const successTreshold = 0.95;

const customClient = new promClient.Gauge({
  name: "custom_success_rate",
  help: "decimal success rate precentage 1 = 100%, 0.3 = 30%",
  labelNames: ["version", "hostname"]
});

setDefaultSuccessrate(customClient, successTreshold);

const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  includeStatusCode: true,
  includeUp: true,
  customLabels: {
    project_name: "hello_world",
    project_type: "test_metrics_labels"
  },
  promClient: {
    collectDefaultMetrics: {}
  },
});

// add the prometheus middleware to all routes
app.use(metricsMiddleware);

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  const htmlTemplate = fs.readFileSync("index.html", "utf8");
  res.send(htmlTemplate);
});

app.get("/hostname", (req, res) => {
  const hostname = os.hostname();
  res.send(hostname);
});

app.get("/version", (req, res) => {
  res.send(version);
});

app.get("/set", (req, res) => {
  let rate = Number(req.query["value"]);
  if(isNaN(rate) || rate > 1 || rate < 0){
    res.status(400).send("invalid success_rate").end();
  } else {
    customClient.set({version: version, hostname: os.hostname()}, rate);
    res.send("new success_rate is " + rate);
  }
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

/**
 * Sets the custom successrate metric with a random value.
 * 
 * Based on the **successful** it decides if the number should be successful or not.
 * @param client metric client
 * @param {number} treshold treshold from which percentage the rate should be considered successful
 */
function setDefaultSuccessrate(client, treshold){
  let min = treshold;
  let max = 1;
  if(process.env.successful === "false"){
    max = min;
    min = 0;
  }
  const defaultSuccessRate = Math.trunc(10000 * (Math.random() * (max - min) + min)) / 10000;
  client.set({version: version, hostname: os.hostname()}, defaultSuccessRate);
}
