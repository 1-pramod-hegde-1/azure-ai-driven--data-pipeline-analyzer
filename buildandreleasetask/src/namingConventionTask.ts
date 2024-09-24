import * as fs from 'fs';
import * as yaml from 'js-yaml';

interface NamingRule {
  mustStartWithLetterOrNumber?: boolean;
  allowedCharacters?: RegExp;
  maxLength?: number;
  minLength?: number;
  noConsecutiveDashes?: boolean;
  mustStartWithLetter?: boolean;
  disallowedCharacters?: RegExp;
  allowDashes?: boolean;
  policyViolationCode?: string;
}

interface Artifact {
  name: string;
  type: string;
}

function loadNamingRules(): { [key: string]: NamingRule } {
  const policyPath = './config/namingConventionPolicy.yaml';
  try {
    const fileContents = fs.readFileSync(policyPath, 'utf8');
    return yaml.load(fileContents) as { [key: string]: NamingRule };
  } catch (error) {
    console.error(`Error loading naming convention rules: ${error}`);
    return {};
  }
}

export function runNamingConventionAnalysis(pipelineData: any, rule: any) {
  const results: string[] = [];
  const namingRules = loadNamingRules();

  pipelineData.activities.forEach((activity: any) => {
    const rules = namingRules[activity.type];
    if (rules) {
      if (rules.mustStartWithLetterOrNumber && !/^[a-zA-Z0-9]/.test(activity.name)) {
        results.push(`Artifact ${activity.name} does not start with a letter or number. Code: ${rules.policyViolationCode}`);
      }
      if (rules.allowedCharacters && !rules.allowedCharacters.test(activity.name)) {
        results.push(`Artifact ${activity.name} contains disallowed characters. Code: ${rules.policyViolationCode}`);
      }
      if (rules.maxLength && activity.name.length > rules.maxLength) {
        results.push(`Artifact ${activity.name} exceeds maximum length. Code: ${rules.policyViolationCode}`);
      }
      if (rules.minLength && activity.name.length < rules.minLength) {
        results.push(`Artifact ${activity.name} is below minimum length. Code: ${rules.policyViolationCode}`);
      }
      if (rules.noConsecutiveDashes && /--/.test(activity.name)) {
        results.push(`Artifact ${activity.name} contains consecutive dashes. Code: ${rules.policyViolationCode}`);
      }
      if (rules.mustStartWithLetter && !/^[a-zA-Z]/.test(activity.name)) {
        results.push(`Artifact ${activity.name} does not start with a letter. Code: ${rules.policyViolationCode}`);
      }
      if (rules.disallowedCharacters && rules.disallowedCharacters.test(activity.name)) {
        results.push(`Artifact ${activity.name} contains disallowed characters. Code: ${rules.policyViolationCode}`);
      }
      if (!rules.allowDashes && /-/.test(activity.name)) {
        results.push(`Artifact ${activity.name} contains dashes. Code: ${rules.policyViolationCode}`);
      }
    }
  });

  return results;
}