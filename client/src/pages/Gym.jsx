import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Plus, Trash2, Dumbbell, Calendar, Activity, LineChart as LineIcon, X
} from 'lucide-react';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
const API_URL = 'http://localhost:3001/api';

function Gym() {
    const [logs, setLogs] = useState([]);
    const [exercises, setExercises] = useState([]);
    const [newExName, setNewExName] = useState('');
    const [newLog, setNewLog] = useState({ exercise: '', weight: '', reps: '' });
    const [selectedEx, setSelectedEx] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [l, e] = await Promise.all([
                axios.get(`${API_URL}/gym`),
                axios.get(`${API_URL}/exercises`)
            ]);
            setLogs(l.data);
            setExercises(e.data);
            if (e.data.length > 0) {
                if (!newLog.exercise) setNewLog(prev => ({ ...prev, exercise: e.data[0] }));
                if (!selectedEx) setSelectedEx(e.data[0]);
            }
        } catch (err) { console.error(err); }
    };

    const handleLog = async (e) => {
        e.preventDefault();
        if (!newLog.weight || !newLog.reps) return;
        setLoading(true);
        await axios.post(`${API_URL}/gym`, { ...newLog });
        setNewLog(prev => ({ ...prev, weight: '', reps: '' }));
        fetchData();
        setLoading(false);
    };

    const addExercise = async () => {
        if (!newExName.trim()) return;
        await axios.post(`${API_URL}/exercises`, { name: newExName.trim() });
        setNewExName('');
        fetchData();
    };

    const deleteExercise = async (name) => {
        if (window.confirm(`Delete ${name} from list?`)) {
            await axios.delete(`${API_URL}/exercises/${name}`);
            fetchData();
        }
    };

    const deleteLog = async (id) => { if (window.confirm('Delete?')) { await axios.delete(`${API_URL}/gym/${id}`); fetchData(); } };

    // CHART DATA
    const exerciseHistory = logs.filter(l => l.exercise === selectedEx).sort((a, b) => new Date(a.date) - new Date(b.date));
    const chartData = {
        labels: exerciseHistory.map(l => l.date),
        datasets: [{
            label: `Progress: ${selectedEx}`,
            data: exerciseHistory.map(l => l.weight),
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            tension: 0.3,
            fill: true,
            pointBackgroundColor: '#fff',
        }]
    };

    const grouped = logs.reduce((acc, log) => {
        (acc[log.date] = acc[log.date] || []).push(log);
        return acc;
    }, {});
    const dates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

    return (
        <div className="dashboard">
            <header className="header"><h1>Iron Notes</h1><p>STRENGTH LOG & PROGRESS</p></header>

            <div className="grid-main">
                <div className="content-left">
                    <div className="card" style={{ height: '400px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3>Performance Chart</h3>
                            <select value={selectedEx} onChange={e => setSelectedEx(e.target.value)} style={{ padding: '0.4rem', borderRadius: '0.5rem', width: 'auto', background: 'rgba(255,255,255,0.05)' }}>
                                {exercises.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                            </select>
                        </div>
                        <div style={{ height: '300px' }}>
                            {exerciseHistory.length > 1 ? <Line data={chartData} options={{ maintainAspectRatio: false, scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' } }, x: { grid: { display: false } } }, plugins: { legend: { display: false } } }} /> : <p style={{ color: '#475569', textAlign: 'center', marginTop: '100px' }}>Record progress for {selectedEx} to see your chart.</p>}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {dates.map(date => (
                            <div key={date} className="card" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}><Calendar size={18} style={{ color: 'var(--primary)' }} /><h3>{date}</h3></div>
                                {grouped[date].map(l => (
                                    <div key={l.id} className="exercise-card">
                                        <div><b>{l.exercise}</b><div style={{ fontSize: '0.8rem', color: '#64748b' }}>{l.weight} kg × {l.reps} reps</div></div>
                                        <button onClick={() => deleteLog(l.id)} className="btn-ghost-red"><Trash2 size={16} /></button>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                <aside className="sidebar">
                    <div className="card">
                        <h3>Record Set</h3>
                        <form onSubmit={handleLog}>
                            <div className="form-group"><label>Exercise</label>
                                <select value={newLog.exercise} onChange={e => setNewLog({ ...newLog, exercise: e.target.value })}>
                                    {exercises.map(e => <option key={e} value={e}>{e}</option>)}
                                </select></div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div className="form-group"><label>Weight (kg)</label><input type="number" value={newLog.weight} onChange={e => setNewLog({ ...newLog, weight: e.target.value })} placeholder="0" /></div>
                                <div className="form-group"><label>Reps</label><input type="number" value={newLog.reps} onChange={e => setNewLog({ ...newLog, reps: e.target.value })} placeholder="0" /></div>
                            </div>
                            <button type="submit" className="btn-primary" disabled={loading}><Plus size={18} style={{ marginRight: '8px' }} /> Record Set</button></form>
                    </div>

                    <div className="card">
                        <h3>Manage Exercises</h3>
                        <div className="cat-input-row">
                            <input type="text" placeholder="Add exercise..." value={newExName} onChange={e => setNewExName(e.target.value)} onKeyPress={e => e.key === 'Enter' && addExercise()} />
                            <button onClick={addExercise} className="btn-square"><Plus size={20} /></button>
                        </div>
                        <div className="cat-tags-container">
                            {exercises.map(ex => (
                                <div key={ex} className="chip">{ex} <X size={14} style={{ cursor: 'pointer' }} onClick={() => deleteExercise(ex)} /></div>
                            ))}
                        </div>
                    </div>

                    <div className="card" style={{ textAlign: 'center' }}>
                        <h3>Daily Stats</h3>
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '1rem' }}>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>VOLUME TODAY</div>
                            <div style={{ fontSize: '1.5rem' }}>{logs.filter(l => l.date === new Date().toISOString().split('T')[0]).reduce((a, b) => a + (b.weight * b.reps), 0).toLocaleString()} kg</div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

export default Gym;
