import React, { useState, useEffect } from 'react';
import styles from '../../Styles/Auth.module.css';
import { useTranslation } from '../../hooks/useTranslation';
import LanguageSwitcher from '../UI/LanguageSwitcher';

import slide1 from '../../assets/onboarding/slide1.jpg';
import slide2 from '../../assets/onboarding/slide2.jpg';
import slide3 from '../../assets/onboarding/slide3.jpg';

const SLIDES = [
  {
    icon: '🚊',
    accent: '#400106',
    image: slide1,
  },
  {
    icon: '💳',
    accent: '#5C2A2E',
    image: slide2,
  },
  {
    icon: '🔔',
    accent: '#260101',
    image: slide3,
  },
];

export default function IntroSlider({ onComplete }) {
  const { t } = useTranslation();
  const [current, setCurrent]   = useState(0);
  const [exiting, setExiting]   = useState(false);
  const [animKey, setAnimKey]   = useState(0); 

  useEffect(() => {
    if (current === SLIDES.length - 1) return;
    const timer = setTimeout(() => {
      setAnimKey(k => k + 1);
      setCurrent(c => c + 1);
    }, 3500);
    return () => clearTimeout(timer);
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
  const slideNum = current + 1;

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
        {/* Top bar: language switcher left, skip right */}
        <div className="intro-top-bar">
          <LanguageSwitcher />
          <button className="intro-skip" onClick={handleComplete}>
            {t('intro_skip')}
          </button>
        </div>

        <div className="intro-text-block" key={`text-${animKey}`}>
          <h1 className="intro-title">{t(`intro_slide_${slideNum}_title`)}</h1>
          <p className="intro-subtitle">{t(`intro_slide_${slideNum}_subtitle`)}</p>
        </div>

        <div className="intro-bottom">
          <div className="intro-dots">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                className={`intro-dot${i === current ? ' intro-dot-active' : ''}`}
                onClick={() => goTo(i)}
                aria-label={t('intro_slide_aria', { number: i + 1 })}
              />
            ))}
          </div>

          {current === SLIDES.length - 1 && (
            <button
              className={`intro-cta ${styles.authButton} ${styles.authButtonPrimary}`}
              onClick={handleComplete}
            >
              {t('intro_start')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
