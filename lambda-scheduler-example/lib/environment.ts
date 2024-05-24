import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { ARecord, HostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";

export interface IEnvironmentStack extends StackProps {
  hostname: string;
}

export class EnvironmentStack extends Stack {
  constructor(scope: Construct, id: string, props: IEnvironmentStack) {
    super(scope, id, props);

    const hostedZone = HostedZone.fromLookup(this, "CDKCourseZone", {
      domainName: "cdk-course.jsherz.com",
    });

    new ARecord(this, "Homepage", {
      zone: hostedZone,
      recordName: props.hostname,
      ttl: Duration.hours(1),
      target: RecordTarget.fromIpAddresses("10.0.0.1"),
    });
  }
}
