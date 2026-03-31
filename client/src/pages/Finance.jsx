import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    TrendingUp, TrendingDown, Trash2, CreditCard, Plus, X, Wallet, PiggyBank, Settings, PieChart, Banknote, History, ExternalLink, UserMinus, UserPlus, BarChart3
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);
const API_URL = 'http://localhost:3001/api';

const getLocalDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function Finance() {
    const [data, setData] = useState({
        transactions: [], debts: [], categories: { income: [], expense: [] }, savings: 0
    });
    const [formData, setFormData] = useState({ type: 'egreso', amount: '', category: '', description: '' });
    const [debtForm, setDebtForm] = useState({ type: 'debt', amount: '', category: '', description: '' });
    const [newCat, setNewCat] = useState({ type: 'expense', name: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        const list = formData.type === 'ingreso' ? data.categories.income : data.categories.expense;
        if (list && list.length > 0 && !list.includes(formData.category)) {
            setFormData(prev => ({ ...prev, category: list[0] }));
        }
    }, [formData.type, data.categories]);

    const fetchData = async () => {
        try {
            const [{ data: t }, { data: sum }, { data: cats }] = await Promise.all([
                axios.get(`${API_URL}/transactions`),
                axios.get(`${API_URL}/finance-summary`),
                axios.get(`${API_URL}/categories`)
            ]);
            setData({ transactions: t, debts: sum.debts || [], savings: sum.savings || 0, categories: cats });
        } catch (err) { console.error(err); }
    };

    const handleTransaction = async (e) => {
        e.preventDefault();
        if (!formData.amount) return;
        setLoading(true);
        await axios.post(`${API_URL}/transactions`, { ...formData, amount: Number(formData.amount), date: getLocalDate() });
        setFormData(prev => ({ ...prev, amount: '', description: '', category: '' }));
        await fetchData();
        setLoading(false);
    };

    const handleDebt = async (e) => {
        e.preventDefault();
        if (!debtForm.amount) return;
        setLoading(true);
        await axios.post(`${API_URL}/debts`, { ...debtForm, amount: Number(debtForm.amount), date: getLocalDate() });
        setDebtForm({ type: 'debt', amount: '', category: '', description: '' });
        await fetchData();
        setLoading(false);
    };

    const addCategory = async () => {
        if (!newCat.name.trim()) return;
        const res = await axios.post(`${API_URL}/categories`, { type: newCat.type, name: newCat.name.trim() });
        setData(prev => ({ ...prev, categories: res.data }));
        setNewCat(prev => ({ ...prev, name: '' }));
        fetchData();
    };

    const deleteCategory = async (type, name) => { await axios.delete(`${API_URL}/categories/${type}/${name}`); fetchData(); };
    const deleteTransaction = async (id) => { if (window.confirm('Delete?')) { await axios.delete(`${API_URL}/transactions/${id}`); fetchData(); } };
    const deleteDebt = async (id) => { if (window.confirm('Delete?')) { await axios.delete(`${API_URL}/debts/${id}`); fetchData(); } };

    const handleSavings = async (action) => {
        const amt = prompt(`Amount to ${action}:`);
        if (!amt || isNaN(amt)) return;
        await axios.post(`${API_URL}/savings/update`, { amount: Number(amt), action });
        await fetchData();
    };

    const payDebt = async (id) => {
        const amt = prompt('Payment Amount:');
        if (!amt || isNaN(amt)) return;
        await axios.post(`${API_URL}/debts/pay`, { debtId: id, amount: Number(amt) });
        fetchData();
    };

    const inc = data.transactions.filter(t => t.type === 'ingreso').reduce((a, b) => a + b.amount, 0);
    const exp = data.transactions.filter(t => t.type === 'egreso').reduce((a, b) => a + b.amount, 0);
    const balance = inc - exp;
    const availableFunds = balance - data.savings;

    const payables = data.debts.filter(d => d.type === 'debt' || !d.type).reduce((a, b) => a + b.balance, 0);
    const receivables = data.debts.filter(d => d.type === 'receivable').reduce((a, b) => a + b.balance, 0);
    const netWealth = balance - payables + receivables;

    // Daily Traffic Distribution (Last 7 Days)
    const dates = [...new Set(data.transactions.map(t => t.date))].sort().slice(-7);
    const dailyData = {
        labels: dates.map(d => d.split('-').slice(1).join('/')),
        datasets: [
            {
                label: 'Incomes',
                data: dates.map(d => data.transactions.filter(t => t.date === d && t.type === 'ingreso').reduce((a, b) => a + b.amount, 0)),
                backgroundColor: 'rgba(16, 185, 129, 0.6)',
                borderColor: '#10b981',
                borderWidth: 1,
                borderRadius: 5
            },
            {
                label: 'Expenses',
                data: dates.map(d => data.transactions.filter(t => t.date === d && t.type === 'egreso').reduce((a, b) => a + b.amount, 0)),
                backgroundColor: 'rgba(244, 63, 94, 0.6)',
                borderColor: '#f43f5e',
                borderWidth: 1,
                borderRadius: 5
            }
        ]
    };

    const catsMap = {};
    data.transactions.filter(t => t.type === 'egreso').forEach(t => catsMap[t.category] = (catsMap[t.category] || 0) + t.amount);
    const chartData = {
        labels: Object.keys(catsMap),
        datasets: [{ data: Object.values(catsMap), backgroundColor: ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'], borderWidth: 0, hoverOffset: 12 }]
    };

    return (
        <div className="dashboard animate-fade-in">
            <header className="header">
                <h1>Finance</h1>
                <p>JULIÁN'S FINANCIAL ECOSYSTEM</p>
            </header>

            <div className="card" style={{
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                border: 'none',
                marginBottom: '2rem',
                padding: '3rem',
                textAlign: 'center'
            }}>
                <span style={{ color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.2rem', fontWeight: 600 }}>Available Funds</span>
                <h2 style={{ fontSize: '4.5rem', margin: '1rem 0', color: '#fff', fontWeight: 800 }}>${availableFunds.toLocaleString()}</h2>
                <div style={{ display: 'flex', gap: '3rem', justifyContent: 'center', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></div>
                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', fontWeight: 500 }}>Total In: ${inc.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f43f5e' }}></div>
                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', fontWeight: 500 }}>Total Out: ${exp.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="summary-row">
                <div className="stat-card" style={{ border: '1px solid #10b981', background: 'rgba(16, 185, 129, 0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="stat-label" style={{ color: '#10b981' }}>Total Savings</span>
                        <PiggyBank size={20} color="#10b981" />
                    </div>
                    <div className="stat-value" style={{ color: '#10b981', marginTop: '1rem' }}>${data.savings.toLocaleString()}</div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '1.5rem' }}>
                        <button onClick={() => handleSavings('add')} style={{ flex: 1, background: '#10b981', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}>+ Save</button>
                        <button onClick={() => handleSavings('subtract')} style={{ flex: 1, background: 'transparent', color: '#10b981', border: '1px solid #10b981', padding: '0.5rem', borderRadius: '0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}>- Withdraw</button>
                    </div>
                </div>
                <div className="stat-card" style={{ border: '1px solid #f43f5e', background: 'rgba(244, 63, 94, 0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="stat-label" style={{ color: '#f43f5e' }}>Money I Owe</span>
                        <UserMinus size={20} color="#f43f5e" />
                    </div>
                    <div className="stat-value" style={{ color: '#f43f5e', marginTop: '1rem' }}>-${payables.toLocaleString()}</div>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(244, 63, 94, 0.6)', marginTop: '0.5rem' }}>To pay others</p>
                </div>
                <div className="stat-card" style={{ border: '1px solid #10b981', background: 'rgba(16, 185, 129, 0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="stat-label" style={{ color: '#10b981' }}>Someone Owes Me</span>
                        <UserPlus size={20} color="#10b981" />
                    </div>
                    <div className="stat-value" style={{ color: '#10b981', marginTop: '1rem' }}>+${receivables.toLocaleString()}</div>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(16, 185, 129, 0.6)', marginTop: '0.5rem' }}>Collectable debt</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="stat-card" style={{ margin: 0, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="stat-label">Net Wealth</span>
                        <PieChart size={20} color="#6366f1" />
                    </div>
                    <div className="stat-value" style={{ marginTop: '1.5rem', fontSize: '2.5rem' }}>${netWealth.toLocaleString()}</div>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '1rem' }}>Total financial equity power</p>
                </div>

                <div className="card" style={{ margin: 0, padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <BarChart3 size={18} color="#6366f1" /> Daily Traffic Monitor
                        </h3>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Last 7 Active Days</span>
                    </div>
                    <div style={{ height: '200px' }}>
                        <Bar
                            data={dailyData}
                            options={{
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } },
                                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', font: { size: 10 } } }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            <main className="grid-main">
                <div className="content-left">
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><History size={20} /> History</h3>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Source / Details</th>
                                    <th>Category</th>
                                    <th style={{ textAlign: 'right' }}>Amount</th>
                                    <th style={{ textAlign: 'right' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.transactions.slice().reverse().map(t => (
                                    <tr key={t.id}>
                                        <td style={{ color: '#64748b', fontSize: '0.8rem' }}>{t.date}</td>
                                        <td style={{ fontWeight: 500 }}>{t.description || '—'}</td>
                                        <td><span className="category-tag">{t.category}</span></td>
                                        <td style={{ textAlign: 'right' }} className={t.type === 'ingreso' ? 'amount-pos' : 'amount-neg'}>
                                            {t.type === 'ingreso' ? '+' : '-'}${t.amount.toLocaleString()}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button onClick={() => deleteTransaction(t.id)} className="btn-ghost-red"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="card">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CreditCard size={20} /> Loans & Debts Management</h3>
                        {data.debts.length === 0 ? (
                            <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>No active loans. Keep it up!</p>
                        ) : (
                            data.debts.map(d => (
                                <div key={d.id} className="debt-item" style={{ borderLeft: d.type === 'receivable' ? '4px solid #10b981' : '4px solid #f43f5e', paddingLeft: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: d.type === 'receivable' ? '#10b981' : '#f43f5e', fontWeight: 700, marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                                                {d.type === 'receivable' ? 'THEY OWE ME' : 'I OWE THEM'}
                                            </div>
                                            <b style={{ fontSize: '1.1rem' }}>{d.description}</b>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>{d.category}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div className={d.type === 'receivable' ? 'amount-pos' : 'amount-neg'} style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                                                {d.type === 'receivable' ? '+' : '-'}${d.balance.toLocaleString()}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Total: ${d.amount.toLocaleString()}</div>
                                        </div>
                                    </div>
                                    <div className="debt-progress">
                                        <div className="debt-bar" style={{
                                            width: `${((d.amount - d.balance) / d.amount) * 100}%`,
                                            backgroundColor: d.type === 'receivable' ? '#10b981' : '#f43f5e'
                                        }}></div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                                        <button onClick={() => payDebt(d.id)} className="btn-primary" style={{ flex: 1, padding: '0.6rem' }}>
                                            {d.type === 'receivable' ? 'Register Collection' : 'Register Payment'}
                                        </button>
                                        <button onClick={() => deleteDebt(d.id)} className="btn-ghost-red" style={{ padding: '0.6rem' }}><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <aside className="sidebar">
                    <div className="card">
                        <h3>New Transaction</h3>
                        <form onSubmit={handleTransaction}>
                            <div className="form-group">
                                <label>Flow Type</label>
                                <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value, category: '' })}>
                                    <option value="egreso">Expense (-)</option>
                                    <option value="ingreso">Income (+)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Amount ($)</label>
                                <input type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} required placeholder="0.00" />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                    {(formData.type === 'ingreso' ? data.categories.income : data.categories.expense).map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Details</label>
                                <input type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="e.g. Rent, Grocery..." />
                            </div>
                            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '1.5rem' }}>
                                {loading ? 'Registering...' : 'Register Entry'}
                            </button>
                        </form>
                    </div>

                    <div className="card" style={{ borderLeft: '3px solid #6366f1' }}>
                        <h3>Manage Loans & Debts</h3>
                        <form onSubmit={handleDebt}>
                            <div className="form-group">
                                <label>Loan Type</label>
                                <select
                                    value={debtForm.type}
                                    onChange={e => setDebtForm({ ...debtForm, type: e.target.value })}
                                    style={{ border: `1px solid ${debtForm.type === 'receivable' ? '#10b981' : '#f43f5e'}` }}
                                >
                                    <option value="debt">I Owe Someone (Payable)</option>
                                    <option value="receivable">Someone Owes Me (Receivable)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Initial Amount</label>
                                <input type="number" value={debtForm.amount} onChange={e => setDebtForm({ ...debtForm, amount: e.target.value })} required placeholder="0.00" />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <input type="text" value={debtForm.category} onChange={e => setDebtForm({ ...debtForm, category: e.target.value })} required placeholder="Friend, Bank, Family..." />
                            </div>
                            <div className="form-group">
                                <label>Person / Entity Name</label>
                                <input type="text" value={debtForm.description} onChange={e => setDebtForm({ ...debtForm, description: e.target.value })} required placeholder="e.g. Juanito, VISA..." />
                            </div>
                            <button
                                type="submit"
                                className="btn-primary"
                                style={{
                                    width: '100%',
                                    marginTop: '1.5rem',
                                    background: debtForm.type === 'receivable' ? '#10b981' : '#f43f5e'
                                }}
                            >
                                Register {debtForm.type === 'receivable' ? 'Receivable' : 'Debt'}
                            </button>
                        </form>
                    </div>

                    <div className="card">
                        <h3>Distribution</h3>
                        <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {Object.keys(catsMap).length > 0 ? (
                                <Doughnut
                                    data={chartData}
                                    options={{
                                        maintainAspectRatio: false,
                                        plugins: { legend: { display: false } },
                                        cutout: '75%'
                                    }}
                                />
                            ) : (
                                <p style={{ color: '#64748b', fontSize: '0.8rem' }}>No data</p>
                            )}
                        </div>
                    </div>

                    <div className="card">
                        <h3>Genres / Categories</h3>
                        <div className="form-group">
                            <select value={newCat.type} onChange={e => setNewCat({ ...newCat, type: e.target.value })}>
                                <option value="expense">Expense List</option>
                                <option value="income">Income List</option>
                            </select>
                        </div>
                        <div className="cat-input-row" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                            <input type="text" value={newCat.name} onChange={e => setNewCat({ ...newCat, name: e.target.value })} onKeyPress={e => e.key === 'Enter' && addCategory()} placeholder="New genre..." style={{ flex: 1 }} />
                            <button onClick={addCategory} className="btn-square" style={{ width: '40px', height: '40px' }}><Plus size={20} /></button>
                        </div>
                        <div className="cat-tags-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {data.categories[newCat.type].map(c => (
                                <div key={c} className="chip">
                                    {c} <X size={14} style={{ cursor: 'pointer', marginLeft: '5px' }} onClick={() => deleteCategory(newCat.type, c)} />
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
}

export default Finance;
