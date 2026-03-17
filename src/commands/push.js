'use strict';

import simpleGit from 'simple-git';
import chalk from 'chalk';
import boxen from 'boxen';

async function pushCommand() {
    const git = simpleGit();

    try {
        // Check if git repo
        const isRepo = await git.checkIsRepo();
        if (!isRepo) {
            console.log(
                boxen(
                    chalk.red('❌ This folder is not a Git repo!\n') +
                    chalk.yellow('Run: git init first'),
                    { padding: 1, borderColor: 'red', title: '🤖 GitBuddy Push', titleAlignment: 'center' }
                )
            );
            return;
        }

        // Get current status
        const status = await git.status();
        const branch = status.current;

        // Check if remote exists
        const remotes = await git.getRemotes(true);
        if (remotes.length === 0) {
            console.log(
                boxen(
                    chalk.red('❌ No remote found!\n\n') +
                    chalk.yellow('You need to connect your GitHub repo first:\n\n') +
                    chalk.cyan('  git remote add origin <your-github-url>\n\n') +
                    chalk.gray('Example:\n') +
                    chalk.cyan('  git remote add origin https://github.com/username/repo.git'),
                    { padding: 1, borderColor: 'red', title: '🤖 GitBuddy Push', titleAlignment: 'center' }
                )
            );
            return;
        }

        // Check if there is anything to push
        if (status.ahead === 0) {
            console.log(
                boxen(
                    chalk.yellow('🤔 Nothing to push bro!\n\n') +
                    chalk.gray('Your GitHub is already up to date.\n') +
                    chalk.gray('Make some changes and commit first!'),
                    { padding: 1, borderColor: 'yellow', title: '🤖 GitBuddy Push', titleAlignment: 'center' }
                )
            );
            return;
        }

        // Warn if pushing directly to main or master
        if (branch === 'main' || branch === 'master') {
            console.log(
                boxen(
                    chalk.yellow(`⚠️  Bro you are pushing directly to "${branch}"!\n\n`) +
                    chalk.white('This is okay for personal projects.\n') +
                    chalk.white('But in team projects always use feature branches!\n\n') +
                    chalk.gray('Tip: gitbuddy branch "feature-name" to create a branch\n\n') +
                    chalk.cyan('Pushing anyway in 3 seconds...'),
                    { padding: 1, borderColor: 'yellow', title: '⚠️  GitBuddy Warning', titleAlignment: 'center' }
                )
            );

            // Small delay so user can see warning
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        // Show what we are pushing
        console.log(
            boxen(
                chalk.cyan(`🚀 Pushing "${branch}" to GitHub...\n`) +
                chalk.gray(`   ${status.ahead} commit(s) will be pushed`),
                { padding: 1, borderColor: 'cyan', title: '🤖 GitBuddy Push', titleAlignment: 'center' }
            )
        );

        // Do the push
        await git.push('origin', branch, ['--set-upstream']);

        console.log(
            boxen(
                chalk.green.bold('✅ Pushed successfully!\n\n') +
                chalk.white(`🌿 Branch: ${branch}\n`) +
                chalk.white(`📦 Commits pushed: ${status.ahead}\n\n`) +
                chalk.gray('Check your GitHub repo to see the changes!'),
                { padding: 1, borderColor: 'green', title: '🤖 GitBuddy Push', titleAlignment: 'center' }
            )
        );

    } catch (error) {
        console.log(
            boxen(
                chalk.red('❌ Push failed!\n\n') +
                chalk.yellow('Error: ') + chalk.white(error.message) +
                chalk.gray('\n\nRun gitbuddy explain for help!'),
                { padding: 1, borderColor: 'red', title: '🤖 GitBuddy Push', titleAlignment: 'center' }
            )
        );
    }
}

export default pushCommand;