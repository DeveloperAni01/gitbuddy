'use strict';

import chalk from 'chalk';
import boxen from 'boxen';
import { select, confirm } from '@inquirer/prompts';
import gitUtils from '../utils/git.js';
import messages from '../utils/messages.js';

async function switchCommand(branchName) {
    try {
        // Check repo state
        const repo = await gitUtils.checkRepo();
        if (!repo) return;

        // Get all branches
        const branches = await gitUtils.git.branch();
        const allBranches = branches.all.filter(b => !b.includes('remotes/'));

        // No branch name provided → show list to pick
        if (!branchName) {
            if (allBranches.length <= 1) {
                console.log(
                    boxen(
                        chalk.yellow('⚠️  No other branches to switch to!\n\n') +
                        chalk.gray('Create one first:\n') +
                        chalk.cyan('  gitbuddy branch "feature-name"'),
                        { padding: 1, borderColor: 'yellow', title: '🤖 GitBuddy Switch', titleAlignment: 'center' }
                    )
                );
                return;
            }

            const otherBranches = allBranches.filter(b => b !== repo.branch);

            branchName = await select({
                message: 'Which branch do you want to switch to?',
                choices: otherBranches.map(b => ({ name: b, value: b }))
            });
        }

        // Check if already on that branch
        if (branchName === repo.branch) {
            console.log(
                boxen(
                    chalk.yellow(`⚠️  You are already on "${branchName}"!\n\n`) +
                    chalk.gray('Run gitbuddy branch to see all branches.'),
                    { padding: 1, borderColor: 'yellow', title: '🤖 GitBuddy Switch', titleAlignment: 'center' }
                )
            );
            return;
        }

        // Check if branch exists
        if (!allBranches.includes(branchName)) {
            console.log(
                boxen(
                    chalk.red(`❌ Branch "${branchName}" does not exist!\n\n`) +
                    chalk.yellow('Available branches:\n') +
                    allBranches.map(b => chalk.cyan(`   • ${b}`)).join('\n') +
                    chalk.gray('\n\nCreate it: gitbuddy branch "' + branchName + '"'),
                    { padding: 1, borderColor: 'red', title: '🤖 GitBuddy Switch', titleAlignment: 'center' }
                )
            );
            return;
        }

        // Warn if uncommitted changes
        if (repo.modified.length > 0 || repo.untracked.length > 0) {
            console.log(
                boxen(
                    chalk.yellow('⚠️  You have uncommitted changes!\n\n') +
                    chalk.white('Switching branches might lose them!\n\n') +
                    chalk.cyan(`Switching to: ${branchName}\n\n`) +
                    chalk.gray('💡 Tip: Run gitbuddy commit first to save your work!'),
                    { padding: 1, borderColor: 'yellow', title: '⚠️  GitBuddy Warning', titleAlignment: 'center' }
                )
              );

            const proceed = await confirm({
                message: 'Switch anyway? (unsaved changes may be lost)',
                default: false
            });

            if (!proceed) {
                messages.info(
                    '💡 Tip: Run gitbuddy commit first then switch!',
                    'GitBuddy Switch'
                );
                return;
            }
        }

        // Do the switch
        await gitUtils.git.checkout(branchName);

        console.log(
            boxen(
                chalk.green.bold('✅ Switched successfully!\n\n') +
                chalk.white(`🌿 Now on: ${branchName}\n`) +
                chalk.white(`📍 Came from: ${repo.branch}\n\n`) +
                chalk.gray('💡 Tip: Run gitbuddy status to see branch state!'),
                { padding: 1, borderColor: 'green', title: '🤖 GitBuddy Switch', titleAlignment: 'center' }
            )
        );

    } catch (error) {
        messages.gitError(error.message);
    }
}

export default switchCommand;
