'use strict';

import simpleGit from 'simple-git';
import chalk from 'chalk';
import boxen from 'boxen';
import fs from 'fs';
import path from 'path';

// Convert casual message to conventional commit
function formatCommitMessage(message) {
    const msg = message.toLowerCase();

    if (msg.includes('fix') || msg.includes('bug') || msg.includes('error')) {
        return `fix: ${message}`;
    } else if (msg.includes('add') || msg.includes('new') || msg.includes('create')) {
        return `feat: ${message}`;
    } else if (msg.includes('update') || msg.includes('change') || msg.includes('modify')) {
        return `chore: ${message}`;
    } else if (msg.includes('remove') || msg.includes('delete')) {
        return `chore: ${message}`;
    } else if (msg.includes('doc') || msg.includes('readme')) {
        return `docs: ${message}`;
    } else if (msg.includes('test')) {
        return `test: ${message}`;
    } else {
        return `feat: ${message}`;
    }
}

// Check if node_modules or dangerous files are staged
function checkDangerousFiles(stagedFiles) {
    const cwd = process.cwd();

    // Auto detect ALL project types
    const isNode = fs.existsSync(path.join(cwd, 'package.json'));
    const isDotNet = fs.readdirSync(cwd).some(f => f.endsWith('.csproj') || f.endsWith('.sln'));
    const isPython = fs.existsSync(path.join(cwd, 'requirements.txt')) || fs.existsSync(path.join(cwd, 'Pipfile'));
    const isJava = fs.existsSync(path.join(cwd, 'pom.xml')) || fs.existsSync(path.join(cwd, 'build.gradle'));
    const isFlutter = fs.existsSync(path.join(cwd, 'pubspec.yaml'));
    const isRuby = fs.existsSync(path.join(cwd, 'Gemfile'));
    const isPhp = fs.existsSync(path.join(cwd, 'composer.json'));

    // Always dangerous — every project
    let dangerous = [
        '.env',
        '.env.local',
        '.env.production',
        '.env.development',
        '*.pem',
        '*.key',
        'secrets'
    ];

    // Stack specific
    if (isNode) {
        dangerous.push('node_modules');
    }

    if (isDotNet) {
        dangerous.push('bin/', 'obj/', 'packages/');
    }

    if (isPython) {
        dangerous.push('__pycache__/', '*.pyc', 'venv/', '.venv/', 'env/');
    }

    if (isJava) {
        dangerous.push('target/', '*.class', '.gradle/', 'build/');
    }

    if (isFlutter) {
        dangerous.push('.dart_tool/', 'build/');
    }

    if (isRuby) {
        dangerous.push('vendor/bundle/');
    }

    if (isPhp) {
        dangerous.push('vendor/');
    }

    return stagedFiles.filter(f =>
        dangerous.some(d => f.includes(d))
    );
  }

async function commitCommand(message) {
    const git = simpleGit();

    try {
        // Check if git repo
        const isRepo = await git.checkIsRepo();
        if (!isRepo) {
            console.log(
                boxen(
                    chalk.red('❌ This folder is not a Git repo!\n') +
                    chalk.yellow('Run: git init first'),
                    { padding: 1, borderColor: 'red', title: '🤖 GitBuddy Commit', titleAlignment: 'center' }
                )
            );
            return;
        }

        // Check message provided
        if (!message) {
            console.log(
                boxen(
                    chalk.red('❌ Please provide a commit message!\n\n') +
                    chalk.yellow('Example:\n') +
                    chalk.cyan('  gitbuddy commit "login page done"\n') +
                    chalk.cyan('  gitbuddy commit "fixed signup bug"'),
                    { padding: 1, borderColor: 'red', title: '🤖 GitBuddy Commit', titleAlignment: 'center' }
                )
            );
            return;
        }

        const status = await git.status();

        // Check if nothing to commit
        if (status.files.length === 0) {
            console.log(
                boxen(
                    chalk.yellow('🤔 Nothing to commit bro!\n') +
                    chalk.gray('No changes detected in your project.'),
                    { padding: 1, borderColor: 'yellow', title: '🤖 GitBuddy Commit', titleAlignment: 'center' }
                )
            );
            return;
        }

        // Stage all files
        await git.add('.');

        // Get staged files after add
        const newStatus = await git.status();
        const stagedFiles = newStatus.staged;

        // Check for dangerous files
        const dangerous = checkDangerousFiles(stagedFiles);
        if (dangerous.length > 0) {
            console.log(
                boxen(
                    chalk.red('🚨 WAIT BRO! Dangerous files detected!\n\n') +
                    chalk.red('These should NOT go to GitHub:\n') +
                    dangerous.map(f => chalk.red(`   ❌ ${f}`)).join('\n') +
                    chalk.yellow('\n\nRun gitbuddy ignore first!\n') +
                    chalk.gray('Then try gitbuddy commit again.'),
                    { padding: 1, borderColor: 'red', title: '⚠️  GitBuddy Warning', titleAlignment: 'center' }
                )
            );
            // Unstage everything
            await git.reset();
            return;
        }

        // Format commit message
        const formattedMessage = formatCommitMessage(message);

        // Do the commit
        await git.commit(formattedMessage);

        // Build success output
        let output = '';
        output += chalk.green.bold('✅ Committed successfully!\n\n');
        output += chalk.cyan(`📝 Message: "${formattedMessage}"\n\n`);
        output += chalk.white.bold('📁 Files committed:\n');
        stagedFiles.forEach(f => {
            output += chalk.green(`   + ${f}\n`);
        });
        output += chalk.gray('\nRun gitbuddy push to send to GitHub!');

        console.log(
            boxen(output, {
                padding: 1,
                borderColor: 'green',
                title: '🤖 GitBuddy Commit',
                titleAlignment: 'center'
            })
        );

    } catch (error) {
        console.log(
            boxen(
                chalk.red('❌ Commit failed!\n\n') +
                chalk.yellow('Error: ') + chalk.white(error.message) +
                chalk.gray('\n\nRun gitbuddy explain for help!'),
                { padding: 1, borderColor: 'red', title: '🤖 GitBuddy Commit', titleAlignment: 'center' }
            )
        );
    }
}

export default commitCommand;