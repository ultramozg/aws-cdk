import { Construct } from "constructs";
import {
  AppProtocol,
  Cluster,
  ContainerImage,
  CpuArchitecture,
  FargateService,
  FargateTaskDefinition,
  LinuxParameters,
  LogDriver,
  Protocol,
  TaskDefinition,
} from "aws-cdk-lib/aws-ecs";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { DockerImageAsset } from "aws-cdk-lib/aws-ecr-assets";
import {Peer, Port, SecurityGroup, Vpc} from "aws-cdk-lib/aws-ec2";
import { PrivateDnsNamespace } from "aws-cdk-lib/aws-servicediscovery";

export interface IServiceConstructProps {
  serviceName: string;
  containerPath: string;
}

export class ServiceConstruct extends Construct {
  constructor(scope: Construct, id: string, props: IServiceConstructProps) {
    super(scope, id);

    const taskDefinition = this.createTaskDefinition(props.containerPath);

    this.createService(taskDefinition, props.serviceName);
  }

  private createTaskDefinition(containerPath: string): TaskDefinition {
    const taskDefinition = new FargateTaskDefinition(this, "TaskDefinition", {
      cpu: 256,
      memoryLimitMiB: 512,
      runtimePlatform: {
        cpuArchitecture: CpuArchitecture.ARM64,
      },
    });

    taskDefinition.addContainer("app", {
      image: ContainerImage.fromDockerImageAsset(
        new DockerImageAsset(this, "Image", {
          directory: containerPath,
        }),
      ),
      linuxParameters: new LinuxParameters(this, "LinuxParameters", {
        initProcessEnabled: true,
      }),
      logging: LogDriver.awsLogs({
        streamPrefix: "ecs",
      }),
      portMappings: [
        {
          containerPort: 3000,
          name: "app",
          protocol: Protocol.TCP,
          appProtocol: AppProtocol.http,
        },
      ],
    });

    return taskDefinition;
  }

  private createService(taskDefinition: TaskDefinition, serviceName: string) {
    const clusterName = StringParameter.valueFromLookup(
      this,
      "/ping-pong/cluster/name",
    );

    // Until the context lookup has been completed for the first time, we have
    // dummy value we can't use in the Cluster.fromClusterAttributes method.
    if (clusterName.startsWith("dummy-value")) {
      return;
    }

    const vpc = Vpc.fromLookup(this, "VPC", {
      tags: {
        project: "ping-pong",
      },
    })

    const cluster = Cluster.fromClusterAttributes(this, "Cluster", {
      clusterName,
      vpc,
    });

    const serviceSecurityGroup = new SecurityGroup(this, "ServiceSecurityGroup", {
      vpc,
      allowAllOutbound: true,
    })

    serviceSecurityGroup.addIngressRule(Peer.ipv4(vpc.vpcCidrBlock), Port.tcpRange(3000, 3000), "Allow service API traffic.")

    new FargateService(this, "Service", {
      cluster,
      taskDefinition,
      cloudMapOptions: {
        name: serviceName,
        cloudMapNamespace:
          PrivateDnsNamespace.fromPrivateDnsNamespaceAttributes(
            this,
            "PrivateDNSNamespace",
            {
              namespaceId: StringParameter.valueFromLookup(
                this,
                "/ping-pong/cloud-map-namespace/id",
              ),
              namespaceArn: "unused",
              namespaceName: "unused",
            },
          ),
      },
      securityGroups: [serviceSecurityGroup],
    });
  }
}
