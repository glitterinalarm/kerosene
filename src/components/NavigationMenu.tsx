"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function NavigationMenu({ availableDates }: { availableDates: string[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentDate = searchParams.get('date');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const handleSelect = (d?: string) => {
    setIsOpen(false);
    if (d) {
      router.push(`/?date=${d}`);
    } else {
      router.push(`/`);
    }
  };

  const formatDate = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  return (
    <>
      <button className={`menu-trigger ${isOpen ? 'menu-open' : ''}`} onClick={() => setIsOpen(!isOpen)} aria-label="Menu">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={`menu-overlay ${isOpen ? 'is-active' : ''}`}>
        <div className="menu-inner">
          <nav className="menu-nav">
            <h2 className="menu-title">HISTORIQUE</h2>
            <ul>
              <li>
                <button 
                  onClick={() => handleSelect()}
                  className={!currentDate ? 'active' : ''}
                >
                  LA UNE
                </button>
              </li>
              {availableDates.map(d => (
                <li key={d}>
                  <button 
                    onClick={() => handleSelect(d)}
                    className={currentDate === d ? 'active' : ''}
                  >
                     {formatDate(d)}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
