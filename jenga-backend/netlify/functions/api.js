const express = require("express");
const serverless = require("serverless-http");
const app = require("../../app");

const api = express();

// Prefix all routes with /api to match Netlify redirect rules
api.use("/api", app);

module.exports.handler = serverless(api);
