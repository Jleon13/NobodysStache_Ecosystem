import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Trash2, Library, Globe, Palette, Beaker, Book, Info, HelpCircle, X, Settings } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

const Dictionary = () => {
    const [entries, setEntries] = useState([]);
    const [categories, setCategories] = useState([]);
    const [abbreviations, setAbbreviations] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [settingsTab, setSettingsTab] = useState('abbr');

    // Form states
    const [formData, setFormData] = useState({
        word: '',
        category: 'General',
        abbreviation: '',
        definition: '',
        pronunciation: '',
        etymology: ''
    });

    const [abbrForm, setAbbrForm] = useState({ abbr: '', meaning: '' });
    const [catForm, setCatForm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [entriesRes, catsRes, abbrRes] = await Promise.all([
                axios.get(`${API_URL}/dictionary`),
                axios.get(`${API_URL}/dictionary-categories`),
                axios.get(`${API_URL}/abbreviations`)
            ]);
            setEntries(entriesRes.data);
            setCategories(catsRes.data);
            setAbbreviations(abbrRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.word || !formData.definition) return;
        try {
            await axios.post(`${API_URL}/dictionary`, formData);
            setFormData({ word: '', category: 'General', abbreviation: '', definition: '', pronunciation: '', etymology: '' });
            fetchData();
        } catch (error) {
            console.error('Error saving entry:', error);
        }
    };

    const handleAddAbbr = async (e) => {
        e.preventDefault();
        if (!abbrForm.abbr || !abbrForm.meaning) return;
        try {
            await axios.post(`${API_URL}/abbreviations`, abbrForm);
            setAbbrForm({ abbr: '', meaning: '' });
            fetchData();
        } catch (error) {
            console.error('Error saving abbreviation:', error);
        }
    };

    const handleDeleteAbbr = async (abbr) => {
        try {
            await axios.delete(`${API_URL}/abbreviations/${abbr}`);
            fetchData();
        } catch (error) {
            console.error('Error deleting abbreviation:', error);
        }
    };

    const handleAddCat = async (e) => {
        e.preventDefault();
        if (!catForm) return;
        try {
            await axios.post(`${API_URL}/dictionary-categories`, { name: catForm });
            setCatForm('');
            fetchData();
        } catch (error) {
            console.error('Error saving category:', error);
        }
    };

    const handleDeleteCat = async (name) => {
        if (['General', 'Geografía', 'Artes', 'Ciencias'].includes(name)) {
            alert('Default categories cannot be deleted.');
            return;
        }
        try {
            await axios.delete(`${API_URL}/dictionary-categories/${name}`);
            fetchData();
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    const handleDeleteEntry = async (id) => {
        if (!window.confirm('Delete this entry?')) return;
        try {
            await axios.delete(`${API_URL}/dictionary/${id}`);
            fetchData();
        } catch (error) {
            console.error('Error deleting entry:', error);
        }
    };

    const sortedEntries = [...entries].sort((a, b) => a.word.localeCompare(b.word));

    const groupedEntries = sortedEntries
        .filter(e =>
            (selectedCategory === 'All' || e.category === selectedCategory) &&
            (e.word.toLowerCase().includes(search.toLowerCase()) ||
                e.definition.toLowerCase().includes(search.toLowerCase()) ||
                e.abbreviation?.toLowerCase().includes(search.toLowerCase()))
        )
        .reduce((acc, entry) => {
            const firstLetter = entry.word.charAt(0).toUpperCase();
            if (!acc[firstLetter]) acc[firstLetter] = [];
            acc[firstLetter].push(entry);
            return acc;
        }, {});

    const getCategoryIcon = (cat) => {
        switch (cat) {
            case 'Geografía': return <Globe size={14} />;
            case 'Artes': return <Palette size={14} />;
            case 'Ciencias': return <Beaker size={14} />;
            default: return <Book size={14} />;
        }
    };

    const getAbbrMeaning = (abbr) => {
        const found = abbreviations.find(a => a.abbr === abbr);
        return found ? found.meaning : '';
    };

    return (
        <div className="dashboard vintage-theme">
            <header className="header">
                <h1 className="main-title">Pequeño Larousse</h1>
                <p>ILUSTRADO • 1983</p>
                <div className="flex justify-center mt-4">
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="chip bg-indigo-500-5 text-indigo-400 border-indigo-500-10 hover:bg-indigo-500-10 transition-colors cursor-pointer"
                    >
                        <Settings size={14} /> Lexicon Registry
                    </button>
                </div>
            </header>

            <div className="grid-main">
                <main>
                    <div className="card shadow-xl overflow-hidden border-0 bg-transparent shadow-none p-0">
                        <div className="flex flex-col md-flex-row justify-between items-center mb-10 gap-4 bg-white-5 p-4 rounded-3xl border border-white-5">
                            <div className="relative w-full md-w-64">
                                <Search className="absolute left-3 top-1-2 translate-y-neg-1-2 text-slate-600" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search word or abbreviation..."
                                    className="pl-10 h-10 w-full"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 w-full md-w-auto overflow-x-auto pb-2 md-pb-0">
                                <button
                                    onClick={() => setSelectedCategory('All')}
                                    className={`nav-link ${selectedCategory === 'All' ? 'active' : ''}`}
                                >
                                    All
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`nav-link ${selectedCategory === cat ? 'active' : ''}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="dictionary-list space-y-24 max-h-800 overflow-y-auto pr-4 custom-scrollbar pb-20 pt-8">
                            {Object.keys(groupedEntries).length === 0 ? (
                                <div className="text-center py-20 text-slate-600 italic text-xl">
                                    No entries found in this collection.
                                </div>
                            ) : (
                                Object.keys(groupedEntries).sort().map((letter, idx) => (
                                    <div key={letter} className={`alphabet-section ${idx === 0 ? 'mt-4' : 'mt-16'}`}>
                                        <div className="sticky top-0 z-10 flex items-center gap-4 mb-10 pt-4 bg-transparent">
                                            <div className="alphabet-marker">{letter}</div>
                                            <div className="h-px flex-1 bg-white-5 opacity-20"></div>
                                        </div>
                                        <div className="space-y-8">
                                            {groupedEntries[letter].map(entry => (
                                                <div key={entry.id} className="dictionary-entry p-6 rounded-2xl bg-card border border-white-5 hover:border-white-15 transition-all group shadow-sm">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-baseline gap-2">
                                                                <h2 className="text-2xl font-bold uppercase tracking-tight text-main">{entry.word}</h2>
                                                                {entry.abbreviation && (
                                                                    <span
                                                                        className="text-indigo-400 font-serif italic text-lg cursor-help"
                                                                        title={getAbbrMeaning(entry.abbreviation)}
                                                                    >
                                                                        {entry.abbreviation}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <span className="chip text-[11px] uppercase font-bold text-slate-600">
                                                                    {getCategoryIcon(entry.category)} {entry.category}
                                                                </span>
                                                                {entry.pronunciation && <span className="text-sm text-slate-500 italic">[{entry.pronunciation}]</span>}
                                                                {entry.etymology && (
                                                                    <span className="text-sm text-slate-400 flex items-center gap-1">
                                                                        <Info size={14} /> {entry.etymology}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteEntry(entry.id)}
                                                            className="btn-ghost-red opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                    <p className="text-slate-700 leading-relaxed text-base mt-4 font-serif">
                                                        {entry.definition}
                                                    </p>
                                                    <div className="mt-4 flex justify-end">
                                                        <span className="text-[10px] text-slate-500 font-mono italic opacity-50">
                                                            REG: {entry.date}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </main>

                <aside>
                    <div className="card sticky top-24 bg-card border border-white-5 shadow-lg">
                        <h3 className="flex items-center gap-2 mb-6 text-main opacity-80">
                            <Plus size={22} className="text-indigo-400" />
                            Transcribe Entry
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="text-slate-600 font-bold mb-2">WORD</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="ABANICO"
                                        className="uppercase font-bold tracking-widest text-lg h-12"
                                        value={formData.word}
                                        onChange={(e) => setFormData({ ...formData, word: e.target.value.toUpperCase() })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="text-slate-600 font-bold mb-2">TAG/ABBR.</label>
                                    <input
                                        type="text"
                                        list="abbr-list"
                                        placeholder="m."
                                        className="font-serif italic h-12"
                                        value={formData.abbreviation}
                                        onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value })}
                                    />
                                    <datalist id="abbr-list">
                                        {abbreviations.map(a => <option key={a.abbr} value={a.abbr} />)}
                                    </datalist>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="text-slate-600 font-bold mb-2">CATEGORY</label>
                                    <select
                                        className="h-12"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="text-slate-600 font-bold mb-2">PRONUNCIA.</label>
                                    <input
                                        type="text"
                                        placeholder="[a-ba-ni-co]"
                                        className="text-xs h-12"
                                        value={formData.pronunciation}
                                        onChange={(e) => setFormData({ ...formData, pronunciation: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="text-slate-600 font-bold mb-2">ETYMOLOGY (Opt)</label>
                                <input
                                    type="text"
                                    className="h-12"
                                    placeholder="(De abanicar)"
                                    value={formData.etymology}
                                    onChange={(e) => setFormData({ ...formData, etymology: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="text-slate-600 font-bold mb-2">MEANINGS</label>
                                <textarea
                                    rows="5"
                                    required
                                    placeholder="Instrumento para hacer aire..."
                                    value={formData.definition}
                                    onChange={(e) => setFormData({ ...formData, definition: e.target.value })}
                                />
                            </div>

                            <button type="submit" className="btn-primary h-14 flex items-center justify-center gap-2 group shadow-md hover:scale-[1.02] active:scale-95 transition-all text-lg">
                                <Library size={22} className="group-hover:rotate-12 transition-transform" />
                                Save to Larousse
                            </button>
                        </form>
                    </div>
                </aside>
            </div>

            {/* SETTINGS MODAL */}
            {isSettingsOpen && (
                <div className="fixed inset-0 z-2000 flex items-center justify-center p-4 bg-black-60 backdrop-blur-md vintage-theme">
                    <div className="card w-full max-w-md h-450 flex flex-col relative overflow-hidden animate-in fade-in zoom-in border-0 shadow-2xl bg-card">
                        <div className="flex justify-between items-center mb-6 pl-2">
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setSettingsTab('abbr')}
                                    className={`tab-btn text-lg ${settingsTab === 'abbr' ? 'active' : ''}`}
                                >
                                    Tags
                                </button>
                                <button
                                    onClick={() => setSettingsTab('cats')}
                                    className={`tab-btn text-lg ${settingsTab === 'cats' ? 'active' : ''}`}
                                >
                                    Sections
                                </button>
                            </div>
                            <button
                                onClick={() => setIsSettingsOpen(false)}
                                className="close-btn mr-1"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {settingsTab === 'abbr' ? (
                            <div className="flex flex-col h-full overflow-hidden">
                                <form onSubmit={handleAddAbbr} className="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        placeholder="abbr (e.g. n.)"
                                        className="w-1/3 h-12"
                                        value={abbrForm.abbr}
                                        onChange={(e) => setAbbrForm({ ...abbrForm, abbr: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="meaning"
                                        className="flex-1 h-12"
                                        value={abbrForm.meaning}
                                        onChange={(e) => setAbbrForm({ ...abbrForm, meaning: e.target.value })}
                                    />
                                    <button type="submit" className="btn-square h-12 w-12">
                                        <Plus size={24} />
                                    </button>
                                </form>
                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                                    <table className="w-full">
                                        <thead>
                                            <tr>
                                                <th className="pb-3 text-sm">TAG</th>
                                                <th className="pb-3 text-sm">MEANING</th>
                                                <th className="text-right"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {abbreviations.map(a => (
                                                <tr key={a.abbr}>
                                                    <td className="font-serif italic text-indigo-400 font-bold text-lg py-3">{a.abbr}</td>
                                                    <td className="text-slate-600 py-3">{a.meaning}</td>
                                                    <td className="text-right py-3">
                                                        <button
                                                            onClick={() => handleDeleteAbbr(a.abbr)}
                                                            className="btn-ghost-red"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col h-full overflow-hidden">
                                <form onSubmit={handleAddCat} className="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        placeholder="New section..."
                                        className="flex-1 h-12"
                                        value={catForm}
                                        onChange={(e) => setCatForm(e.target.value)}
                                    />
                                    <button type="submit" className="btn-square h-12 w-12">
                                        <Plus size={24} />
                                    </button>
                                </form>
                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                                    <div className="space-y-2">
                                        {categories.map(cat => (
                                            <div key={cat} className="flex items-center justify-between p-4 bg-white-5 rounded-xl border border-white-5">
                                                <div className="flex items-center gap-3">
                                                    {getCategoryIcon(cat)}
                                                    <span className="text-base font-medium">{cat}</span>
                                                </div>
                                                {!['General', 'Geografía', 'Artes', 'Ciencias'].includes(cat) && (
                                                    <button
                                                        onClick={() => handleDeleteCat(cat)}
                                                        className="btn-ghost-red"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dictionary;
