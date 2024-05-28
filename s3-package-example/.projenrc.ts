import { awscdk } from 'projen';
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'James Sherwood-Jones',
  authorAddress: 'james@jsherz.com',
  cdkVersion: '2.1.0',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.0.0',
  name: 'fancier-s3-bucket',
  projenrcTs: true,
  repositoryUrl: 'https://github.com/jSherz/fancier-s3-bucket.git',

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();
