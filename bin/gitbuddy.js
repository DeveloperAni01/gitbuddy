#!/usr/bin/env node

import { program } from 'commander';
import statusCommand from '../src/commands/status.js';
import ignoreCommand from '../src/commands/ignore.js';
import commitCommand from '../src/commands/commit.js';
import pushCommand from '../src/commands/push.js';

program
    .name('gitbuddy')
    .description('Git for Humans — AI powered Git assistant')
    .version('1.0.0');

program
    .command('status')
    .description('Show your git status in plain English')
    .action(statusCommand);

program
    .command('ignore')
    .description('Auto fix your .gitignore file')
    .action(ignoreCommand);

program
    .command('commit <message>')
    .description('Smart commit with safety checks')
    .action(commitCommand);

program
    .command('push')
    .description('Safely push to GitHub')
    .action(pushCommand);

program.parse(process.argv);