import { runParallelProcessingAnalysis } from './parallelProcessingTask';
import { runNamingConventionAnalysis } from './namingConventionTask';
import * as fs from 'fs';
import * as yaml from 'js-yaml';

interface Policy {
  name: string;
  path: string;
}

interface PolicyFile {
  policies: Policy[];
}

function loadPolicies(policyFilePath: string): Policy[] {
  try {
    const fileContents = fs.readFileSync(policyFilePath, 'utf8');
    const data = yaml.load(fileContents) as PolicyFile;
    return data.policies;
  } catch (error) {
    console.error(`Error loading policy rules: ${error}`);
    return [];
  }
}

function executePolicy(policy: Policy, pipelineData: any) {
  switch (policy.name) {
    case 'Parallel Processing Rule':
      return runParallelProcessingAnalysis(pipelineData, policy);
    case 'Naming Convention Rule':
      return runNamingConventionAnalysis(pipelineData, policy);
    default:
      console.log(`No implementation found for the policy: ${policy.name}`);
      return [];
  }
}

export function executePolicies(pipelineData: any, policyFilePath: string) {
  const policies = loadPolicies(policyFilePath);
  if (!policies.length) {
    console.log('No policies found in the YAML configuration.');
    return [];
  }
  let results: string[] = [];
  policies.forEach(policy => {
    console.log(`Executing policy: ${policy.name}`);
    results = results.concat(executePolicy(policy, pipelineData));
  });
  return results;
}