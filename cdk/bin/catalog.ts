#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CatalogPipelineStack } from '../lib/pipeline-stack';
import { EventCatalogStack } from '../lib/eventcatalog-stack';

const app = new cdk.App();

const eventCatalogStack = new EventCatalogStack(app, EventCatalogStack.name, {});
new CatalogPipelineStack(app, CatalogPipelineStack.name, {
  specsBucket: eventCatalogStack.specsBucket,
  websiteBucket: eventCatalogStack.websiteBucket,
});
