#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { GettingStartedStack } from "../lib/getting-started-stack";

const app = new cdk.App();
new GettingStartedStack(app, "GettingStartedStack", {
  logLevel: "info",
});
