import * as fs from 'fs';
import * as yaml from 'js-yaml';

interface ParallelProcessingRule {
  warningMessage: string;
  policyViolationCode?: string;
}

function loadParallelProcessingRules(): ParallelProcessingRule[] {
  const policyPath = './config/parallelProcessingPolicy.yaml';
  try {
    const fileContents = fs.readFileSync(policyPath, 'utf8');
    return yaml.load(fileContents) as ParallelProcessingRule[];
  } catch (error) {
    console.error(`Error loading parallel processing rules: ${error}`);
    return [];
  }
}

export function runParallelProcessingAnalysis(pipelineData: any, rule: any) {
  const results: string[] = [];
  const parallelProcessingRules = loadParallelProcessingRules();

  pipelineData.activities.forEach((activity: any) => {
    if (activity.type === 'ForEach' && activity.parallel && activity.variablesSetInside) {
      parallelProcessingRules.forEach(rule => {
        results.push(`${rule.warningMessage} Code: ${rule.policyViolationCode}`);
      });
    }
  });

  return results;
}