#!/usr/bin/env node

import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { PipelineStack } from '../lib/pipeline-stack';

import * as oApp from './../pipeline-vars';

const app = new cdk.App();

const iStackCount = oApp.aStackNames.length;
for (let i=0; i < iStackCount; i++) {
    let sStackEnvironment = oApp.aStackNames[i];
    let sStackName = sStackEnvironment + 'Stack'
    let sEnvironmentUpper = sStackEnvironment.toUpperCase();
    new PipelineStack(app, sStackName,  {
        stackName: oApp.sPipelineStackName + '-' + sEnvironmentUpper,
        terminationProtection: true,
    }, sEnvironmentUpper); 
}
