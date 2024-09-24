import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import * as tl from 'azure-pipelines-task-lib/task';
import { executePolicies } from './pipelineTasks';

const DEFAULT_PIPELINE_DIRECTORY = 'default/pipelines';
const DEFAULT_POLICY_RULES_PATH = 'default/config/policyRules.yaml';

export async function run(): Promise<void> {
  try {
    const pipelineDirectory: string | undefined = tl.getInput('pipelineDirectory', false) || DEFAULT_PIPELINE_DIRECTORY;
    const policyRulesPath: string | undefined = tl.getInput('policyRulesPath', false) || DEFAULT_POLICY_RULES_PATH;

    fs.readdir(pipelineDirectory, (err, files) => {
      if (err) {
        console.error(`Error reading pipeline directory: ${err}`);
        process.exit(1);
      }

      files.forEach(file => {
        const filePath = path.join(pipelineDirectory, file);
        const pipelineData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const analysisResults = executePolicies(pipelineData, policyRulesPath);

        if (analysisResults.length > 0) {
          console.error(`Analysis failed for ${file} with the following issues:`);
          analysisResults.forEach(result => console.error(result));
          process.exit(1);
        } else {
          console.log(`Analysis passed for ${file} with no issues.`);
        }
      });
    });
  } catch (error: any) {
    tl.setResult(tl.TaskResult.Failed, error.message);
  }
}

run();