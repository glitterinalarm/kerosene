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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 12 L12 0 V8 H24 V16 H12 V24 L0 12 Z"/>
        </svg>
      </button>
      
      <div className="carousel-container" ref={scrollRef}>
        {children}
      </div>

      <button className="nav-arrow right-arrow" onClick={scrollRight} aria-label="Défiler à droite">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 12 L12 0 V8 H0 V16 H12 V24 L24 12 Z"/>
        </svg>
      </button>
    </div>
  );
}
