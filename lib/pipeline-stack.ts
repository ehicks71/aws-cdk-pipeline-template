import * as cdk from '@aws-cdk/core';
import s3 = require('@aws-cdk/aws-s3');
import codepipeline = require('@aws-cdk/aws-codepipeline');
import codepipeline_actions = require('@aws-cdk/aws-codepipeline-actions');
import codebuild = require('@aws-cdk/aws-codebuild');

import * as oApp from './../pipeline-vars';

export class PipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps, branch?: string) {
    super(scope, id, props);
    
    if (branch == undefined) {
      branch = 'DEV';
    }
    const sBranchName = branch.toLowerCase();
    this.buildPipeline(sBranchName);
  }
  
  /**
   * Builds the pipeline.
   * 
   * @param {string} sBranchName
   * 
   * @return void
   */
  buildPipeline(sBranchName: string) : void
  {
    const oArtifactsBucket = this.createArtifactsBucket(sBranchName);
    const oPipeline = this.createPipeline(oArtifactsBucket);
    const oSourceOutput = this.createPipelineArtifact('Source');
    const oBuildOutput = this.createPipelineArtifact('Build');
    const oBuildProject = this.createPipelineProject(oArtifactsBucket);
    this.addSourceStage(oPipeline, oSourceOutput, sBranchName);
    this.addBuildStage(oPipeline, oSourceOutput, oBuildOutput, oBuildProject, sBranchName);
    this.addDeployStage(oPipeline, oBuildOutput, sBranchName);
  }
  
  /**
   * Creates the bucket to hold the pipeline artifacts.
   * 
   * @param {string} sBranchName
   * 
   * @return void
   */
  createArtifactsBucket(sBranchName: string) : s3.Bucket
  {
    const sRegion = this.region;
    return new s3.Bucket(this, 'Bucket', {
      bucketName: oApp.sPipelineArtifactBucketName + '-' + sBranchName + '-' + sRegion
    });
  }
  
  /**
   * Starts creation of the pipeline.
   * 
   * @param {s3.Bucket} oArtifactsBucket
   * 
   * @return void
   */
  createPipeline(oArtifactsBucket: s3.Bucket) : codepipeline.Pipeline
  {
    return new codepipeline.Pipeline(this, 'Pipeline', {
      pipelineName: this.prependPipelineStackName('Pipeline'),
      artifactBucket: oArtifactsBucket,
    });
  }
  
  /**
   * Prepends the pipeline stack name to whatever name is passed in.
   * 
   * @param {string} sName
   * 
   * @return string
   */
  prependPipelineStackName(sName: string ) : string
  {
      const sPipelineStackName = this.stackName;
      return sPipelineStackName + '-' + sName;
  }
  
  /**
   * Creates a code pipeline artifact.
   * 
   * @param {string} sArtifactNamePrefix
   * 
   * @return void
   */
  createPipelineArtifact(sArtifactNamePrefix: string) : codepipeline.Artifact
  {
    return new codepipeline.Artifact(sArtifactNamePrefix + 'Artifact');
  }
  
  /**
   * Adds the source stage to the pipeline.
   * 
   * @param {codepipeline.Pipeline} oPipeline
   * @param {codepipeline.Artifact} oSourceOutput
   * @param {string} sBranchName
   * 
   * @return void
   */
  addSourceStage(oPipeline: codepipeline.Pipeline, oSourceOutput: codepipeline.Artifact, sBranchName: string) : void
  {
    oPipeline.addStage({
      stageName: this.appendBranchNameToStageName('Source', sBranchName),
      actions: [
        new codepipeline_actions.CodeStarConnectionsSourceAction({
          actionName: 'GitHub',
          connectionArn: '[codestar connection ARN]',
          output: oSourceOutput,
          owner: oApp.sRepoOwner,
          repo: oApp.sRepoName,
          branch: sBranchName
        }),
      ],
    });
  }
    
  /**
   * Appends the branch name to the stage name so that branch is shown.
   * 
   * @param {string} sStageName
   * @param {string} sBranchName
   * 
   * @return string
   */
  appendBranchNameToStageName(sStageName: string, sBranchName: string) : string
  {
    return sStageName + '-' + sBranchName.toUpperCase();
  }
  
  /**
   * Creates the pipeline project for the build stage of the pipeline.
   * 
   * @param {s3.Bucket} oArtifactsBucket
   * 
   * @return codebuild.PipelineProject
   */
  createPipelineProject(oArtifactsBucket: s3.Bucket) : codebuild.PipelineProject
  {
    return new codebuild.PipelineProject(this, 'Build', {
      projectName: this.prependPipelineStackName('Build'),
      environment: { buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_2 },
      environmentVariables: {
        'PACKAGE_BUCKET': {
          value: oArtifactsBucket.bucketName
        }
      }
    });
  }
  
  /**
   * Adds the build stage to the pipeline.
   * 
   * @param {codepipeline.Pipeline} oPipeline
   * @param {codepipeline.Artifact} oSourceOutput
   * @param {codepipeline.Artifact} oBuildOutput
   * @param {codebuild.PipelineProject} oBuidProject
   * @param {string} sBranchName
   * 
   * @return void
   */
  addBuildStage(oPipeline: codepipeline.Pipeline, oSourceOutput: codepipeline.Artifact, oBuildOutput: codepipeline.Artifact, oBuidProject: codebuild.PipelineProject, sBranchName: string) : void
  {
    oPipeline.addStage({
      stageName: this.appendBranchNameToStageName('Build', sBranchName),
      actions: [
        new codepipeline_actions.CodeBuildAction({
          actionName: 'Build',
          project: oBuidProject,
          input: oSourceOutput,
          outputs: [oBuildOutput],
        }),
      ],
    });
  }

  
  /**
   * Adds the deploy stage to the pipeline.
   * 
   * @param {codepipeline.Pipeline} oPipeline
   * @param {codepipeline.Artifact} oBuildOutput
   * @param {string} sBranchName
   * 
   * @return void
   */
  addDeployStage(oPipeline: codepipeline.Pipeline, oBuildOutput: codepipeline.Artifact, sBranchName: string) : void
  {
    const sLambdaStackName = oApp.sLamdbaStackName + '-' + sBranchName.toUpperCase();
    const sLambdaChangeSetName = oApp.sLamdbaStackName + '-' + sBranchName + '-changeset';
    const sApplicationName = oApp.sAppName;
    const sEnvironmentName = sBranchName.toLowerCase();
    oPipeline.addStage({
      stageName: this.appendBranchNameToStageName('Deploy', sBranchName),
      actions: [
        new codepipeline_actions.CloudFormationCreateReplaceChangeSetAction({
          actionName: 'CreateChangeSet',
          templatePath: oBuildOutput.atPath("packaged.yaml"),
          stackName: sLambdaStackName,
          adminPermissions: true,
          changeSetName: sLambdaChangeSetName,
          parameterOverrides: { 
            'ApplicationName': `${sApplicationName}`, 
            'EnvironmentName': `${sEnvironmentName}` 
          },
          runOrder: 1
        }),
        new codepipeline_actions.CloudFormationExecuteChangeSetAction({
          actionName: 'Deploy',
          stackName: sLambdaStackName,
          changeSetName: sLambdaChangeSetName,
          runOrder: 2
        }),
      ],
    });
  }
}
