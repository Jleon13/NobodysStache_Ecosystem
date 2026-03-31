import express from 'express';
import cors from 'cors';
import { nanoid } from 'nanoid';
import {
    readTransactions, writeTransactions,
    readSavings, writeSavings,
    readCategories, writeCategories,
    readGym, writeGym,
    readWritings, writeWritings,
    readExercises, writeExercises,
    readWritingCats, writeWritingCats
} from './data-manager.js';

const app = express();
const PORT = 3001;

const getLocalDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

app.use(cors());
app.use(express.json());

const handleAsync = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// WRITING CATEGORIES
app.get('/api/writing-categories', handleAsync(async (req, res) => res.json(await readWritingCats())));
app.post('/api/writing-categories', handleAsync(async (req, res) => {
    const list = await readWritingCats();
    if (!list.includes(req.body.name)) { list.push(req.body.name); await writeWritingCats(list); }
    res.json(list);
}));
app.delete('/api/writing-categories/:name', handleAsync(async (req, res) => {
    const list = await readWritingCats();
    const filtered = list.filter(c => c !== req.params.name);
    await writeWritingCats(filtered);
    res.json(filtered);
}));

// (Everything else remains the same)
app.get('/api/exercises', handleAsync(async (req, res) => res.json(await readExercises())));
app.post('/api/exercises', handleAsync(async (req, res) => {
    const list = await readExercises();
    if (!list.includes(req.body.name)) { list.push(req.body.name); await writeExercises(list); }
    res.json(list);
}));
app.delete('/api/exercises/:name', handleAsync(async (req, res) => {
    const list = await readExercises();
    await writeExercises(list.filter(e => e !== req.params.name));
    res.json({ success: true });
}));
app.get('/api/gym', handleAsync(async (req, res) => res.json(await readGym())));
app.post('/api/gym', handleAsync(async (req, res) => {
    const gym = await readGym();
    const entry = { id: nanoid(), ...req.body, date: getLocalDate() };
    gym.push(entry);
    await writeGym(gym);
    res.json(entry);
}));
app.delete('/api/gym/:id', handleAsync(async (req, res) => {
    const gym = await readGym();
    await writeGym(gym.filter(g => g.id !== req.params.id));
    res.json({ success: true });
}));
app.get('/api/finance-summary', handleAsync(async (req, res) => res.json(await readSavings())));
app.get('/api/categories', handleAsync(async (req, res) => res.json(await readCategories())));
app.post('/api/categories', handleAsync(async (req, res) => {
    const { type, name } = req.body;
    const data = await readCategories();
    if (!data[type].includes(name)) { data[type].push(name); await writeCategories(data); }
    res.json(data);
}));
app.delete('/api/categories/:type/:name', handleAsync(async (req, res) => {
    const { type, name } = req.params;
    const data = await readCategories();
    data[type] = data[type].filter(c => c !== name);
    await writeCategories(data);
    res.json(data);
}));
app.get('/api/transactions', handleAsync(async (req, res) => res.json(await readTransactions())));
app.post('/api/transactions', handleAsync(async (req, res) => {
    const transactions = await readTransactions();
    const newT = { id: nanoid(), ...req.body };
    transactions.push(newT);
    await writeTransactions(transactions);
    res.json(newT);
}));
app.delete('/api/transactions/:id', handleAsync(async (req, res) => {
    const t = await readTransactions();
    await writeTransactions(t.filter(i => i.id !== req.params.id));
    res.json({ success: true });
}));
app.post('/api/debts', handleAsync(async (req, res) => {
    const data = await readSavings();
    const newDebt = { id: nanoid(), ...req.body, balance: Number(req.body.amount || 0) };
    data.debts = data.debts || [];
    data.debts.push(newDebt);
    await writeSavings(data);
    res.json(newDebt);
}));
app.delete('/api/debts/:id', handleAsync(async (req, res) => {
    const data = await readSavings();
    data.debts = (data.debts || []).filter(d => d.id !== req.params.id);
    await writeSavings(data);
    res.json({ success: true });
}));
app.post('/api/debts/pay', handleAsync(async (req, res) => {
    const { debtId, amount } = req.body;
    const data = await readSavings();
    const debt = data.debts.find(d => d.id === debtId);
    if (debt) {
        debt.balance -= amount;
        if (debt.balance <= 0) data.debts = data.debts.filter(d => d.id !== debtId);
        await writeSavings(data);
        const trans = await readTransactions();
        trans.push({ id: nanoid(), type: 'egreso', amount, category: 'Debt Payment', description: `Paid: ${debt.description}`, date: getLocalDate() });
        await writeTransactions(trans);
    }
    res.json({ success: true });
}));
app.post('/api/savings/update', handleAsync(async (req, res) => {
    const { amount, action } = req.body;
    const data = await readSavings();
    if (action === 'add') data.savings += amount; else data.savings -= amount;
    await writeSavings(data);
    res.json(data);
}));
app.get('/api/writings', handleAsync(async (req, res) => res.json(await readWritings())));
app.post('/api/writings', handleAsync(async (req, res) => {
    const writings = await readWritings();
    const entry = { id: nanoid(), ...req.body, date: getLocalDate() };
    writings.push(entry);
    await writeWritings(writings);
    res.json(entry);
}));
app.delete('/api/writings/:id', handleAsync(async (req, res) => {
    const w = await readWritings();
    await writeWritings(w.filter(i => i.id !== req.params.id));
    res.json({ success: true });
}));

app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Final Ecosystem: http://localhost:${PORT}`));
