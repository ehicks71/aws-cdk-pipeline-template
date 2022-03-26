# AWS CDK Pipeline Template

The pipeline code has been created so that it needs no changes to work for any application. All application specific settings are handled in the `app-vars.ts` file in your application root directory.

### Setup

1. In your app, clone this repo into a directory named `pipeline`. The directory should be at the root of your app.

   ```bash
   git clone git@github.com:ehicks71/aws-cdk-pipeline-template.git pipeline
   ```

2. Install the pipeline dependencies by running:

   ```bash
   cd pipeline
   npm install
   ```

   **NOTE: Do not run npm update. The package-lock.json is checked in to ensure those versions are used so nothing breaks.**

3. If there is no `app-vars.ts` file in the root of your app, create one and add this code:

   ```js
   export const sAppBucketSlug = 'app-template'; // Any length
   export const sAppInitials = 'AT'; // Max 3 letters
   export const sRepositoryName = 'aws-cdk-app-template';
   ```

4. Edit the values in `app-vars.ts` to match your app.

5. Prepare the pipeline code for deployment by running:

   ```bash
   npm run build
   ```

6. Now you are ready to deploy your pipeline stacks.

### Upgrade Instructions

1. In your app, do these commands to pull in and apply any updates to the pipeline for your app.

   ```bash
   cd pipeline
   git checkout master
   git pull origin master
   npm run build
   ```
   
2. Next you need to redeploy your stacks using the command example below.
    
   ```bash
   cdk deploy {DevStack|UatStack|ProdStack}
   ```

### Useful commands

* `npm run build` compile typescript to js
* `npm run watch` watch for changes and compile
* `npm run test` perform the jest unit tests
* `cdk deploy` deploy this stack to your default AWS account/region
* `cdk diff` compare deployed stack with current state
* `cdk synth` emits the synthesized CloudFormation template
* `cdk destroy` destory this stack

### Deploying a Stack

To deploy a stack add the stack name after the deploy command as shown below.

Run this from the `pipeline` directory.

```bash
cdk deploy [stackname]
```

### Deleting a Stack

**NOTE: Delete the APP stack before you delete the CI stack or you'll not be able to delete the APP stack.**

To delete a stack include the stack name after the destroy command as shown below.

Run this from the `pipeline` directory.

```bash
cdk destroy [stackname]
```

### Changing the Pipeline Code

Anytime you change the code in the `bin/pipeline.ts`, `lib/pipeline_stack.ts`, or `pipeline_vars.ts` files you need to run this commend to build the other files.

Run this from the `pipeline` directory.

```bash
npm run build
```

## File Structure

The pipeline file structure should look like this after you've completed the setup steps for your application.

```
/
  /pipeline
    /bin
      pipeline.d.ts
      pipeline.js
      pipeline.ts
    /lib
      pipeline_stack.d.ts
      pipeline_stack.js
      pipeline_stack.ts
    /node_modules
    /test
      pipeline.test.d.ts
      pipeline.test.js
      pipeline.test.ts
    .gitignore
    .npmignore
    cdk.json
    CHANGELOG.md
    jest.config.js
    package-lock.json
    package.json
    pipeline-vars.d.ts
    pipeline-vars.js
    pipeline-vars.ts
    README.md
    tsconfig.json
    VERSION
```

### cdk.json

The `cdk.json` file tells the CDK Toolkit how to execute your app.

### jest.config.js

The `jest.config.js` file sets configuration for testing with Jest.

### pipeline-vars.ts

The `pipeline-vars.ts` file defines variables needed for pipeline to be scoped to the application.

It uses the app-vars.ts from your app which should look something like this:

```js
export const sAppBucketSlug = 'serverless-template'; // Any length
export const sAppInitials = 'ST'; // Max 3 letters
export const sRepositoryName = 'aws-cdk-app-template';
```

### tsconfig.json

The `tsconfig.json` file sets configuration for translating TypeScript to browser readable JavaScript.

## How the Pipeline Works

So how this works is this line in the `cdk.json` tells the `cdk deploy` command to run this.

```json
  "app": "npx ts-node --prefer-ts-exts bin/pipeline.ts",
```

### PipelineStack

And in the pipeline.ts file you'll notice this import statement.

```js
import { PipelineStack } from '../lib/pipeline-stack';
```

The `pipeline-stack.ts` file defines the PipelineStack class.

```js
export class PipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps, branch?: string) {
    super(scope, id, props);

    if (branch == undefined) {
      branch = 'DEV';
    }
    const sBranchName = branch.toLowerCase();
    this.buildPipeline(sBranchName);
  }
```

This extends [cdk.Stack](https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_core.Stack.html) where cdk is defined by this line:

```js
import * as cdk from '@aws-cdk/core';
```

So there are 4 arguments for the PipelineStack:
* scope: cdk.Construct,
* id: string, props?:
* props?: cdk.StackProps,
* branch?: string

? after an argument means it is optional. The first 3 were already there. I added the branch argument.

### Instantiating PipelineStack

Here in `pipeline.ts` we are instantiating `PipelineStack` for one stack:

```js
new PipelineStack(app, 'DevStack',  {
    stackName: oApp.sPipelineStackName + '-DEV',
    terminationProtection: true,
}, 'DEV');
```

### PipelineStack Arguments

#### Scope

The first argument is `scope` which is defined as being of type cdk.Construct.

For the scope we instantiate the [cdk.App](https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_core.App.html) class.

```js
const app = new cdk.App();
```

#### Id

The second argument is id which is defined as type string.

#### Props

The third argument is stack props. It must be of type [cdk.StackProps](https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_core.StackProps.html)

Here we are defining 2 of the stack props:
* stackName
* terminationProtection

##### Stack Name

Near the top of this file is this line:

```js
import * as oApp from './../pipeline-vars';
```

This is pulling in the pipeline-vars that are exported, but in this file, only one is being used.

```js
export const sPipelineStackName = sAppName + '-CICD';
```

The code uses sPipelineStackName plus the environment to give each stack a unique namespaced name in Cloudformation.

##### Termination Protection

The code also turns on termination protection so that you can't accidentally delete the stacks. To intentionally delete them you have to go into the console and turn that off.
