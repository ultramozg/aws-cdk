import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import * as path from "path";
import { NodejsFunction, SourceMapMode } from "aws-cdk-lib/aws-lambda-nodejs";
import { Rule, Schedule } from "aws-cdk-lib/aws-events";
import { Architecture, Runtime } from "aws-cdk-lib/aws-lambda";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";

export interface IGettingStartedStackProps extends StackProps {
  logLevel: string;
}

export class GettingStartedStack extends Stack {
  constructor(scope: Construct, id: string, props: IGettingStartedStackProps) {
    super(scope, id, props);

    const rule = this.createEventBridgeSchedule();

    const lambdaFunction = this.createNotificationLambdaFunction();

    rule.addTarget(new LambdaFunction(lambdaFunction));
  }

  private createEventBridgeSchedule() {
    return new Rule(this, "BrushYourTeethSchedule", {
      schedule: Schedule.cron({
        minute: "*",
        hour: "6",
        day: "*",
        month: "*",
        year: "*",
      }),
    });
  }

  private createNotificationLambdaFunction() {
    const lambdaFunction = new NodejsFunction(this, "BrushYourTeethFunction", {
      entry: path.join(__dirname, "lambdas", "brush-your-teeth", "index.ts"),
      handler: "handler",
      runtime: Runtime.NODEJS_20_X,
      architecture: Architecture.ARM_64,
      timeout: Duration.seconds(5),
      bundling: {
        minify: true,
        sourceMap: true,
        sourceMapMode: SourceMapMode.INLINE,
        externalModules: ["@aws-sdk/*"],
      },
    });

    lambdaFunction.addToRolePolicy(
      new PolicyStatement({
        sid: "AllowSendingEmail",
        effect: Effect.ALLOW,
        actions: ["ses:SendEmail"],
        resources: ["*"],
      }),
    );

    return lambdaFunction;
  }
}
