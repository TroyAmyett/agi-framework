const { execSync } = require('child_process');

console.log('🔍 Checking for secrets...');

try {
    // Get list of staged files
    const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' })
        .split('\n')
        .filter(Boolean);

    // Skip if only checking the script itself or .env.example
    const filesToCheck = stagedFiles.filter(file =>
        file !== 'scripts/check-secrets.js' &&
        !file.endsWith('.env.example')
    );

    if (filesToCheck.length === 0) {
        console.log('✅ No files to check (only example files or this script)');
        process.exit(0);
    }

    // Check if .env is being committed
    const staged = execSync('git diff --cached --name-only', { encoding: 'utf8' });

    if (staged.match(/^\.env`$/m) || staged.match(/^\.env\.local`$/m)) {
        console.error('❌ ERROR: Attempting to commit .env file!');
        console.error('Please remove it: git reset HEAD .env');
        process.exit(1);
    }

    // Check for actual API keys in files (excluding our script and examples)
    for (const file of filesToCheck) {
        try {
            const content = execSync(`git show :${file}`, { encoding: 'utf8' });

            // Anthropic API key pattern (actual keys, not patterns)
            if (content.match(/sk-ant-api03-[a-zA-Z0-9_-]{95}/) && !file.includes('example')) {
                console.error(`❌ ERROR: Anthropic API key detected in ${file}!`);
                process.exit(1);
            }

            // OpenAI API key pattern (actual keys, not patterns)
            if (content.match(/sk-[a-zA-Z0-9]{48}/) && !file.includes('example')) {
                console.error(`❌ ERROR: OpenAI API key detected in ${file}!`);
                process.exit(1);
            }
        } catch (err) {
            // Skip files that can't be read
            continue;
        }
    }

    console.log('✅ No secrets detected - safe to commit');
} catch (error) {
    if (error.status) {
        process.exit(error.status);
    }
    console.log('✅ No staged files to check');
}
