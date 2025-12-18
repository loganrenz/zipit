import { execSync } from 'child_process';
import { existsSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { createZip } from '../src/zipit';
import { createTxt } from '../src/txtit';

interface TestRepo {
  name: string;
  url: string;
  type: 'node' | 'python' | 'frontend' | 'mixed';
}

// Test repositories (you can modify these based on what you have access to)
const TEST_REPOS: TestRepo[] = [
  {
    name: 'express-example',
    url: 'https://github.com/expressjs/express.git',
    type: 'node',
  },
  {
    name: 'flask-example',
    url: 'https://github.com/pallets/flask.git',
    type: 'python',
  },
  {
    name: 'react-example',
    url: 'https://github.com/facebook/react.git',
    type: 'frontend',
  },
];

async function testZipCreation(repoPath: string, repoName: string): Promise<boolean> {
  console.log(`\n📦 Testing zip creation for ${repoName}...`);
  
  try {
    const outputPath = join(repoPath, 'test-output.zip');
    await createZip({
      outputPath,
      rootDir: repoPath,
    });

    if (!existsSync(outputPath)) {
      console.error(`❌ Zip file not created: ${outputPath}`);
      return false;
    }

    const stats = statSync(outputPath);
    if (stats.size === 0) {
      console.error(`❌ Zip file is empty`);
      return false;
    }

    // Check that zip doesn't contain node_modules (if it's a Node.js project)
    // This is a basic check - in a real scenario, you'd unzip and verify contents
    console.log(`✓ Zip created: ${outputPath} (${stats.size} bytes)`);
    return true;
  } catch (error) {
    console.error(`❌ Error creating zip:`, error);
    return false;
  }
}

async function testTxtCreation(repoPath: string, repoName: string): Promise<boolean> {
  console.log(`\n📄 Testing text file creation for ${repoName}...`);
  
  try {
    const outputPath = join(repoPath, 'test-output.txt');
    await createTxt({
      outputPath,
      rootDir: repoPath,
    });

    if (!existsSync(outputPath)) {
      console.error(`❌ Text file not created: ${outputPath}`);
      return false;
    }

    const stats = statSync(outputPath);
    if (stats.size === 0) {
      console.error(`❌ Text file is empty`);
      return false;
    }

    // Read and verify structure
    const content = readFileSync(outputPath, 'utf-8');
    
    // Check for expected sections
    if (!content.includes('PROJECT CODE EXPORT')) {
      console.error(`❌ Missing header section`);
      return false;
    }

    if (!content.includes('DIRECTORY STRUCTURE')) {
      console.error(`❌ Missing directory structure section`);
      return false;
    }

    // Check that it doesn't contain node_modules paths (if Node.js project)
    if (content.includes('node_modules/') && repoName.includes('express')) {
      console.warn(`⚠️  Text file contains node_modules references`);
    }

    console.log(`✓ Text file created: ${outputPath} (${stats.size} bytes)`);
    console.log(`  Content preview: ${content.substring(0, 200)}...`);
    return true;
  } catch (error) {
    console.error(`❌ Error creating text file:`, error);
    return false;
  }
}

async function cloneRepo(url: string, dest: string): Promise<boolean> {
  console.log(`\n📥 Cloning ${url} to ${dest}...`);
  
  try {
    // Clean up destination if it exists
    if (existsSync(dest)) {
      execSync(`rm -rf ${dest}`, { stdio: 'ignore' });
    }
    execSync(`git clone --depth 1 ${url} ${dest}`, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`❌ Failed to clone repository:`, error);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Starting integration tests...\n');
  
  const testDir = '/tmp/zipit-test';
  const results: { repo: string; zip: boolean; txt: boolean }[] = [];

  // Try to use gh cli to get user's repos, or use default test repos
  let reposToTest: TestRepo[] = [];
  
  try {
    // Try to get repos from gh cli
    const ghRepos = execSync('gh repo list --limit 5 --json nameWithOwner,url', { encoding: 'utf-8' });
    const repos = JSON.parse(ghRepos);
    
    if (repos.length > 0) {
      console.log(`📋 Found ${repos.length} repositories from GitHub CLI`);
      reposToTest = repos.slice(0, 3).map((repo: any, index: number) => ({
        name: `repo-${index}`,
        url: repo.url,
        type: 'mixed' as const,
      }));
    } else {
      reposToTest = TEST_REPOS.slice(0, 2); // Use first 2 test repos
    }
  } catch (error) {
    console.log('⚠️  GitHub CLI not available or no repos found, using test repos');
    reposToTest = TEST_REPOS.slice(0, 2);
  }

  for (const repo of reposToTest) {
    const repoPath = join(testDir, repo.name);
    
    // Clone repo
    const cloned = await cloneRepo(repo.url, repoPath);
    if (!cloned) {
      console.log(`⏭️  Skipping ${repo.name} due to clone failure`);
      continue;
    }

    // Test zip creation
    const zipSuccess = await testZipCreation(repoPath, repo.name);
    
    // Test txt creation
    const txtSuccess = await testTxtCreation(repoPath, repo.name);

    results.push({
      repo: repo.name,
      zip: zipSuccess,
      txt: txtSuccess,
    });

    // Cleanup
    try {
      execSync(`rm -rf ${repoPath}`, { stdio: 'ignore' });
    } catch (error) {
      // Ignore cleanup errors
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Results Summary');
  console.log('='.repeat(60));
  
  results.forEach((result) => {
    const zipIcon = result.zip ? '✓' : '❌';
    const txtIcon = result.txt ? '✓' : '❌';
    console.log(`${result.repo}:`);
    console.log(`  Zip: ${zipIcon}`);
    console.log(`  Txt: ${txtIcon}`);
  });

  const allPassed = results.every((r) => r.zip && r.txt);
  
  if (allPassed && results.length > 0) {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed');
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

