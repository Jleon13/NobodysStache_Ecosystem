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
    writing_categories: path.join(DATA_DIR, 'writing_categories.txt'),
    dictionary: path.join(DATA_DIR, 'dictionary.txt'),
    dictionary_categories: path.join(DATA_DIR, 'dictionary_categories.txt'),
    abbreviations: path.join(DATA_DIR, 'abbreviations.txt'),
    tasks: path.join(DATA_DIR, 'tasks.txt'),
    task_categories: path.join(DATA_DIR, 'task_categories.txt'),
    mantras: path.join(DATA_DIR, 'mantras.txt'),
    special_deadlines: path.join(DATA_DIR, 'special_deadlines.txt')
};

// Ensure files exist
export async function initFiles() {
    for (const key in FILES) {
        try {
            await fs.access(FILES[key]);
        } catch {
            let defaultValue = '[]';
            if (key === 'savings') defaultValue = JSON.stringify({ savings: 0, debts: [] });
            if (key === 'categories') defaultValue = JSON.stringify({ income: ["Salary", "Other"], expense: ["Food", "Other"] });
            if (key === 'exercises') defaultValue = JSON.stringify(['Bench Press', 'Squat', 'Deadlift', 'Shoulder Press']);
            if (key === 'writing_categories') defaultValue = JSON.stringify(['Poetry', 'Short Story', 'Reflection', 'Thought']);
            if (key === 'dictionary_categories') defaultValue = JSON.stringify(['General', 'Geografía', 'Artes', 'Ciencias']);
            if (key === 'abbreviations') defaultValue = JSON.stringify([
                { abbr: 'adj.', meaning: 'adjetivo' },
                { abbr: 'n.', meaning: 'nombre' },
                { abbr: 'v.', meaning: 'verbo' },
                { abbr: 'm.', meaning: 'masculino' },
                { abbr: 'f.', meaning: 'femenino' }
            ]);
            if (key === 'task_categories') defaultValue = JSON.stringify([
                { name: 'Work', color: '#90a4ae' },
                { name: 'Personal', color: '#ce93d8' },
                { name: 'Shopping', color: '#ffcc80' },
                { name: 'Health', color: '#81c784' },
                { name: 'Finance', color: '#64b5f6' }
            ]);
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
export const readDictionary = () => readJSON(FILES.dictionary);
export const writeDictionary = (data) => writeJSON(FILES.dictionary, data);
export const readDictionaryCats = () => readJSON(FILES.dictionary_categories);
export const writeDictionaryCats = (data) => writeJSON(FILES.dictionary_categories, data);
export const readAbbreviations = () => readJSON(FILES.abbreviations);
export const writeAbbreviations = (data) => writeJSON(FILES.abbreviations, data);
export const readTasks = () => readJSON(FILES.tasks);
export const writeTasks = (data) => writeJSON(FILES.tasks, data);
export const readTaskCats = () => readJSON(FILES.task_categories);
export const writeTaskCats = (data) => writeJSON(FILES.task_categories, data);
export const readMantras = () => readJSON(FILES.mantras);
export const writeMantras = (data) => writeJSON(FILES.mantras, data);
export const readSpecialDeadlines = () => readJSON(FILES.special_deadlines);
export const writeSpecialDeadlines = (data) => writeJSON(FILES.special_deadlines, data);
