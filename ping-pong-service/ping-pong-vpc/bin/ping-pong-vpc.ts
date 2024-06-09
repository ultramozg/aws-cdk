#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { PingPongVpcStack } from "../lib/ping-pong-vpc-stack";

const app = new cdk.App();

const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION;

if (!account || !region) {
  throw new Error(
    "You must specify a CDK_DEFAULT_ACCOUNT and a CDK_DEFAULT_REGION.",
  );
}

new PingPongVpcStack(app, "PingPongVpcStack", {
  env: {
    account,
    region,
  },
});
