import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Components/Layout/Header';
import styles from '../Styles/HelpSupport.module.css';

const HelpSupportScreen = () => {
  const navigate = useNavigate();
  // State for FAQ expand/collapse
  const [openFaq, setOpenFaq] = useState(null);
  // State for search input
  const [searchTerm, setSearchTerm] = useState('');
  // State for report form
  const [problemType, setProblemType] = useState('Problème de validation');
  const [description, setDescription] = useState('');
  const [attachScreenshot, setAttachScreenshot] = useState(false);

  // FAQ data
  const faqs = [
    {
      question: 'Comment acheter un ticket ?',
      answer: 'Pour acheter un ticket, ouvrez l\'application, sélectionnez "Acheter un ticket", choisissez le type de trajet et validez le paiement.',
    },
    {
      question: 'Mon paiement a échoué, que faire ?',
      answer: 'Vérifiez votre solde bancaire et votre compte. Si le problème persiste, contactez notre support via email ou chat.',
    },
    {
      question: 'Comment valider mon billet par NFC ?',
      answer: 'Activez le NFC sur votre téléphone, ouvrez le ticket et approchez votre téléphone du lecteur NFC.',
    },
  ];

  // Handlers
  const goBack = () => navigate(-1);
  const toggleFaq = (index) => setOpenFaq(openFaq === index ? null : index);
  const handleSendReport = () => {};
  const handleCall = () => {};
  const handleEmail = () => {};
  const handleChat = () => {};


  // Filter FAQs based on search term
  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-shell">
      <div className="app-frame">
        {/* Main Card */}
        <div className={`${styles.helpCard} app-card`}>
          
          <Header 
            title="Aide & Support" 
            showBackButton={true} 
            onBack={goBack} 
          />

          {/* Scrollable content */}
          <div className={`app-content ${styles.scrollContainer}`}>
            
            {/* Search Bar */}
            <div className="mb-6 mt-2">
              <div className="relative bg-black/40 rounded-xl border border-white/10 focus-within:border-yellow-500/30 transition-all">
                <div className="flex items-center px-4 py-3">
                  <svg className="w-5 h-5 text-white/40 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Rechercher de l'aide..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/40"
                  />
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <Section title="Questions Fréquentes">
              <div className="space-y-3">
                {filteredFaqs.length === 0 ? (
                  <p className="text-white/40 text-sm text-center py-4">Aucun résultat trouvé</p>
                ) : (
                  filteredFaqs.map((faq, index) => (
                    <div key={index} className="bg-black/40 rounded-xl border border-white/10 overflow-hidden">
                      <button
                        onClick={() => toggleFaq(index)}
                        className="w-full text-left p-4 flex items-center justify-between"
                      >
                        <span className="text-white font-medium text-sm">{faq.question}</span>
                        <svg
                          className={`w-5 h-5 text-white/40 transition-transform ${openFaq === index ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                      </button>
                      {openFaq === index && (
                        <div className="px-4 pb-4 text-white/70 text-sm border-t border-white/10 pt-3">
                          <p>{faq.answer}</p>
                          <div className="flex items-center mt-3 space-x-4">
                            <span className="text-white/40 text-xs">Cela a-t-il été utile ?</span>
                            <button className="text-yellow-500 text-xs hover:text-yellow-400">Oui</button>
                            <button className="text-yellow-500 text-xs hover:text-yellow-400">Non</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Section>

            {/* Contact Section */}
            <Section title="Contactez-nous">
              <div className="space-y-3">
                <ContactItem 
                  icon="phone"
                  title="Assistance téléphonique"
                  subtitle="05-22-XX-XX-XX"
                  description="Lun-Ven 8h-20h, Sam 9h-18h"
                  buttonText="Appeler maintenant"
                  onClick={handleCall}
                />
                <ContactItem 
                  icon="email"
                  title="Support par email"
                  subtitle="support@transport.ma"
                  description="Réponse sous 24h"
                  buttonText="Envoyer un email"
                  onClick={handleEmail}
                />
                <ContactItem 
                  icon="chat"
                  title="Chat en direct"
                  status="En ligne"
                  description="Disponible 9h-18h"
                  buttonText="Démarrer une conversation"
                  onClick={handleChat}
                />
              </div>
            </Section>


            {/* Report Problem Section */}
            <Section title="Signaler un problème">
              <div className="bg-black/40 rounded-xl border border-white/10 p-4 space-y-4">
                <div>
                  <label className="text-white/50 text-xs uppercase tracking-wide mb-2 block">Type de problème</label>
                  <select
                    value={problemType}
                    onChange={(e) => setProblemType(e.target.value)}
                    className="w-full bg-[#1a0507] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-yellow-500/30 outline-none"
                  >
                    <option>Problème de validation</option>
                    <option>Problème de paiement</option>
                    <option>Problème technique</option>
                    <option>Autre</option>
                  </select>
                </div>
                <div>
                  <label className="text-white/50 text-xs uppercase tracking-wide mb-2 block">Description</label>
                  <textarea
                    rows={4}
                    placeholder="Décrivez le problème en détail..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/40 resize-none focus:border-yellow-500/30 outline-none"
                  />
                  <div className="text-right text-white/40 text-xs mt-1">{description.length}/500</div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="screenshot"
                    checked={attachScreenshot}
                    onChange={(e) => setAttachScreenshot(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-black/40 text-yellow-500 focus:ring-yellow-500"
                  />
                  <label htmlFor="screenshot" className="text-white/70 text-sm">Joindre une capture d'écran</label>
                </div>
                <button
                  onClick={handleSendReport}
                  className="w-full bg-gradient-to-r from-[#D9B991] to-[#C9A961] text-[#400106] font-semibold py-3 rounded-xl hover:from-[#E5C5A1] hover:to-[#D9B971] transition-all"
                >
                  Envoyer le rapport
                </button>
              </div>
            </Section>

            {/* Footer */}
            <div className="text-center text-white/30 text-xs mt-6 pb-4">
              <p>© 2026 Casablanca Transport</p>
              <p className="mt-1">Version 2.4.1</p>
              <p className="mt-2">Fait avec 🐾 à Casablanca</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Reusable subcomponents ---

const Section = ({ title, children }) => (
  <div className="mb-6">
    <h2 className="text-white/60 text-xs uppercase tracking-wide mb-3">{title}</h2>
    {children}
  </div>
);

const ContactItem = ({ icon, title, subtitle, status, description, buttonText, onClick }) => (
  <div className="bg-black/40 rounded-xl border border-white/10 p-4">
    <div className="flex items-start space-x-3">
      <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
        <Icon name={icon} />
      </div>
      <div className="flex-1">
        <p className="text-white font-medium text-sm">{title}</p>
        {subtitle && <p className="text-white/60 text-sm mt-1">{subtitle}</p>}
        {status && <p className="text-green-400 text-xs">{status}</p>}
        <p className="text-white/40 text-xs mt-1">{description}</p>
        <button
          onClick={onClick}
          className="mt-3 bg-white/5 hover:bg-white/10 rounded-lg px-4 py-2 text-yellow-500 text-sm font-medium"
        >
          {buttonText}
        </button>
      </div>
    </div>
  </div>
);



const Icon = ({ name }) => {
  const icons = {
    phone: <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg>,
    email: <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>,
    chat: <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/></svg>,
  };
  return icons[name] || null;
};

export default HelpSupportScreen;
