import React, { useState, useEffect } from 'react';
import styles from '../../Styles/Auth.module.css';

import slide1 from '../../assets/onboarding/slide1.jpg';
import slide2 from '../../assets/onboarding/slide2.jpg';
import slide3 from '../../assets/onboarding/slide3.jpg';

const SLIDES = [
  {
    icon: '🚊',
    title: 'Bienvenue sur CasaWay',
    subtitle: 'Découvrez la nouvelle façon de naviguer dans votre ville. Une expérience fluide et entièrement digitalisée pour vos déplacements quotidiens.',
    accent: '#400106',
    image: slide1,
  },
  {
    icon: '💳',
    title: 'Liberté de paiement',
    subtitle: 'Rechargez votre portefeuille numérique en quelques secondes. Payez vos trajets en toute sécurité, sans contact et sans attente.',
    accent: '#5C2A2E',
    image: slide2,
  },
  {
    icon: '🔔',
    title: 'Tout est sous contrôle',
    subtitle: 'Accédez à vos billets, suivez vos validations et restez informé grâce aux notifications en temps réel sur l\'état du réseau.',
    accent: '#260101',
    image: slide3,
  },
];

export default function IntroSlider({ onComplete }) {
  const [current, setCurrent]   = useState(0);
  const [exiting, setExiting]   = useState(false);
  const [animKey, setAnimKey]   = useState(0); 

  useEffect(() => {
    if (current === SLIDES.length - 1) return;
    const t = setTimeout(() => {
      setAnimKey(k => k + 1);
      setCurrent(c => c + 1);
    }, 3500);
    return () => clearTimeout(t);
  }, [current]);

  const handleComplete = () => {
    setExiting(true);
    setTimeout(() => onComplete(), 450);
  };

  const goTo = (index) => {
    if (index === current) return;
    setAnimKey(k => k + 1);
    setCurrent(index);
  };

  const slide = SLIDES[current];

  return (
    <div className={`intro-root${exiting ? ' intro-exit' : ''}`}>

      {/* LEFT — diagonal panel */}
      <div
        className="intro-left"
        style={{ background: slide.accent }}
      >
        <div className="intro-dot-grid" />

        {/* Optional Image Background */}
        {slide.image && (
          <img 
            src={slide.image} 
            alt="" 
            className="intro-slide-image" 
            key={`img-${animKey}`}
          />
        )}

        {/* Icon — Fallback or overlay if no image */}
        {!slide.image && (
          <div className="intro-icon-wrap" key={`icon-${animKey}`}>
            <span className="intro-icon">{slide.icon}</span>
          </div>
        )}

        <div className="intro-circle intro-circle-1" />
        <div className="intro-circle intro-circle-2" />
      </div>

      {/* RIGHT — dark panel */}
      <div className="intro-right">
        <button className="intro-skip" onClick={handleComplete}>
          Passer
        </button>

        <div className="intro-text-block" key={`text-${animKey}`}>
          <h1 className="intro-title">{slide.title}</h1>
          <p className="intro-subtitle">{slide.subtitle}</p>
        </div>

        <div className="intro-bottom">
          <div className="intro-dots">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                className={`intro-dot${i === current ? ' intro-dot-active' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Aller à la diapositive ${i + 1}`}
              />
            ))}
          </div>

          {current === SLIDES.length - 1 && (
            <button
              className={`intro-cta ${styles.authButton} ${styles.authButtonPrimary}`}
              onClick={handleComplete}
            >
              Commencer →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
