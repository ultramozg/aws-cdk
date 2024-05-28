import { BlockPublicAccess, Bucket, BucketEncryption, BucketProps, LifecycleRule } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export type FancierS3BucketProps = Omit<BucketProps, 'encryption' | 'enforceSSL' | 'bucketKeyEnabled' | 'versioned' | 'blockPublicAccess'>

export class FancierS3Bucket extends Construct {
  public readonly bucket: Bucket;

  constructor(scope: Construct, id: string, props: FancierS3BucketProps) {
    super(scope, id);

    this.bucket = new Bucket(this, 'Bucket', {
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      versioned: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      ...props,
    });
  }

  addLifecycleRule(rule: LifecycleRule) {
    this.bucket.addLifecycleRule(rule);
  }
}
