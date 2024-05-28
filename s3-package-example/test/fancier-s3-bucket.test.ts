import { Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { FancierS3Bucket } from '../src';

describe('FancierS3Bucket', () => {
  it('creates an S3 bucket', () => {
    const stack = new Stack();

    new FancierS3Bucket(stack, 'FancierS3Bucket', {});

    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::S3::Bucket', 1);

    // Inspecting the template:
    // console.log(JSON.stringify(template.toJSON()));
  });
});
