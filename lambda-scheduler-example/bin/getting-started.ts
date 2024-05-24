#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { EnvironmentStack } from "../lib/environment";
import { GettingStartedStack } from "../lib/getting-started-stack";

const app = new cdk.App();

const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION;

if (!account || !region) {
  throw new Error(
    "You must specify a CDK_DEFAULT_ACCOUNT and CDK_DEFAULT_REGION.",
  );
}

const logLevel =
  app.node.tryGetContext(`@local/logLevel/${account}/${region}`) ||
  "debug";

const environment = app.node.tryGetContext("@local/environment")[account][
  region
];

new GettingStartedStack(app, "GettingStartedStack", {
  env: {
    account,
    region,
  },
  logLevel,
  environment,
});
