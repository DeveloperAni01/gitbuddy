'use strict';

import simpleGit from 'simple-git';
import chalk from 'chalk';
import boxen from 'boxen';

async function statusCommand() {
    const git = simpleGit();

    try {
        // Check if this is a git repo first
        const isRepo = await git.checkIsRepo();
        if (!isRepo) {
            console.log(
                boxen(
                    chalk.red('❌ Bro this folder is not a Git repo!\n') +
                    chalk.yellow('Run: git init to start one'),
                    { padding: 1, borderColor: 'red', title: '⚠️  GitBuddy' }
                )
            );
            return;
        }

        // Get status
        const status = await git.status();

        // Get current branch
        const branch = status.current;

        // Build output
        let output = '';

        // Branch info
        output += chalk.cyan.bold(`🌿 Branch: ${branch}\n\n`);

        // Staged files
        if (status.staged.length > 0) {
            output += chalk.green.bold('✅ Staged (ready to commit):\n');
            status.staged.forEach(file => {
                output += chalk.green(`   + ${file}\n`);
            });
            output += '\n';
        }

        // Modified files
        if (status.modified.length > 0) {
            output += chalk.yellow.bold('📝 Modified (not staged yet):\n');
            status.modified.forEach(file => {
                output += chalk.yellow(`   ~ ${file}\n`);
            });
            output += '\n';
        }

        // Untracked files
        if (status.not_added.length > 0) {
            output += chalk.red.bold('❓ Untracked (git doesn\'t know these):\n');
            status.not_added.forEach(file => {
                output += chalk.red(`   ? ${file}\n`);
            });
            output += '\n';
        }

        // Ahead/behind info
        if (status.ahead > 0) {
            output += chalk.magenta(`🚀 Ahead of remote by ${status.ahead} commit(s) — don't forget to push!\n`);
        }
        if (status.behind > 0) {
            output += chalk.magenta(`⬇️  Behind remote by ${status.behind} commit(s) — you should pull first!\n`);
        }

        // Clean repo
        if (
            status.staged.length === 0 &&
            status.modified.length === 0 &&
            status.not_added.length === 0
        ) {
            output += chalk.green('✨ Everything is clean! Nothing to commit.\n');
        }

        // Print inside a box
        console.log(
            boxen(output, {
                padding: 1,
                borderColor: 'cyan',
                title: '🤖 GitBuddy Status',
                titleAlignment: 'center'
            })
        );

    } catch (error) {
        console.log(chalk.red('Something went wrong: ' + error.message));
    }
}

export default statusCommand;