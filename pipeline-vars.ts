import {
    sAppBucketSlug,
    sAppInitials,
    sRepositoryName,
    aStackEnvironments
} from './../app-vars';

const sPrefixSlug = 'wfu-ait'
const sAppPrefix = 'WfuAit'
export const sAppName = sAppPrefix + sAppInitials;
export const sPipelineStackName = 'cdk-' + sAppName + '-CI';
export const sLamdbaStackName = 'cdk-' + sAppName + '-App';
export const sPipelineArtifactBucketName = 'cdk-' + sPrefixSlug + '-' + sAppBucketSlug + '-ci';

export const sRepoOwner = 'wakeforestuniversity';
export const sRepoName = sRepositoryName;

const aDefaultStackEnvironments = ['Dev', 'Uat', 'Prod'];
let aStackNamesTemp = [];
if (typeof aStackEnvironments === 'object') {
    aStackNamesTemp = aStackEnvironments;
} else if (aStackEnvironments === '') {
    aStackNamesTemp = aDefaultStackEnvironments;
} else {
    aStackNamesTemp = JSON.parse("[" + aStackEnvironments + "]");
}
export const aStackNames = aStackNamesTemp;