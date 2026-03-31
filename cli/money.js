import inquirer from 'inquirer';
import chalk from 'chalk';
import { nanoid } from 'nanoid';
import { readTransactions, writeTransactions, readCategories } from '../server/data-manager.js';

async function addTransaction() {
    console.log(chalk.blue.bold('\n--- 💰 My Money CLI (Dynamic Version) ---'));

    const categories = await readCategories();

    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'type',
            message: 'Movement type:',
            choices: [
                { name: chalk.green('Income (+)'), value: 'ingreso' },
                { name: chalk.red('Expense (-)'), value: 'egreso' }
            ]
        },
        {
            type: 'number',
            name: 'amount',
            message: 'Amount:',
            validate: value => value > 0 || 'Amount must be > 0'
        },
        {
            type: 'list',
            name: 'category',
            message: 'Category:',
            choices: (answers) => answers.type === 'ingreso'
                ? categories.income
                : categories.expense
        },
        {
            type: 'input',
            name: 'description',
            message: 'Description (optional):',
            default: ''
        }
    ]);

    const transactions = await readTransactions();

    const newTransaction = {
        id: nanoid(),
        date: new Date().toISOString().split('T')[0],
        ...answers
    };

    transactions.push(newTransaction);
    await writeTransactions(transactions);

    console.log(chalk.green.bold('\n✔ Successfully saved to data/transacciones.txt!'));
}

addTransaction().catch(err => {
    console.error(chalk.red('Error:'), err);
});
