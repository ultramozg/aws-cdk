import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";
import { ServiceConstruct } from "@cdk-course/ping-pong-service";

export class PongServiceStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    new ServiceConstruct(this, "Service", {
      containerPath: path.join(__dirname, "containers", "pong-service"),
      serviceName: "pong-service",
    });
  }
}
