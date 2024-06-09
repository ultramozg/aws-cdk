"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceConstruct = void 0;
const constructs_1 = require("constructs");
const aws_ecs_1 = require("aws-cdk-lib/aws-ecs");
const aws_ssm_1 = require("aws-cdk-lib/aws-ssm");
const aws_ecr_assets_1 = require("aws-cdk-lib/aws-ecr-assets");
const aws_ec2_1 = require("aws-cdk-lib/aws-ec2");
const aws_servicediscovery_1 = require("aws-cdk-lib/aws-servicediscovery");
class ServiceConstruct extends constructs_1.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        const taskDefinition = this.createTaskDefinition(props.containerPath);
        this.createService(taskDefinition, props.serviceName);
    }
    createTaskDefinition(containerPath) {
        const taskDefinition = new aws_ecs_1.FargateTaskDefinition(this, "TaskDefinition", {
            cpu: 256,
            memoryLimitMiB: 512,
            runtimePlatform: {
                cpuArchitecture: aws_ecs_1.CpuArchitecture.ARM64,
            },
        });
        taskDefinition.addContainer("app", {
            image: aws_ecs_1.ContainerImage.fromDockerImageAsset(new aws_ecr_assets_1.DockerImageAsset(this, "Image", {
                directory: containerPath,
            })),
            linuxParameters: new aws_ecs_1.LinuxParameters(this, "LinuxParameters", {
                initProcessEnabled: true,
            }),
            logging: aws_ecs_1.LogDriver.awsLogs({
                streamPrefix: "ecs",
            }),
            portMappings: [
                {
                    containerPort: 3000,
                    name: "app",
                    protocol: aws_ecs_1.Protocol.TCP,
                    appProtocol: aws_ecs_1.AppProtocol.http,
                },
            ],
        });
        return taskDefinition;
    }
    createService(taskDefinition, serviceName) {
        const clusterName = aws_ssm_1.StringParameter.valueFromLookup(this, "/ping-pong/cluster/name");
        // Until the context lookup has been completed for the first time, we have
        // dummy value we can't use in the Cluster.fromClusterAttributes method.
        if (clusterName.startsWith("dummy-value")) {
            return;
        }
        const vpc = aws_ec2_1.Vpc.fromLookup(this, "VPC", {
            tags: {
                project: "ping-pong",
            },
        });
        const cluster = aws_ecs_1.Cluster.fromClusterAttributes(this, "Cluster", {
            clusterName,
            vpc,
        });
        const serviceSecurityGroup = new aws_ec2_1.SecurityGroup(this, "ServiceSecurityGroup", {
            vpc,
            allowAllOutbound: true,
        });
        serviceSecurityGroup.addIngressRule(aws_ec2_1.Peer.ipv4(vpc.vpcCidrBlock), aws_ec2_1.Port.tcpRange(3000, 3000), "Allow service API traffic.");
        new aws_ecs_1.FargateService(this, "Service", {
            cluster,
            taskDefinition,
            cloudMapOptions: {
                name: serviceName,
                cloudMapNamespace: aws_servicediscovery_1.PrivateDnsNamespace.fromPrivateDnsNamespaceAttributes(this, "PrivateDNSNamespace", {
                    namespaceId: aws_ssm_1.StringParameter.valueFromLookup(this, "/ping-pong/cloud-map-namespace/id"),
                    namespaceArn: "unused",
                    namespaceName: "unused",
                }),
            },
            securityGroups: [serviceSecurityGroup],
        });
    }
}
exports.ServiceConstruct = ServiceConstruct;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS1jb25zdHJ1Y3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvc2VydmljZS1jb25zdHJ1Y3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkNBQXVDO0FBQ3ZDLGlEQVc2QjtBQUM3QixpREFBc0Q7QUFDdEQsK0RBQThEO0FBQzlELGlEQUFtRTtBQUNuRSwyRUFBdUU7QUFPdkUsTUFBYSxnQkFBaUIsU0FBUSxzQkFBUztJQUM3QyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQTZCO1FBQ3JFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFakIsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUV0RSxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWMsRUFBRSxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUVPLG9CQUFvQixDQUFDLGFBQXFCO1FBQ2hELE1BQU0sY0FBYyxHQUFHLElBQUksK0JBQXFCLENBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFO1lBQ3ZFLEdBQUcsRUFBRSxHQUFHO1lBQ1IsY0FBYyxFQUFFLEdBQUc7WUFDbkIsZUFBZSxFQUFFO2dCQUNmLGVBQWUsRUFBRSx5QkFBZSxDQUFDLEtBQUs7YUFDdkM7U0FDRixDQUFDLENBQUM7UUFFSCxjQUFjLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRTtZQUNqQyxLQUFLLEVBQUUsd0JBQWMsQ0FBQyxvQkFBb0IsQ0FDeEMsSUFBSSxpQ0FBZ0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFO2dCQUNsQyxTQUFTLEVBQUUsYUFBYTthQUN6QixDQUFDLENBQ0g7WUFDRCxlQUFlLEVBQUUsSUFBSSx5QkFBZSxDQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRTtnQkFDNUQsa0JBQWtCLEVBQUUsSUFBSTthQUN6QixDQUFDO1lBQ0YsT0FBTyxFQUFFLG1CQUFTLENBQUMsT0FBTyxDQUFDO2dCQUN6QixZQUFZLEVBQUUsS0FBSzthQUNwQixDQUFDO1lBQ0YsWUFBWSxFQUFFO2dCQUNaO29CQUNFLGFBQWEsRUFBRSxJQUFJO29CQUNuQixJQUFJLEVBQUUsS0FBSztvQkFDWCxRQUFRLEVBQUUsa0JBQVEsQ0FBQyxHQUFHO29CQUN0QixXQUFXLEVBQUUscUJBQVcsQ0FBQyxJQUFJO2lCQUM5QjthQUNGO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsT0FBTyxjQUFjLENBQUM7SUFDeEIsQ0FBQztJQUVPLGFBQWEsQ0FBQyxjQUE4QixFQUFFLFdBQW1CO1FBQ3ZFLE1BQU0sV0FBVyxHQUFHLHlCQUFlLENBQUMsZUFBZSxDQUNqRCxJQUFJLEVBQ0oseUJBQXlCLENBQzFCLENBQUM7UUFFRiwwRUFBMEU7UUFDMUUsd0VBQXdFO1FBQ3hFLElBQUksV0FBVyxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsRUFBRTtZQUN6QyxPQUFPO1NBQ1I7UUFFRCxNQUFNLEdBQUcsR0FBRyxhQUFHLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUU7WUFDdEMsSUFBSSxFQUFFO2dCQUNKLE9BQU8sRUFBRSxXQUFXO2FBQ3JCO1NBQ0YsQ0FBQyxDQUFBO1FBRUYsTUFBTSxPQUFPLEdBQUcsaUJBQU8sQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFO1lBQzdELFdBQVc7WUFDWCxHQUFHO1NBQ0osQ0FBQyxDQUFDO1FBRUgsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLHVCQUFhLENBQUMsSUFBSSxFQUFFLHNCQUFzQixFQUFFO1lBQzNFLEdBQUc7WUFDSCxnQkFBZ0IsRUFBRSxJQUFJO1NBQ3ZCLENBQUMsQ0FBQTtRQUVGLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxjQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsRUFBRSxjQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSw0QkFBNEIsQ0FBQyxDQUFBO1FBRXpILElBQUksd0JBQWMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFO1lBQ2xDLE9BQU87WUFDUCxjQUFjO1lBQ2QsZUFBZSxFQUFFO2dCQUNmLElBQUksRUFBRSxXQUFXO2dCQUNqQixpQkFBaUIsRUFDZiwwQ0FBbUIsQ0FBQyxpQ0FBaUMsQ0FDbkQsSUFBSSxFQUNKLHFCQUFxQixFQUNyQjtvQkFDRSxXQUFXLEVBQUUseUJBQWUsQ0FBQyxlQUFlLENBQzFDLElBQUksRUFDSixtQ0FBbUMsQ0FDcEM7b0JBQ0QsWUFBWSxFQUFFLFFBQVE7b0JBQ3RCLGFBQWEsRUFBRSxRQUFRO2lCQUN4QixDQUNGO2FBQ0o7WUFDRCxjQUFjLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQztTQUN2QyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUEvRkQsNENBK0ZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSBcImNvbnN0cnVjdHNcIjtcbmltcG9ydCB7XG4gIEFwcFByb3RvY29sLFxuICBDbHVzdGVyLFxuICBDb250YWluZXJJbWFnZSxcbiAgQ3B1QXJjaGl0ZWN0dXJlLFxuICBGYXJnYXRlU2VydmljZSxcbiAgRmFyZ2F0ZVRhc2tEZWZpbml0aW9uLFxuICBMaW51eFBhcmFtZXRlcnMsXG4gIExvZ0RyaXZlcixcbiAgUHJvdG9jb2wsXG4gIFRhc2tEZWZpbml0aW9uLFxufSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWVjc1wiO1xuaW1wb3J0IHsgU3RyaW5nUGFyYW1ldGVyIH0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1zc21cIjtcbmltcG9ydCB7IERvY2tlckltYWdlQXNzZXQgfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWVjci1hc3NldHNcIjtcbmltcG9ydCB7UGVlciwgUG9ydCwgU2VjdXJpdHlHcm91cCwgVnBjfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWVjMlwiO1xuaW1wb3J0IHsgUHJpdmF0ZURuc05hbWVzcGFjZSB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3Mtc2VydmljZWRpc2NvdmVyeVwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIElTZXJ2aWNlQ29uc3RydWN0UHJvcHMge1xuICBzZXJ2aWNlTmFtZTogc3RyaW5nO1xuICBjb250YWluZXJQYXRoOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBTZXJ2aWNlQ29uc3RydWN0IGV4dGVuZHMgQ29uc3RydWN0IHtcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IElTZXJ2aWNlQ29uc3RydWN0UHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQpO1xuXG4gICAgY29uc3QgdGFza0RlZmluaXRpb24gPSB0aGlzLmNyZWF0ZVRhc2tEZWZpbml0aW9uKHByb3BzLmNvbnRhaW5lclBhdGgpO1xuXG4gICAgdGhpcy5jcmVhdGVTZXJ2aWNlKHRhc2tEZWZpbml0aW9uLCBwcm9wcy5zZXJ2aWNlTmFtZSk7XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZVRhc2tEZWZpbml0aW9uKGNvbnRhaW5lclBhdGg6IHN0cmluZyk6IFRhc2tEZWZpbml0aW9uIHtcbiAgICBjb25zdCB0YXNrRGVmaW5pdGlvbiA9IG5ldyBGYXJnYXRlVGFza0RlZmluaXRpb24odGhpcywgXCJUYXNrRGVmaW5pdGlvblwiLCB7XG4gICAgICBjcHU6IDI1NixcbiAgICAgIG1lbW9yeUxpbWl0TWlCOiA1MTIsXG4gICAgICBydW50aW1lUGxhdGZvcm06IHtcbiAgICAgICAgY3B1QXJjaGl0ZWN0dXJlOiBDcHVBcmNoaXRlY3R1cmUuQVJNNjQsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgdGFza0RlZmluaXRpb24uYWRkQ29udGFpbmVyKFwiYXBwXCIsIHtcbiAgICAgIGltYWdlOiBDb250YWluZXJJbWFnZS5mcm9tRG9ja2VySW1hZ2VBc3NldChcbiAgICAgICAgbmV3IERvY2tlckltYWdlQXNzZXQodGhpcywgXCJJbWFnZVwiLCB7XG4gICAgICAgICAgZGlyZWN0b3J5OiBjb250YWluZXJQYXRoLFxuICAgICAgICB9KSxcbiAgICAgICksXG4gICAgICBsaW51eFBhcmFtZXRlcnM6IG5ldyBMaW51eFBhcmFtZXRlcnModGhpcywgXCJMaW51eFBhcmFtZXRlcnNcIiwge1xuICAgICAgICBpbml0UHJvY2Vzc0VuYWJsZWQ6IHRydWUsXG4gICAgICB9KSxcbiAgICAgIGxvZ2dpbmc6IExvZ0RyaXZlci5hd3NMb2dzKHtcbiAgICAgICAgc3RyZWFtUHJlZml4OiBcImVjc1wiLFxuICAgICAgfSksXG4gICAgICBwb3J0TWFwcGluZ3M6IFtcbiAgICAgICAge1xuICAgICAgICAgIGNvbnRhaW5lclBvcnQ6IDMwMDAsXG4gICAgICAgICAgbmFtZTogXCJhcHBcIixcbiAgICAgICAgICBwcm90b2NvbDogUHJvdG9jb2wuVENQLFxuICAgICAgICAgIGFwcFByb3RvY29sOiBBcHBQcm90b2NvbC5odHRwLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9KTtcblxuICAgIHJldHVybiB0YXNrRGVmaW5pdGlvbjtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlU2VydmljZSh0YXNrRGVmaW5pdGlvbjogVGFza0RlZmluaXRpb24sIHNlcnZpY2VOYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCBjbHVzdGVyTmFtZSA9IFN0cmluZ1BhcmFtZXRlci52YWx1ZUZyb21Mb29rdXAoXG4gICAgICB0aGlzLFxuICAgICAgXCIvcGluZy1wb25nL2NsdXN0ZXIvbmFtZVwiLFxuICAgICk7XG5cbiAgICAvLyBVbnRpbCB0aGUgY29udGV4dCBsb29rdXAgaGFzIGJlZW4gY29tcGxldGVkIGZvciB0aGUgZmlyc3QgdGltZSwgd2UgaGF2ZVxuICAgIC8vIGR1bW15IHZhbHVlIHdlIGNhbid0IHVzZSBpbiB0aGUgQ2x1c3Rlci5mcm9tQ2x1c3RlckF0dHJpYnV0ZXMgbWV0aG9kLlxuICAgIGlmIChjbHVzdGVyTmFtZS5zdGFydHNXaXRoKFwiZHVtbXktdmFsdWVcIikpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB2cGMgPSBWcGMuZnJvbUxvb2t1cCh0aGlzLCBcIlZQQ1wiLCB7XG4gICAgICB0YWdzOiB7XG4gICAgICAgIHByb2plY3Q6IFwicGluZy1wb25nXCIsXG4gICAgICB9LFxuICAgIH0pXG5cbiAgICBjb25zdCBjbHVzdGVyID0gQ2x1c3Rlci5mcm9tQ2x1c3RlckF0dHJpYnV0ZXModGhpcywgXCJDbHVzdGVyXCIsIHtcbiAgICAgIGNsdXN0ZXJOYW1lLFxuICAgICAgdnBjLFxuICAgIH0pO1xuXG4gICAgY29uc3Qgc2VydmljZVNlY3VyaXR5R3JvdXAgPSBuZXcgU2VjdXJpdHlHcm91cCh0aGlzLCBcIlNlcnZpY2VTZWN1cml0eUdyb3VwXCIsIHtcbiAgICAgIHZwYyxcbiAgICAgIGFsbG93QWxsT3V0Ym91bmQ6IHRydWUsXG4gICAgfSlcblxuICAgIHNlcnZpY2VTZWN1cml0eUdyb3VwLmFkZEluZ3Jlc3NSdWxlKFBlZXIuaXB2NCh2cGMudnBjQ2lkckJsb2NrKSwgUG9ydC50Y3BSYW5nZSgzMDAwLCAzMDAwKSwgXCJBbGxvdyBzZXJ2aWNlIEFQSSB0cmFmZmljLlwiKVxuXG4gICAgbmV3IEZhcmdhdGVTZXJ2aWNlKHRoaXMsIFwiU2VydmljZVwiLCB7XG4gICAgICBjbHVzdGVyLFxuICAgICAgdGFza0RlZmluaXRpb24sXG4gICAgICBjbG91ZE1hcE9wdGlvbnM6IHtcbiAgICAgICAgbmFtZTogc2VydmljZU5hbWUsXG4gICAgICAgIGNsb3VkTWFwTmFtZXNwYWNlOlxuICAgICAgICAgIFByaXZhdGVEbnNOYW1lc3BhY2UuZnJvbVByaXZhdGVEbnNOYW1lc3BhY2VBdHRyaWJ1dGVzKFxuICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgIFwiUHJpdmF0ZUROU05hbWVzcGFjZVwiLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBuYW1lc3BhY2VJZDogU3RyaW5nUGFyYW1ldGVyLnZhbHVlRnJvbUxvb2t1cChcbiAgICAgICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgICAgIFwiL3BpbmctcG9uZy9jbG91ZC1tYXAtbmFtZXNwYWNlL2lkXCIsXG4gICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgIG5hbWVzcGFjZUFybjogXCJ1bnVzZWRcIixcbiAgICAgICAgICAgICAgbmFtZXNwYWNlTmFtZTogXCJ1bnVzZWRcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgKSxcbiAgICAgIH0sXG4gICAgICBzZWN1cml0eUdyb3VwczogW3NlcnZpY2VTZWN1cml0eUdyb3VwXSxcbiAgICB9KTtcbiAgfVxufVxuIl19