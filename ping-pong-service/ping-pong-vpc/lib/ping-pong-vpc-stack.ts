import { Stack, StackProps, Tags } from "aws-cdk-lib";
import { Construct } from "constructs";
import { IpAddresses, Vpc } from "aws-cdk-lib/aws-ec2";
import { Cluster } from "aws-cdk-lib/aws-ecs";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { NamespaceType } from "aws-cdk-lib/aws-servicediscovery";

export class PingPongVpcStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const vpc = new Vpc(this, "VPC", {
      ipAddresses: IpAddresses.cidr("10.0.0.0/16"),
      enableDnsHostnames: true,
      enableDnsSupport: true,
      maxAzs: 3,
    });

    Tags.of(vpc).add("project", "ping-pong");

    const cluster = new Cluster(this, "Cluster", {
      vpc,
    });

    cluster.addDefaultCloudMapNamespace({
      name: "cdk-course.cloud",
      type: NamespaceType.DNS_PRIVATE,
      vpc,
    });

    new StringParameter(this, "ClusterArn", {
      parameterName: "/ping-pong/cluster/arn",
      stringValue: cluster.clusterArn,
    });

    new StringParameter(this, "ClusterName", {
      parameterName: "/ping-pong/cluster/name",
      stringValue: cluster.clusterName,
    });

    new StringParameter(this, "CloudMapNamespaceId", {
      parameterName: "/ping-pong/cloud-map-namespace/id",
      stringValue: cluster.defaultCloudMapNamespace!.namespaceId,
    });
  }
}
