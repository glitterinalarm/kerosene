'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, Layout, Type, Image as ImageIcon, Video, ToggleLeft, ToggleRight, CheckCircle } from 'lucide-react';

export default function AdminHero() {
  const [heroData, setHeroData] = useState({
    enabled: false,
    title: '',
    excerpt: '',
    category: 'À LA UNE',
    sourceUrl: '',
    sourceName: '',
    blocks: [
      { type: 'text' as 'text' | 'image' | 'video' | 'youtube', content: '' }
    ],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/hero');
        if (res.ok) {
          const data = await res.json();
          // Migration support from old format
          if (!data.blocks) {
            const initialBlocks = [];
            if (data.body) initialBlocks.push({ type: 'text', content: data.body });
            if (data.mediaItems) {
               data.mediaItems.forEach((m: any) => initialBlocks.push({ type: m.type, content: m.url }));
            }
            data.blocks = initialBlocks.length > 0 ? initialBlocks : [{ type: 'text', content: '' }];
          }
          setHeroData(data);
        }
      } catch (err) {
        console.error('Failed to load hero data', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setStatus('idle');
    try {
      const res = await fetch('/api/hero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(heroData),
      });
      if (res.ok) {
        setStatus('success');
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setHeroData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const updateBlock = (index: number, content: string) => {
    const newBlocks = [...heroData.blocks];
    newBlocks[index] = { ...newBlocks[index], content };
    setHeroData(prev => ({ ...prev, blocks: newBlocks }));
  };

  const addBlock = (type: 'text' | 'image' | 'video' | 'youtube') => {
    setHeroData(prev => ({
      ...prev,
      blocks: [...prev.blocks, { type, content: '' }]
    }));
  };

  const removeBlock = (index: number) => {
    if (heroData.blocks.length <= 1) return;
    const newBlocks = heroData.blocks.filter((_, i) => i !== index);
    setHeroData(prev => ({ ...prev, blocks: newBlocks }));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...heroData.blocks];
    if (direction === 'up' && index > 0) {
      [newBlocks[index], newBlocks[index - 1]] = [newBlocks[index - 1], newBlocks[index]];
    } else if (direction === 'down' && index < newBlocks.length - 1) {
      [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
    }
    setHeroData(prev => ({ ...prev, blocks: newBlocks }));
  };

  if (loading) return <div className="admin-loading">CHARGEMENT...</div>;

  return (
    <div className="admin-container">
      <header className="admin-header">
        <Link href="/" className="admin-back">
          <ArrowLeft size={16} /> RETOUR AU SITE
        </Link>
        <div className="admin-title-row">
          <h1 className="admin-page-title">ÉDITEUR ÉDITORIAL</h1>
          <div className="admin-toggle-wrapper">
             <span className="admin-toggle-label">ACTIVER LE HERO MANUEL</span>
             <button 
                className={`admin-toggle-btn ${heroData.enabled ? 'active' : ''}`}
                onClick={() => setHeroData(prev => ({ ...prev, enabled: !prev.enabled }))}
             >
                {heroData.enabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
             </button>
          </div>
        </div>
      </header>

      <div className="admin-grid">
        <div className="admin-form">
          <section className="form-section">
            <h2 className="section-title-sm"><Type size={18} /> EN-TÊTE</h2>
            <div className="input-group">
              <label>TITRE (IMPACT NOIR FLUO)</label>
              <input name="title" value={heroData.title} onChange={handleChange} placeholder="TITRE DE L'ARTICLE..." />
            </div>
            
            <div className="input-group">
              <label>RÉSUMÉ / ACCROCHE</label>
              <textarea name="excerpt" value={heroData.excerpt} onChange={handleChange} rows={2} />
            </div>

            <div className="input-group-sm">
                <label>CATÉGORIE</label>
                <input name="category" value={heroData.category} onChange={handleChange} />
            </div>

            <div className="input-row">
              <div className="input-group">
                <label>NOM DE LA SOURCE (optionnel)</label>
                <input name="sourceName" value={heroData.sourceName} onChange={handleChange} placeholder="Ex: Le Monde, Apple, Adweek..." />
              </div>
              <div className="input-group">
                <label>LIEN DE LA SOURCE (optionnel)</label>
                <input name="sourceUrl" value={heroData.sourceUrl} onChange={handleChange} placeholder="https://..." />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2 className="section-title-sm"><Layout size={18} /> CORPS DE L'ARTICLE (BLOCS)</h2>
            
            <div className="blocks-list">
              {heroData.blocks.map((block, index) => (
                <div key={index} className="admin-block-item">
                  <div className="block-header">
                    <span className="block-type-badge">{block.type.toUpperCase()}</span>
                    <div className="block-controls">
                      <button onClick={() => moveBlock(index, 'up')}>↑</button>
                      <button onClick={() => moveBlock(index, 'down')}>↓</button>
                      <button className="delete-btn" onClick={() => removeBlock(index)}>×</button>
                    </div>
                  </div>
                  
                  {block.type === 'text' ? (
                    <textarea 
                      value={block.content} 
                      onChange={(e) => updateBlock(index, e.target.value)} 
                      placeholder="Écrivez votre paragraphe ici (HTML autorisé)..."
                      rows={4}
                    />
                  ) : (
                    <input 
                      value={block.content} 
                      onChange={(e) => updateBlock(index, e.target.value)} 
                      placeholder={block.type === 'youtube' ? "ID Vidéo YouTube" : "Lien https://..."} 
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="add-block-row">
              <button onClick={() => addBlock('text')}>+ PARAGRAPHE</button>
              <button onClick={() => addBlock('image')}>+ IMAGE</button>
              <button onClick={() => addBlock('video')}>+ VIDÉO MP4</button>
              <button onClick={() => addBlock('youtube')}>+ YOUTUBE</button>
            </div>
          </section>

          <div className="admin-actions">
            <button className={`save-btn ${status === 'success' ? 'success' : ''}`} onClick={handleSave} disabled={saving}>
              {saving ? 'SAUVEGARDE...' : status === 'success' ? <><CheckCircle size={18} /> ENREGISTRÉ</> : <><Save size={18} /> PUBLIER L'ARTICLE</>}
            </button>
          </div>
        </div>

        <div className="admin-preview">
          <div className="preview-label"><Eye size={14} /> APERÇU TEMPS RÉEL</div>
          <div className="preview-container">
            <div className="preview-card">
              <div className="preview-visual">
                {heroData.blocks.find(b => b.type !== 'text')?.content ? (
                  heroData.blocks.find(b => b.type !== 'text')?.type === 'image' ? (
                    <img src={heroData.blocks.find(b => b.type !== 'text')?.content} alt="Preview" />
                  ) : (
                    <div className="no-media"><Video size={40} /> <span style={{fontSize: '0.6rem'}}>VIDÉO À LA UNE</span></div>
                  )
                ) : <div className="no-media"><ImageIcon size={40} /></div>}
                <span className="preview-badge">{heroData.category}</span>
              </div>
              <div className="preview-content">
                <h3 className="preview-title">{heroData.title || "TITRE DE L'ARTICLE"}</h3>
                <p className="preview-excerpt">{heroData.excerpt || "Votre accroche apparaîtra ici..."}</p>
              </div>
            </div>
          </div>
          
          <div className="admin-info-box">
             <p><strong>Note :</strong> Lors de l'enregistrement, les modifications seront immédiatement visibles sur la page d'accueil si le mode "Hero Manuel" est activé.</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-container {
          background: #000;
          color: #fff;
          min-height: 100vh;
          padding: 3vw;
          font-family: 'Syne', sans-serif;
        }
        .admin-header {
          margin-bottom: 4vw;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          padding-bottom: 2vw;
        }
        .admin-back {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          font-size: 0.8rem;
          font-weight: 700;
          margin-bottom: 2rem;
          transition: color 0.2s;
        }
        .admin-back:hover { color: #fff; }
        .admin-title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 2rem;
          flex-wrap: wrap;
        }
        .admin-page-title {
          font-family: 'Anton', sans-serif;
          font-size: 3.5rem;
          line-height: 1;
        }
        .admin-toggle-wrapper {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(255,255,255,0.05);
          padding: 1rem 1.5rem;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .admin-toggle-label {
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          opacity: 0.6;
        }
        .admin-toggle-btn {
          background: none;
          border: none;
          color: rgba(255,255,255,0.2);
          cursor: pointer;
          transition: color 0.3s;
          display: flex;
        }
        .admin-toggle-btn.active { color: #00ff88; }
        
        .admin-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 4vw;
        }
        
        .form-section {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 2.5rem;
          margin-bottom: 2rem;
        }
        .section-title-sm {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          font-size: 0.9rem;
          text-transform: uppercase;
          margin-bottom: 2rem;
          opacity: 0.8;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          padding-bottom: 1rem;
        }
        
        .input-group {
          margin-bottom: 2rem;
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }
        .input-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }
        label {
          font-size: 0.7rem;
          font-weight: 800;
          opacity: 0.4;
          letter-spacing: 0.1em;
        }
        input, textarea, select {
          background: #0a0a0a;
          border: 1px solid rgba(255,255,255,0.15);
          color: #fff;
          padding: 1rem;
          width: 100%;
          font-family: inherit;
          font-size: 1rem;
          transition: border-color 0.2s, background 0.2s;
        }
        input:focus, textarea:focus, select:focus {
          outline: none;
          border-color: #fff;
          background: #111;
        }
        
        .blocks-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .admin-block-item {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 1.5rem;
          position: relative;
        }
        .block-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .block-type-badge {
          font-size: 0.6rem;
          font-weight: 800;
          background: #fff;
          color: #000;
          padding: 0.2rem 0.5rem;
          letter-spacing: 0.1em;
        }
        .block-controls {
          display: flex;
          gap: 0.5rem;
        }
        .block-controls button {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          padding: 0.2rem 0.5rem;
          cursor: pointer;
        }
        .block-controls .delete-btn {
          color: #ff4d4d;
        }
        .add-block-row {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .add-block-row button {
          flex: 1;
          min-width: 120px;
          background: transparent;
          border: 1px dashed rgba(255,255,255,0.3);
          color: rgba(255,255,255,0.6);
          padding: 1rem;
          font-family: inherit;
          font-size: 0.7rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .add-block-row button:hover {
          border-color: #fff;
          color: #fff;
          background: rgba(255,255,255,0.05);
        }
        
        .admin-actions {
          margin-top: 3rem;
        }
        .save-btn {
          background: #fff;
          color: #000;
          border: none;
          padding: 1.5rem 3rem;
          font-family: 'Anton', sans-serif;
          font-size: 1.2rem;
          text-transform: uppercase;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: transform 0.2s, background 0.2s;
          width: 100%;
          justify-content: center;
        }
        .save-btn:hover:not(:disabled) { transform: scale(1.02); }
        .save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .save-btn.success { background: #00ff88; }
        
        .preview-container {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 2rem;
          position: sticky;
          top: 2rem;
        }
        .preview-label {
          font-size: 0.65rem;
          font-weight: 800;
          opacity: 0.4;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .preview-card {
           background: #111;
           border: 1px solid rgba(255,255,255,0.1);
        }
        .preview-visual {
          width: 100%;
          aspect-ratio: 16/9;
          background: #000;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .preview-visual img { width: 100%; height: 100%; object-fit: cover; }
        .preview-badge {
          position: absolute; top: 1rem; left: 1rem;
          background: #fff; color: #000;
          font-size: 0.6rem; font-weight: 800; padding: 0.3rem 0.6rem;
        }
        .preview-content { padding: 1.5rem; }
        .preview-title { font-family: 'Anton', sans-serif; font-size: 1.5rem; margin-bottom: 0.5rem; text-transform: uppercase; }
        .preview-excerpt { font-size: 0.9rem; opacity: 0.6; line-height: 1.4; }
        
        .admin-info-box {
           margin-top: 2rem;
           padding: 1.5rem;
           background: rgba(0,255,136,0.05);
           border-left: 2px solid #00ff88;
           font-size: 0.8rem;
           color: rgba(255,255,255,0.6);
           line-height: 1.5;
        }

        @media (max-width: 1024px) {
          .admin-grid { grid-template-columns: 1fr; }
          .admin-preview { order: -1; }
        }
      `}</style>
    </div>
  );
}
