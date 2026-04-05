import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import {
    Plus, Trash2, Calendar, User, Tag, CheckCircle2, Circle, Clock,
    Settings, X, Edit2, CheckSquare, History, Quote, Send, Sparkles,
    ChevronDown, Zap, Award, AlertCircle, Loader2, Signal, Bell, Bookmark
} from 'lucide-react';

const PORT = 3001;
const API_URL = `http://${window.location.hostname}:${PORT}/api`;

const PASTEL_COLORS = [
    '#f87171', '#fb923c', '#fbbf24', '#facc15', '#a3e635',
    '#4ade80', '#34d399', '#2dd4bf', '#22d3ee', '#38bdf8',
    '#60a5fa', '#818cf8', '#a78bfa', '#c084fc', '#e879f9',
    '#f472b6', '#fb7185', '#94a3b8', '#9ca3af', '#64748b'
];

const formatDeadline = (dateStr) => {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr + 'T00:00:00');
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const m = months[d.getUTCMonth()];
        const day = String(d.getUTCDate()).padStart(2, '0');
        const yy = String(d.getUTCFullYear()).slice(-2);
        return `${m} - ${day} / ${yy}`;
    } catch { return dateStr; }
};

const FancyFilter = ({ value, options, onChange, label, width = '230px' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const selected = options.find(o => o.value === value) || options[0];

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} style={{ position: 'relative', width }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                style={{
                    width: '100%', height: '58px', backgroundColor: 'white', borderRadius: '22px',
                    border: '1px solid rgba(166, 77, 89, 0.15)', padding: '0 26px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    fontWeight: 900, fontSize: '11px', color: '#a64d59', letterSpacing: '1.2px',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.02)', cursor: 'pointer',
                    fontFamily: "'AverageCustom', serif", outline: 'none'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '9px', fontWeight: 900 }}>{label}</span>
                    <span style={{ textTransform: 'uppercase' }}>{selected?.label}</span>
                </div>
                <ChevronDown size={14} color="#a64d59" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
            </button>
            {isOpen && (
                <div style={{
                    position: 'absolute', top: '70px', left: 0, width: '100%', backgroundColor: 'white',
                    borderRadius: '24px', boxShadow: '0 30px 80px rgba(0,0,0,0.12)',
                    padding: '12px', zIndex: 9999, border: '1px solid rgba(0,0,0,0.05)',
                    maxHeight: '300px', overflowY: 'auto'
                }}>
                    {options.map(opt => (
                        <button
                            key={opt.value} type="button"
                            onClick={() => { onChange(opt.value); setIsOpen(false); }}
                            style={{
                                width: '100%', padding: '15px 22px', textAlign: 'left', borderRadius: '16px',
                                border: 'none', backgroundColor: value === opt.value ? '#a64d59' : 'transparent',
                                color: value === opt.value ? 'white' : '#1e293b',
                                fontWeight: 900, fontSize: '11px', textTransform: 'uppercase',
                                cursor: 'pointer', fontFamily: "'AverageCustom', serif", marginBottom: '4px'
                            }}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [mantras, setMantras] = useState([]);
    const [specialDeadlines, setSpecialDeadlines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingMantra, setSavingMantra] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [catForm, setCatForm] = useState({ name: '', color: PASTEL_COLORS[0] });
    const [deadForm, setDeadForm] = useState({ title: '', date: '' });
    const [mantraInput, setMantraInput] = useState('');

    const [formData, setFormData] = useState({
        title: '', description: '', status: 'todo',
        date: new Date().toISOString().split('T')[0],
        category: '', author: '', priority: 'Medium'
    });

    const [filter, setFilter] = useState({ status: 'active', category: 'All' });

    useEffect(() => {
        fetchData();
        document.body.classList.add('task-theme-active');
        return () => document.body.classList.remove('task-theme-active');
    }, []);

    const fetchData = async () => {
        try {
            const results = await Promise.all([
                axios.get(`${API_URL}/tasks`).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/task-categories`).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/mantras`).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/special-deadlines`).catch(() => ({ data: [] }))
            ]);
            setTasks(results[0].data || []);
            setCategories(results[1].data || []);
            setMantras(results[2].data || []);
            setSpecialDeadlines(results[3].data || []);
            if (results[1].data?.length > 0 && !formData.category) {
                setFormData(prev => ({ ...prev, category: results[1].data[0].name }));
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleAddMantra = async (e) => {
        if (e) e.preventDefault();
        const textToSave = mantraInput.trim();
        if (!textToSave || savingMantra) return;
        setSavingMantra(true);
        try {
            await axios.post(`${API_URL}/mantras`, { text: textToSave });
            setMantraInput('');
            await fetchData();
        } catch (err) { console.error(err); } finally { setSavingMantra(false); }
    };

    const deleteMantra = async (id) => {
        try { await axios.delete(`${API_URL}/mantras/${id}`); await fetchData(); } catch (err) { console.error(err); }
    };

    const handleAddDead = async (e) => {
        e.preventDefault();
        if (!deadForm.title || !deadForm.date) return;
        try {
            await axios.post(`${API_URL}/special-deadlines`, deadForm);
            setDeadForm({ title: '', date: '' });
            await fetchData();
        } catch (err) { console.error(err); }
    };

    const deleteDead = async (id) => {
        try { await axios.delete(`${API_URL}/special-deadlines/${id}`); await fetchData(); } catch (err) { console.error(err); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title) return;
        try {
            if (editingTask) {
                await axios.post(`${API_URL}/tasks/full-update`, { id: editingTask.id, ...formData });
            } else {
                await axios.post(`${API_URL}/tasks`, formData);
            }
            setIsModalOpen(false); await fetchData();
        } catch (err) { console.error(err); }
    };

    const handleAddCat = async (e) => {
        e.preventDefault();
        if (!catForm.name) return;
        try {
            await axios.post(`${API_URL}/task-categories`, catForm);
            setCatForm({ name: '', color: PASTEL_COLORS[0] });
            await fetchData();
        } catch (err) { console.error(err); }
    };

    const deleteCat = async (name) => {
        try { await axios.delete(`${API_URL}/task-categories/${name}`); await fetchData(); } catch (err) { console.error(err); }
    };

    const updateStatus = async (id, status) => {
        try { await axios.post(`${API_URL}/tasks/update`, { id, status }); await fetchData(); } catch (err) { console.error(err); }
    };

    const deleteTask = async (id) => {
        if (!window.confirm('Delete mission?')) return;
        try { await axios.delete(`${API_URL}/tasks/${id}`); await fetchData(); } catch (err) { console.error(err); }
    };

    const activeTasks = useMemo(() => {
        return (tasks || []).filter(t => {
            const isDone = t.status === 'done';
            const matchesCat = filter.category === 'All' || t.category === filter.category;
            let matchesStatus = true;
            if (filter.status === 'active') matchesStatus = !isDone;
            else if (filter.status === 'done') matchesStatus = isDone;
            else if (filter.status === 'todo') matchesStatus = t.status === 'todo';
            else if (filter.status === 'in-progress') matchesStatus = t.status === 'in-progress';
            return matchesCat && matchesStatus;
        }).sort((a, b) => {
            const pOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
            if (pOrder[a.priority] !== pOrder[b.priority]) return pOrder[a.priority] - pOrder[b.priority];
            return new Date(a.date) - new Date(b.date);
        });
    }, [tasks, filter]);

    const completedTasks = useMemo(() => {
        return (tasks || []).filter(t => t.status === 'done').sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [tasks]);

    const displayDeadlines = useMemo(() => {
        return (specialDeadlines || []).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 4);
    }, [specialDeadlines]);

    const stats = useMemo(() => ({
        total: (tasks || []).length,
        done: (tasks || []).filter(t => t.status === 'done').length,
        pending: (tasks || []).filter(t => t.status !== 'done').length
    }), [tasks]);

    const latestMantra = useMemo(() => {
        if (!mantras || mantras.length === 0) return null;
        return mantras[mantras.length - 1];
    }, [mantras]);

    const catOptions = [{ value: 'All', label: 'All Projects' }, ...(categories || []).map(c => ({ value: c.name, label: c.name }))];
    const statusOptions = [{ value: 'active', label: 'All Active' }, { value: 'todo', label: 'Pending' }, { value: 'in-progress', label: 'Started' }, { value: 'done', label: 'Done' }];

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'AverageCustom', fontWeight: 900, color: '#a64d59' }}>INITIALIZING ECOSYSTEM...</div>;

    const s = {
        page: { display: 'grid', gridTemplateColumns: '430px minmax(0, 1fr) 300px', gap: '60px', maxWidth: '1700px', margin: '0 auto', padding: '100px 50px', fontFamily: "'AverageCustom', serif" },
        header: { textAlign: 'center', marginBottom: '80px' },
        title: { color: '#a64d59', fontSize: '6rem', fontWeight: 900, letterSpacing: '-0.1em', marginBottom: '15px' },
        bubble: { backgroundColor: 'white', padding: '26px 40px', borderRadius: '32px', boxShadow: '0 12px 35px rgba(0,0,0,0.01)', display: 'flex', alignItems: 'baseline', gap: '15px', minWidth: '180px', justifyContent: 'center' },
        statLabel: { fontSize: '11px', fontWeight: 900, color: '#475569', letterSpacing: '2px', textTransform: 'uppercase' },
        card: (color) => ({ backgroundColor: 'white', padding: '38px', borderRadius: '44px', display: 'flex', alignItems: 'start', gap: '30px', marginBottom: '25px', borderLeft: `22px solid ${color || '#cbd5e1'}`, boxShadow: '0 15px 45px rgba(0,0,0,0.015)' }),
        vinoBtn: { height: '58px', backgroundColor: '#a64d59', color: 'white', borderRadius: '22px', fontWeight: 900, fontSize: '11px', display: 'flex', alignItems: 'center', gap: '12px', border: 'none', cursor: 'pointer', padding: '0 32px', boxShadow: '0 12px 30px rgba(166, 77, 89, 0.25)', letterSpacing: '1.2px', textTransform: 'uppercase' },
        footerText: { fontSize: '10px', color: '#475569', fontWeight: 900, letterSpacing: '1px' },
        modalInput: { width: '100%', height: '64px', backgroundColor: '#f8fafc', borderRadius: '22px', border: 'none', padding: '0 28px', fontWeight: 900, fontSize: '18px', color: '#1e293b', outline: 'none' }
    };

    return (
        <div style={{ backgroundColor: '#f5faf5', minHeight: '100vh' }}>
            <div style={s.page}>
                {/* LEFT: MANTRA */}
                <aside>
                    <div style={{ backgroundColor: 'white', borderRadius: '45px', padding: '45px', boxShadow: '0 10px 40px rgba(0,0,0,0.01)', border: '1px solid rgba(166, 77, 89, 0.08)', minHeight: '650px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
                            <h2 style={{ fontSize: '11px', fontWeight: 900, color: '#a64d59', textTransform: 'uppercase', letterSpacing: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}><Zap size={22} /> Mantra</h2>
                            <Signal size={12} color="#10b981" />
                        </div>

                        <div style={{ position: 'relative', marginBottom: '28px' }}>
                            <textarea
                                value={mantraInput}
                                onChange={e => setMantraInput(e.target.value)}
                                style={{
                                    width: '100%', height: '160px', backgroundColor: '#f8fafc', borderRadius: '28px',
                                    border: '1px solid rgba(0,0,0,0.05)', padding: '26px', fontSize: '16px',
                                    fontWeight: 900, outline: 'none', resize: 'none', color: '#1e293b',
                                    fontFamily: 'inherit', lineHeight: 1.5
                                }}
                                placeholder="Change your perspective..."
                            />
                        </div>
                        <button onClick={handleAddMantra} disabled={savingMantra} type="button" style={{ width: '100%', height: '58px', backgroundColor: '#a64d59', color: 'white', borderRadius: '20px', border: 'none', fontWeight: 900, letterSpacing: '2.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', boxShadow: '0 10px 25px rgba(166, 77, 89, 0.2)', marginBottom: '45px' }}>
                            {savingMantra ? <Loader2 className="animate-spin" /> : <><Send size={18} /> SET MANTRA</>}
                        </button>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', backgroundColor: 'rgba(166, 77, 89, 0.04)', borderRadius: '35px', padding: '40px' }}>
                            {latestMantra ? (
                                <>
                                    <Quote size={45} color="#a64d59" style={{ marginBottom: '30px', opacity: 0.15, transform: 'rotate(180deg)' }} />
                                    <div style={{ fontSize: '2.8rem', fontWeight: 900, lineHeight: 1.2, color: '#a64d59', fontStyle: 'italic', marginBottom: '35px' }}>
                                        "{latestMantra.text}"
                                    </div>
                                    <button onClick={() => deleteMantra(latestMantra.id)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', opacity: 0.5 }}>
                                        <Trash2 size={18} />
                                    </button>
                                </>
                            ) : (
                                <div style={{ opacity: 0.1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <Quote size={90} style={{ marginBottom: '25px' }} />
                                    <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '5px' }}>YOUR DAILY FOCUS</span>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>

                <main style={{ minWidth: 0 }}>
                    <header style={s.header}>
                        <h1 style={s.title}>TO - DO</h1>

                        <div style={{ display: 'flex', gap: '25px', justifyContent: 'center', marginBottom: '45px' }}>
                            <div style={s.bubble}><span style={{ fontSize: '3.6rem', fontWeight: 900, color: '#1e293b' }}>{stats.total}</span><span style={s.statLabel}>total</span></div>
                            <div style={s.bubble}><span style={{ fontSize: '3.6rem', fontWeight: 900, color: '#10b981' }}>{stats.done}</span><span style={s.statLabel}>done</span></div>
                            <div style={s.bubble}><span style={{ fontSize: '3.6rem', fontWeight: 900, color: '#f59e0b' }}>{stats.pending}</span><span style={s.statLabel}>active</span></div>
                        </div>

                        {displayDeadlines.length > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                                {displayDeadlines.map(d => (
                                    <div key={d.id} style={{
                                        backgroundColor: 'white', borderRadius: '24px', padding: '12px 24px',
                                        display: 'flex', alignItems: 'center', gap: '15px',
                                        border: '1px solid rgba(166, 77, 89, 0.1)', boxShadow: '0 8px 30px rgba(0,0,0,0.015)'
                                    }}>
                                        <Bell size={14} color="#f43f5e" />
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ fontSize: '11px', fontWeight: 900, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '1px' }}>{d.title}</div>
                                            <div style={{ fontSize: '10px', fontWeight: 900, color: '#f43f5e', textTransform: 'uppercase' }}>{formatDeadline(d.date).split(' / ')[0].replace(' - ', ' ')}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </header>

                    <div style={{ display: 'flex', gap: '15px', marginBottom: '55px' }}>
                        <FancyFilter label="PRO" width="280px" value={filter.category} options={catOptions} onChange={v => setFilter({ ...filter, category: v })} />
                        <FancyFilter label="STAT" width="220px" value={filter.status} options={statusOptions} onChange={v => setFilter({ ...filter, status: v })} />
                        <button onClick={() => setIsSettingsOpen(true)} type="button" style={{ width: '60px', height: '60px', backgroundColor: 'white', borderRadius: '22px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Settings size={26} /></button>
                        <button onClick={() => { setEditingTask(null); setIsModalOpen(true); }} type="button" style={{ ...s.vinoBtn, flex: 1, justifyContent: 'center' }}><Plus size={22} /> NEW MISSION</button>
                    </div>

                    {activeTasks.length === 0 ? <div style={{ textAlign: 'center', padding: '120px 0', opacity: 0.1 }}><CheckSquare size={140} style={{ margin: '0 auto' }} /></div> :
                        activeTasks.map(task => (
                            <div key={task.id} style={s.card(categories.find(c => c.name === task.category)?.color)}>
                                <button onClick={() => updateStatus(task.id, task.status === 'done' ? 'todo' : 'done')} type="button" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                    {task.status === 'done' ? <CheckCircle2 color="#10b981" size={48} /> : <Circle color="#ebeff3" size={48} />}
                                </button>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '2.2rem', fontWeight: 900, margin: '0 0 8px 0', color: task.status === 'done' ? '#94a3b8' : '#1e293b', textDecoration: task.status === 'done' ? 'line-through' : 'none', lineHeight: 1.2 }}>{task.title}</h3>
                                    <p style={{ fontSize: '17px', color: '#475569', margin: '0 0 24px 0', lineHeight: 1.6 }}>{task.description}</p>
                                    <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                                        <span style={s.footerText}>📅 {formatDeadline(task.date)}</span>
                                        <span style={{ ...s.footerText, color: task.priority === 'High' ? '#f43f5e' : '#f59e0b' }}>⚡ {task.priority}</span>
                                        <div style={{ padding: '6px 14px', backgroundColor: '#f1f5f9', borderRadius: '12px', ...s.footerText }}>#{task.status?.toUpperCase()}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '20px' }}>
                                    <button onClick={() => { setEditingTask(task); setFormData({ ...task }); setIsModalOpen(true); }} type="button" style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}><Edit2 size={22} /></button>
                                    <button onClick={() => deleteTask(task.id)} type="button" style={{ background: 'none', border: 'none', color: 'rgba(244,63,94,0.1)', cursor: 'pointer' }}><Trash2 size={22} /></button>
                                </div>
                            </div>
                        ))
                    }
                </main>

                <aside>
                    <div style={{ backgroundColor: 'white', borderRadius: '40px', padding: '35px', boxShadow: '0 10px 40px rgba(0,0,0,0.01)', border: '1px solid rgba(166, 77, 89, 0.05)' }}>
                        <h2 style={{ fontSize: '11px', fontWeight: 900, color: '#a64d59', textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '35px', display: 'flex', alignItems: 'center', gap: '10px' }}><History size={20} /> Records</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {completedTasks.map(t => (
                                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '18px 22px', backgroundColor: '#f8fafc', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.01)' }}>
                                    <CheckCircle2 color="#10b981" size={22} />
                                    <span style={{ fontSize: '14px', fontWeight: 900, textDecoration: 'line-through', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                                    <button onClick={() => updateStatus(t.id, 'todo')} type="button" style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}><Plus size={18} style={{ transform: 'rotate(45deg)' }} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>

            {/* MODAL MISSION */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(166, 77, 89, 0.25)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '40px' }}>
                    <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '560px', borderRadius: '54px', padding: '60px', position: 'relative', boxShadow: '0 50px 150px rgba(0,0,0,0.2)' }}>
                        <button onClick={() => setIsModalOpen(false)} type="button" style={{ position: 'absolute', top: '40px', right: '40px', background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}><X size={34} /></button>
                        <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '45px', color: '#a64d59' }}>{editingTask ? 'Edit' : 'New'} Mission</h2>
                        <form onSubmit={handleSubmit}>
                            <input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} style={{ ...s.modalInput, marginBottom: '18px' }} placeholder="Title" required />
                            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ ...s.modalInput, height: '150px', padding: '28px', marginBottom: '28px', resize: 'none', outline: 'none' }} placeholder="Objective..." />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '40px' }}>
                                <div><label style={{ fontSize: '9px', fontWeight: 900, color: '#94a3b8', display: 'block', marginBottom: '12px' }}>STATUS</label>
                                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} style={{ ...s.modalInput, height: '60px', padding: '0 20px', fontSize: '14px' }}><option value="todo">Pending</option><option value="in-progress">Started</option><option value="done">Done</option></select>
                                </div>
                                <div><label style={{ fontSize: '9px', fontWeight: 900, color: '#94a3b8', display: 'block', marginBottom: '12px' }}>PRIORITY</label>
                                    <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })} style={{ ...s.modalInput, height: '60px', padding: '0 20px', fontSize: '14px' }}><option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option></select>
                                </div>
                                <div><label style={{ fontSize: '9px', fontWeight: 900, color: '#94a3b8', display: 'block', marginBottom: '12px' }}>DATE</label>
                                    <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} style={{ ...s.modalInput, height: '60px', padding: '0 20px', fontSize: '14px' }} />
                                </div>
                                <div><label style={{ fontSize: '9px', fontWeight: 900, color: '#94a3b8', display: 'block', marginBottom: '12px' }}>PROJECT</label>
                                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} style={{ ...s.modalInput, height: '60px', padding: '0 20px', fontSize: '14px' }}>{categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}</select>
                                </div>
                            </div>
                            <button type="submit" style={{ ...s.vinoBtn, width: '100%', height: '80px', fontSize: '15px', justifyContent: 'center' }}>SYNC MISSION DATA</button>
                        </form>
                    </div>
                </div>
            )}

            {isSettingsOpen && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(166, 77, 89, 0.15)', backdropFilter: 'blur(30px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '900px', padding: '55px', borderRadius: '50px', position: 'relative', boxShadow: '0 40px 100px rgba(0,0,0,0.15)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px' }}>
                        <button onClick={() => setIsSettingsOpen(false)} type="button" style={{ position: 'absolute', top: '35px', right: '35px', background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}><X size={32} /></button>

                        {/* SECTION 1: FOLDERS */}
                        <div>
                            <h2 style={{ fontSize: '2.4rem', fontWeight: 900, marginBottom: '40px', color: '#a64d59' }}>Folders</h2>
                            <form onSubmit={handleAddCat} style={{ marginBottom: '40px' }}>
                                <input value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} style={{ ...s.modalInput, height: '60px', marginBottom: '20px' }} placeholder="Folder Name" />
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
                                    {PASTEL_COLORS.map(col => (
                                        <button key={col} type="button" style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: col, border: catForm.color === col ? '3px solid #1e293b' : 'none', padding: 0 }} onClick={() => setCatForm({ ...catForm, color: col })} />
                                    ))}
                                </div>
                                <button type="submit" style={{ ...s.vinoBtn, width: '100%', justifyContent: 'center', backgroundColor: '#1e293b', boxShadow: 'none' }}>PROCESS FOLDER</button>
                            </form>
                            <div className="custom-scrollbar" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                {categories.map(c => (
                                    <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', backgroundColor: '#f8fafc', borderRadius: '24px', marginBottom: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
                                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: c.color }}></div>
                                            <span style={{ fontWeight: 900, fontSize: '14px', color: '#1e293b' }}>{c.name}</span>
                                        </div>
                                        <button onClick={() => deleteCat(c.name)} type="button" style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}><Trash2 size={20} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* SECTION 2: SPECIAL DEADLINES */}
                        <div>
                            <h2 style={{ fontSize: '2.4rem', fontWeight: 900, marginBottom: '40px', color: '#f43f5e' }}>Papers & Events</h2>
                            <form onSubmit={handleAddDead} style={{ marginBottom: '40px' }}>
                                <input value={deadForm.title} onChange={e => setDeadForm({ ...deadForm, title: e.target.value })} style={{ ...s.modalInput, height: '60px', marginBottom: '15px' }} placeholder="Conference Name" />
                                <input type="date" value={deadForm.date} onChange={e => setDeadForm({ ...deadForm, date: e.target.value })} style={{ ...s.modalInput, height: '60px', marginBottom: '20px' }} />
                                <button type="submit" style={{ ...s.vinoBtn, width: '100%', justifyContent: 'center', backgroundColor: '#f43f5e', boxShadow: 'none' }}>ADD DEADLINE</button>
                            </form>
                            <div className="custom-scrollbar" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                {specialDeadlines.map(d => (
                                    <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', backgroundColor: '#fff1f2', borderRadius: '24px', marginBottom: '10px' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 900, fontSize: '14px', color: '#1e293b' }}>{d.title}</div>
                                            <div style={{ fontSize: '10px', fontWeight: 900, color: '#f43f5e' }}>{formatDeadline(d.date)}</div>
                                        </div>
                                        <button onClick={() => deleteDead(d.id)} type="button" style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer' }}><Trash2 size={20} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tasks;
