import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');

const FILES = {
    transactions: path.join(DATA_DIR, 'transacciones.txt'),
    savings: path.join(DATA_DIR, 'ahorros_deudas.txt'),
    categories: path.join(DATA_DIR, 'categories.txt'),
    gym: path.join(DATA_DIR, 'gym.txt'),
    writings: path.join(DATA_DIR, 'escritos.txt'),
    exercises: path.join(DATA_DIR, 'exercises.txt'),
    writing_categories: path.join(DATA_DIR, 'writing_categories.txt')
};

// Ensure files exist
async function initFiles() {
    for (const key in FILES) {
        try {
            await fs.access(FILES[key]);
        } catch {
            let defaultValue = '[]';
            if (key === 'savings') defaultValue = JSON.stringify({ savings: 0, debts: [] });
            if (key === 'categories') defaultValue = JSON.stringify({ income: ["Salary", "Other"], expense: ["Food", "Other"] });
            if (key === 'exercises') defaultValue = JSON.stringify(['Bench Press', 'Squat', 'Deadlift', 'Shoulder Press']);
            if (key === 'writing_categories') defaultValue = JSON.stringify(['Poetry', 'Short Story', 'Reflection', 'Thought']);
            await fs.writeFile(FILES[key], defaultValue);
        }
    }
}
initFiles();

const readJSON = async (file) => {
    try {
        const data = await fs.readFile(file, 'utf-8');
        return JSON.parse(data || '[]');
    } catch { return []; }
};
const writeJSON = async (file, data) => await fs.writeFile(file, JSON.stringify(data, null, 2));

export const readTransactions = () => readJSON(FILES.transactions);
export const writeTransactions = (data) => writeJSON(FILES.transactions, data);
export const readSavings = () => readJSON(FILES.savings);
export const writeSavings = (data) => writeJSON(FILES.savings, data);
export const readCategories = () => readJSON(FILES.categories);
export const writeCategories = (data) => writeJSON(FILES.categories, data);
export const readGym = () => readJSON(FILES.gym);
export const writeGym = (data) => writeJSON(FILES.gym, data);
export const readWritings = () => readJSON(FILES.writings);
export const writeWritings = (data) => writeJSON(FILES.writings, data);
export const readExercises = () => readJSON(FILES.exercises);
export const writeExercises = (data) => writeJSON(FILES.exercises, data);
export const readWritingCats = () => readJSON(FILES.writing_categories);
export const writeWritingCats = (data) => writeJSON(FILES.writing_categories, data);
