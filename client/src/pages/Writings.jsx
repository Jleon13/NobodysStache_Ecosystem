import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Plus, Trash2, Feather, BookOpen, X, Save, ArrowLeft, Tag, Search, Filter, PenLine
} from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

function Writings() {
  const [writings, setWritings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [viewingPiece, setViewingPiece] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showCatManager, setShowCatManager] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [formData, setFormData] = useState({ title: '', content: '', category: '' });
  const [loading, setLoading] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState('All');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [w, c] = await Promise.all([
        axios.get(`${API_URL}/writings`),
        axios.get(`${API_URL}/writing-categories`)
      ]);
      setWritings(Array.isArray(w.data) ? w.data : []);
      setCategories(Array.isArray(c.data) ? c.data : []);
      if (c.data.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: c.data[0] }));
      }
    } catch (err) { console.error(err); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;
    setLoading(true);
    await axios.post(`${API_URL}/writings`, formData);
    setFormData({ title: '', content: '', category: categories[0] || '' });
    setIsAdding(false);
    await fetchData();
    setLoading(false);
  };

  const addCategory = async () => {
    if (!newCatName.trim()) return;
    await axios.post(`${API_URL}/writing-categories`, { name: newCatName.trim() });
    setNewCatName('');
    fetchData();
  };

  const deleteCategory = async (name) => {
    if (window.confirm(`Delete genre "${name}"?`)) {
      await axios.delete(`${API_URL}/writing-categories/${name}`);
      fetchData();
    }
  };

  const deleteEntry = async (id) => {
    if (window.confirm('Delete this writing?')) {
      await axios.delete(`${API_URL}/writings/${id}`);
      fetchData();
    }
  };

  // ADVANCED FILTER LOGIC (SMART SEARCH)
  const filteredWritings = writings
    .filter(w => {
      const terms = searchTerm.toLowerCase().split(' ').filter(t => t.length > 0);
      const textToSearch = `${w.title} ${w.content}`.toLowerCase();
      const matchesSearch = terms.length === 0 || terms.every(term => textToSearch.includes(term));
      const matchesCat = filterCat === 'All' || w.category === filterCat;
      return matchesSearch && matchesCat;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (viewingPiece) {
    return (
      <div className="writings-reader-overlay animate-fade-in" style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, backgroundColor: '#fcfaf7', overflowY: 'auto', color: '#1a1a1a', display: 'block'
      }}>
        <div style={{ maxWidth: '850px', margin: '0 auto', padding: '4rem 2rem' }}>
          <button onClick={() => setViewingPiece(null)} style={{ background: 'none', border: 'none', color: '#888', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '4rem', fontSize: '1rem', fontFamily: 'AverageCustom' }}>
            <ArrowLeft size={18} /> BACK TO LIBRARY
          </button>

          <div style={{ background: '#fff', padding: '5rem', borderRadius: '2rem', boxShadow: '0 40px 100px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0' }}>
            <div style={{ color: '#aaa', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.2em', marginBottom: '2rem', fontWeight: 600 }}>
              {viewingPiece.category} • {viewingPiece.date}
            </div>
            <h1 style={{ fontSize: '4.8rem', color: '#000', fontFamily: 'AverageCustom', marginBottom: '4rem', lineHeight: 1.1, letterSpacing: '-0.04em' }}>
              {viewingPiece.title}
            </h1>
            <div style={{ fontSize: '1.45rem', lineHeight: '1.6', color: '#333', whiteSpace: 'pre-wrap', textAlign: 'justify', fontWeight: 300, fontFamily: 'AverageCustom' }}>
              {viewingPiece.content}
            </div>
            <div style={{ marginTop: '7rem', textAlign: 'center', opacity: 0.15 }}>
              <Feather size={36} color="black" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="writings-light-wrapper animate-fade-in">
      <header className="header" style={{ color: '#1a1a1a' }}>
        <h1 style={{ color: '#1a1a1a' }}>Escritos</h1>
        <p style={{ color: '#666' }}>THE PAPER ROOM</p>
      </header>

      <div className="dashboard" style={{ paddingTop: '0' }}>

        {/* ACTION BAR (SEARCH & BUTTONS) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center', flex: 1 }}>
            <div className="search-box-light">
              <Search size={18} color="#999" />
              <input
                type="text"
                placeholder="Words to find..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <select
                value={filterCat}
                onChange={e => setFilterCat(e.target.value)}
                style={{ background: 'white', border: '1px solid #eee', padding: '0.6rem 1rem', borderRadius: '1.5rem', height: '3.2rem', color: '#1a1a1a', outline: 'none' }}
              >
                <option value="All">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button onClick={() => setShowCatManager(!showCatManager)} className="btn-outline-light">
              <Tag size={16} /> Genres
            </button>
            <button onClick={() => setIsAdding(true)} className="btn-primary-dark">
              <PenLine size={18} /> New Manuscript
            </button>
          </div>
        </div>

        {showCatManager && !isAdding && (
          <div className="writing-card-light animate-fade-in" style={{ marginBottom: '3rem', padding: '2.5rem' }}>
            <h3 style={{ color: '#1a1a1a', marginBottom: '1.5rem' }}>Literary Genres</h3>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
              <input type="text" placeholder="Add new genre..." value={newCatName} onChange={e => setNewCatName(e.target.value)} onKeyPress={e => e.key === 'Enter' && addCategory()}
                style={{ background: '#fcfaf7', color: '#1a1a1a', border: '1px solid #eee', flex: 1 }} />
              <button onClick={addCategory} className="btn-square-dark">
                <Plus size={24} />
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {categories.map(cat => (
                <div key={cat} className="chip-light">
                  {cat} <X size={16} style={{ cursor: 'pointer', color: '#ccc' }} onClick={() => deleteCategory(cat)} />
                </div>
              ))}
            </div>
          </div>
        )}

        {isAdding ? (
          <div className="writing-card-light animate-fade-in" style={{ maxWidth: '850px', margin: '0 auto 4rem auto', padding: '4.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#1a1a1a' }}>
                <PenLine size={24} />
                <h3 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 300 }}>New Draft</h3>
              </div>
              <button onClick={() => setIsAdding(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc' }}><X size={32} /></button>
            </div>

            <form onSubmit={handleSave}>
              <div className="form-group" style={{ marginBottom: '3rem' }}>
                <label style={{ color: '#bbb', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.12em', marginBottom: '1rem', display: 'block' }}>Draft Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Title of this piece..."
                  style={{ fontSize: '2.4rem', border: 'none', background: 'transparent', padding: '0.5rem 0', borderBottom: '1px solid #eee', borderRadius: 0, color: '#000', fontWeight: 400, fontFamily: 'AverageCustom', width: '100%', outline: 'none' }}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '3rem' }}>
                <label style={{ color: '#bbb', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.12em', marginBottom: '1rem', display: 'block' }}>Manuscript Genre</label>
                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} style={{ background: '#f8f9fa', color: '#1a1a1a', border: '1px solid #eee', padding: '0.8rem 1.2rem', borderRadius: '0.75rem', width: '100%', maxWidth: '250px' }}>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label style={{ color: '#bbb', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.12em', marginBottom: '1rem', display: 'block' }}>Content Body</label>
                <textarea
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  placeholder="The first line..."
                  style={{ width: '100%', height: '520px', background: 'transparent', border: 'none', borderLeft: '3px solid #f8f9fa', padding: '1rem 3.5rem', fontSize: '1.35rem', lineHeight: '1.6', color: '#333', resize: 'none', outline: 'none', fontFamily: 'AverageCustom' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4rem' }}>
                <button type="submit" className="btn-publish-final" disabled={loading}>
                  <Save size={22} /> {loading ? 'Saving...' : 'PUBLISH PIECE'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '3rem' }}>
            {filteredWritings.map(w => (
              <div key={w.id} className="manuscript-entry-light">
                <div className="entry-meta">{w.category} • {w.date}</div>
                <h3 className="entry-title">{w.title}</h3>
                <p className="entry-preview">
                  {w.content}
                </p>
                <div className="entry-footer">
                  <button onClick={() => setViewingPiece(w)} className="btn-open-piece">
                    <BookOpen size={20} /> Open manuscript
                  </button>
                  <button onClick={() => deleteEntry(w.id)} className="btn-delete-ghost"><Trash2 size={22} /></button>
                </div>
              </div>
            ))}
            {filteredWritings.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem', color: '#999' }}>
                No manuscripts found matching your search.
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .writings-light-wrapper { min-height: 100vh; background: #fcfaf7; font-family: 'AverageCustom', serif; }
        .writing-card-light { background: white; border-radius: 2rem; border: 1px solid #f0f0f0; box-shadow: 0 10px 40px rgba(0,0,0,0.015); transition: all 0.5s ease; }
        .manuscript-entry-light { background: white; border-radius: 2rem; border: 1px solid #f0f0f0; box-shadow: 0 10px 40px rgba(0,0,0,0.015); transition: all 0.5s ease; display: flex; flex-direction: column; min-height: 360px; padding: 3.5rem; }
        .manuscript-entry-light:hover { transform: translateY(-12px); box-shadow: 0 30px 80px rgba(0,0,0,0.05); }
        .entry-meta { fontSize: 0.75rem; color: #bbb; textTransform: uppercase; letterSpacing: 0.15em; marginBottom: 1.5rem; fontWeight: 700; }
        .entry-title { fontSize: 2rem; color: #111; marginBottom: 2rem; fontFamily: 'AverageCustom', fontWeight: 400; lineHeight: 1.25; }
        .entry-preview { color: #666; fontSize: 1.1rem; flex: 1; overflow: hidden; display: -webkit-box; WebkitLineClamp: 4; WebkitBoxOrient: vertical; lineHeight: 1.7; fontWeight: 300; }
        .entry-footer { display: flex; justify-content: space-between; align-items: center; marginTop: 3rem; borderTop: 1px solid #f9f9f9; paddingTop: 2rem; }
        .btn-open-piece { background: none; border: none; color: #000; fontWeight: 700; display: flex; gap: 0.7rem; alignItems: center; cursor: pointer; fontSize: 1.05rem; padding: 0; }
        .btn-delete-ghost { background: none; border: none; color: #eee; cursor: pointer; transition: color 0.3s; }
        .btn-delete-ghost:hover { color: #f43f5e; }
        
        .search-box-light { display: flex; alignItems: center; gap: 1rem; background: white; padding: 0.6rem 1.75rem; border-radius: 2rem; border: 1px solid #eee; flex: 1; max-width: 420px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); height: 3.2rem; }
        .search-box-light input { border: none; background: none; width: 100%; outline: none; color: #1a1a1a; font-size: 1rem; }
        
        .btn-primary-dark { background: #111; color: white; border: none; padding: 0.7rem 1.8rem; border-radius: 2rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.6rem; font-family: inherit; transition: all 0.3s; height: 3.2rem; }
        .btn-primary-dark:hover { background: #000; transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.15); }
        
        .btn-outline-light { background: white; border: 1px solid #eee; color: #111; padding: 0.7rem 1.8rem; border-radius: 1.5rem; cursor: pointer; display: flex; gap: 0.6rem; alignItems: center; fontSize: 0.95rem; fontWeight: 600; height: 3.2rem; transition: background 0.2s; }
        .btn-outline-light:hover { background: #f8f9fa; }
        
        .btn-publish-final { background: #000; color: #fff; border: none; padding: 1.25rem 3.5rem; border-radius: 1rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 0.8rem; font-family: inherit; letter-spacing: 0.1em; transition: all 0.4s; }
        .btn-publish-final:hover { transform: scale(1.03); box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        
        .btn-square-dark { width: 3.5rem; height: 3.5rem; background: #111; color: white; border-radius: 1rem; border: none; cursor: pointer; display: flex; alignItems: center; justifyContent: center; }
        .chip-light { background: #fff; border: 1px solid #f0f0f0; color: #1a1a1a; padding: 0.6rem 1.2rem; borderRadius: 1.25rem; display: flex; gap: 0.6rem; alignItems: center; fontSize: 0.95rem; }
        .header { margin-top: -60px; padding-top: 140px; padding-bottom: 4rem; }
      `}</style>
    </div>
  );
}

export default Writings;
