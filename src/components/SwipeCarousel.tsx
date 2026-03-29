"use client";
import React, { useRef } from 'react';

interface SwipeCarouselProps {
  children: React.ReactNode;
  className?: string;
}

export default function SwipeCarousel({ children, className = '' }: SwipeCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = (e: React.MouseEvent) => {
    e.preventDefault();
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -scrollRef.current.clientWidth, behavior: 'smooth' });
    }
  };

  const scrollRight = (e: React.MouseEvent) => {
    e.preventDefault();
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: scrollRef.current.clientWidth, behavior: 'smooth' });
    }
  };

  return (
    <div className={`carousel-wrapper ${className}`}>
      <button className="nav-arrow left-arrow" onClick={scrollLeft} aria-label="Défiler à gauche">
        <span>←</span>
      </button>
      
      <div className="carousel-container" ref={scrollRef}>
        {children}
      </div>

      <button className="nav-arrow right-arrow" onClick={scrollRight} aria-label="Défiler à droite">
        <span>→</span>
      </button>
    </div>
  );
}
