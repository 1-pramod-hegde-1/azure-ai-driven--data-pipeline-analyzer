# PowerShell script to package the Azure DevOps extension

# Ensure the tfx-cli is installed
if (-not (Get-Command tfx -ErrorAction SilentlyContinue)) {
    Write-Host "Installing tfx-cli..."
    npm install -g tfx-cli
}

# Navigate to the task directory and compile TypeScript files
Write-Host "Compiling TypeScript files..."
cd tasks/az-data-pipeline-static-analysis
tsc

# Navigate back to the root directory
cd ../..

# Create the .vsix package
Write-Host "Creating the .vsix package..."
tfx extension create --manifest-globs vss-extension.json

Write-Host "Package creation complete."