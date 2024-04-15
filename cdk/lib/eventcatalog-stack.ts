import { Aspects, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Distribution, IDistribution, OriginAccessIdentity, PriceClass, ViewerProtocolPolicy } from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { Bucket, IBucket, ObjectOwnership } from "aws-cdk-lib/aws-s3";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";
import { ApplyDestroyPolicyAspect } from "../helper/destroy-policy-assets";

export interface EventCatalogStackProps extends StackProps {}

export class EventCatalogStack extends Stack {
  readonly specsBucket: IBucket;
  readonly websiteBucket: IBucket;
  readonly cloudfrontDistribution: IDistribution;
  constructor(scope: Construct, id: string, props?: EventCatalogStackProps) {
    super(scope, id, props);
    
    this.specsBucket = new Bucket(this, 'EventCatalogSpecsBucket', {
      objectOwnership: ObjectOwnership.BUCKET_OWNER_ENFORCED,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      eventBridgeEnabled: true
    });
    this.websiteBucket = new Bucket(this, 'EventCatalogWebsiteBucket', {
      objectOwnership: ObjectOwnership.BUCKET_OWNER_ENFORCED,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    });
    const originAccessIdentity = new OriginAccessIdentity(this, 'EventCatalogWebsiteBucketOAI')
    this.websiteBucket.grantRead(originAccessIdentity);

    this.cloudfrontDistribution =  new Distribution(this, 'EventCatalogWebsiteDistribution', {
      defaultRootObject: 'index.html',
      priceClass: PriceClass.PRICE_CLASS_100,
      defaultBehavior: {
          origin: new S3Origin(this.websiteBucket, {
              originAccessIdentity
          }),
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS
      }
  });

    new StringParameter(this, 'EventCatalogSpecsBucketName', {
      parameterName: '/eventcatalog/bucket/specs/name',
      stringValue: this.specsBucket.bucketName,
    });

    new StringParameter(this, 'EventCatalogWebSiteUrl', {
      parameterName: '/eventcatalog/domain/website/url',
      stringValue: this.cloudfrontDistribution.distributionDomainName,
    });


    Aspects.of(this).add(new ApplyDestroyPolicyAspect());
  }
}