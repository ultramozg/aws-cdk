import { Construct } from "constructs";
export interface IServiceConstructProps {
    serviceName: string;
    containerPath: string;
}
export declare class ServiceConstruct extends Construct {
    constructor(scope: Construct, id: string, props: IServiceConstructProps);
    private createTaskDefinition;
    private createService;
}
