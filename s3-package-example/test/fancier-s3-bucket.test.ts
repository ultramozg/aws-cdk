import { Stack } from 'aws-cdk-lib';
import { Capture, Template } from 'aws-cdk-lib/assertions';
import { FancierS3Bucket } from '../src';

describe('FancierS3Bucket', () => {
  let template: Template;

  beforeEach(() => {
    const stack = new Stack();

    new FancierS3Bucket(stack, 'FancierS3Bucket', {});

    template = Template.fromStack(stack);
  });

  it('creates an S3 bucket', () => {
    template.resourceCountIs('AWS::S3::Bucket', 1);

    // Inspecting the template:
    // console.log(JSON.stringify(template.toJSON()));
  });

  it('enables encryption on the S3 bucket', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      BucketEncryption: {
        ServerSideEncryptionConfiguration: [{
          ServerSideEncryptionByDefault: {
            SSEAlgorithm: 'AES256',
          },
        }],
      },
    });
  });

  it('has an update/replace and deletion policy of retain', () => {
    template.hasResource('AWS::S3::Bucket', {
      UpdateReplacePolicy: 'Retain',
      DeletionPolicy: 'Retain',
    });
  });

  it('denies all requests which are not secure', () => {
    const bucketRefA = new Capture();
    const bucketRefB = new Capture();

    template.hasResourceProperties('AWS::S3::BucketPolicy', {
      PolicyDocument: {
        Statement: [
          {
            Action: 's3:*',
            Condition: {
              Bool: {
                'aws:SecureTransport': 'false',
              },
            },
            Effect: 'Deny',
            Principal: {
              AWS: '*',
            },
            Resource: [
              {
                'Fn::GetAtt': [
                  // Match.anyValue(),
                  bucketRefA,
                  'Arn',
                ],
              },
              {
                'Fn::Join': [
                  '',
                  [
                    {
                      'Fn::GetAtt': [
                        // Match.anyValue(),
                        bucketRefB,
                        'Arn',
                      ],
                    },
                    '/*',
                  ],
                ],
              },
            ],
          },
        ],
        Version: '2012-10-17',
      },
    });

    expect(bucketRefA.asString()).toEqual(bucketRefB.asString());
  });

  // Before refactoring:
  // it('creates an S3 bucket', () => {
  //   const stack = new Stack();
  //
  //   new FancierS3Bucket(stack, 'FancierS3Bucket', {});
  //
  //   const template = Template.fromStack(stack);
  //
  //   template.resourceCountIs('AWS::S3::Bucket', 1);
  //
  //   // Inspecting the template:
  //   // console.log(JSON.stringify(template.toJSON()));
  // });
  //
  // it('enables encryption on the S3 bucket', () => {
  //   const stack = new Stack();
  //
  //   new FancierS3Bucket(stack, 'FancierS3Bucket', {});
  //
  //   const template = Template.fromStack(stack);
  //
  //   template.hasResourceProperties('AWS::S3::Bucket', {
  //     BucketEncryption: {
  //       ServerSideEncryptionConfiguration: [{
  //         ServerSideEncryptionByDefault: {
  //           SSEAlgorithm: 'AES256',
  //         },
  //       }],
  //     },
  //   });
  // });
});
