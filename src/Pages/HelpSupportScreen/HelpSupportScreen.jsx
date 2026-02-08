import React, { useState } from 'react';
import Header from '../../Components/Layout/Header';
import FormField from '../../Components/Form/FormField';
import FAQItem from '../../Components/UI/FAQItem';
import ContactCard from '../../Components/UI/ContactCard';
import SupportButton from '../../Components/UI/SupportButton';
import GuideCard from '../../Components/UI/GuideCard';
import ReportForm from '../../Components/Form/ReportForm';
import styles from '../../styles/HelpSupport.module.css';

export default function HelpSupportScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [helpfulFeedback, setHelpfulFeedback] = useState({});
  const [problemType, setProblemType] = useState('Problème de validation');
  const [problemDescription, setProblemDescription] = useState('');

  const goBack = () => {
    console.log('Going back...');
  };

  const handleContactMethod = (method) => {
    console.log('Contact method:', method);
  };

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const handleFeedback = (faqId, isHelpful) => {
    setHelpfulFeedback({ ...helpfulFeedback, [faqId]: isHelpful });
    console.log(`FAQ ${faqId} was ${isHelpful ? 'helpful' : 'not helpful'}`);
  };

  const handleCallNow = () => {
    console.log('Calling support...');
  };

  const handleSendEmail = () => {
    console.log('Opening email client...');
  };

  const handleStartChat = () => {
    console.log('Starting live chat...');
  };

  const handlePlayGuide = (guide) => {
    console.log('Playing guide:', guide);
  };

  const handleAttachScreenshot = () => {
    console.log('Attaching screenshot...');
  };

  const handleSubmitReport = () => {
    console.log('Submitting report:', { problemType, problemDescription });
  };

  // FAQ Data
  const faqs = [
    {
      id: 1,
      question: 'Comment acheter un ticket ?',
      answer: "Pour acheter un ticket, ouvrez l'application, accédez à la section 'Acheter', sélectionnez le type de ticket souhaité, et suivez les instructions de paiement."
    },
    {
      id: 2,
      question: 'Mon paiement a échoué, que faire ?',
      answer: "Vérifiez votre solde bancaire et votre connexion internet. Si le problème persiste, contactez votre banque ou notre support."
    },
    {
      id: 3,
      question: 'Comment valider mon billet par NFC ?',
      answer: "Activez le NFC sur votre téléphone, ouvrez l'application, accédez à 'Validation', et approchez votre téléphone du terminal NFC."
    }
  ];

  // Guide Videos
  const guides = [
    {
      id: 1,
      title: "Premiers pas avec l'application",
      duration: '3 min',
      iconType: 'play'
    },
    {
      id: 2,
      title: 'Comment recharger votre solde',
      duration: '2 min',
      iconType: 'wallet'
    },
    {
      id: 3,
      title: 'Utiliser les QR codes',
      duration: '1 min',
      iconType: 'qr'
    }
  ];

  return (
    <>
      <style jsx global>{`
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        }
      `}</style>

      <div className={styles['help-support-container']}>
        {/* Main Container */}
        <div className="w-full max-w-md mx-auto p-4">
          {/* Help & Support Card */}
          <div className={styles['help-support-card']}>
            
            {/* Header */}
            <Header 
              title="Aide & Support"
              showBackButton={true}
              onBack={goBack}
              showMenuButton={true}
              onMenu={() => handleContactMethod('chat')}
              className="px-6 pt-6 pb-4 border-b border-white/10"
            />

            {/* Main Content - Scrollable */}
            <div className={`max-h-[calc(100vh-150px)] overflow-y-auto ${styles['help-support-scrollbar']} px-6 py-6`}>
              
              {/* Search Bar */}
              <div className={styles['mb-6']}>
                <div className={styles['search-bar']}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher de l'aide..."
                    className={styles['search-input']}
                  />
                  <svg className={`${styles['search-icon']} w-5 h-5 text-white/50`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </div>
              </div>

              {/* Quick Contact Methods */}
              <div className={`${styles['quick-contact-grid']} ${styles['mb-6']}`}>
                <SupportButton
                  type="phone"
                  label="Contacter"
                  onClick={() => handleContactMethod('phone')}
                />
                <SupportButton
                  type="chat"
                  label="Chat"
                  onClick={() => handleContactMethod('chat')}
                />
                <SupportButton
                  type="email"
                  label="Email"
                  onClick={() => handleContactMethod('email')}
                />
              </div>

              {/* FAQs Section */}
              <div className={styles['mb-6']}>
                <div className={styles['section-header']}>
                  <div className={styles['section-icon']}>
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className={styles['section-title']}>Questions Fréquentes</h2>
                    <p className={styles['section-subtitle']}>Trouvez rapidement des réponses</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {faqs.map((faq) => (
                    <FAQItem
                      key={faq.id}
                      id={faq.id}
                      question={faq.question}
                      answer={faq.answer}
                      isExpanded={expandedFaq === faq.id}
                      onToggle={toggleFaq}
                      helpfulFeedback={helpfulFeedback}
                      onFeedback={handleFeedback}
                    />
                  ))}
                </div>
              </div>

              {/* Contact Us Section */}
              <div className={styles['mb-6']}>
                <div className={styles['section-header']}>
                  <div className={styles['section-icon']}>
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562C15.802 8.249 16 9.1 16 10zm-5.165 3.913l1.58 1.58A5.98 5.98 0 0110 16a5.976 5.976 0 01-2.516-.552l1.562-1.562a4.006 4.006 0 001.789.027zm-4.677-2.796a4.002 4.002 0 01-.041-2.08l-.08.08-1.53-1.533A5.98 5.98 0 004 10c0 .954.223 1.856.619 2.657l1.54-1.54zm1.088-6.45A5.974 5.974 0 0110 4c.954 0 1.856.223 2.657.619l-1.54 1.54a4.002 4.002 0 00-2.346.033L7.246 4.668zM12 10a2 2 0 11-4 0 2 2 0 014 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className={styles['section-title']}>Contactez-nous</h2>
                    <p className={styles['section-subtitle']}>Notre équipe est là pour vous aider</p>
                  </div>
                </div>

                <div className={styles['contact-methods']}>
                  <ContactCard
                    type="phone"
                    title="Assistance téléphonique"
                    contactInfo="05-22-XX-XX-XX"
                    subtitle="Lun-Ven 8h-20h, Sam 9h-18h"
                    onAction={handleCallNow}
                    buttonText="Appeler maintenant"
                  />

                  <ContactCard
                    type="email"
                    title="Support par email"
                    contactInfo="support@transport.ma"
                    subtitle="Réponse sous 24h"
                    onAction={handleSendEmail}
                    buttonText="Envoyer un email"
                  />

                  <ContactCard
                    type="chat"
                    title="Chat en direct"
                    contactInfo="Disponible 9h-18h"
                    subtitle="En ligne"
                    status="online"
                    onAction={handleStartChat}
                    buttonText="Démarrer une conversation"
                  />
                </div>
              </div>

              {/* User Guides Section */}
              <div className={styles['mb-6']}>
                <div className={styles['section-header']}>
                  <div className={styles['section-icon']}>
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className={styles['section-title']}>Guides d'utilisation</h2>
                    <p className={styles['section-subtitle']}>Apprenez à utiliser l'application</p>
                  </div>
                </div>

                <div className={styles['guides-grid']}>
                  {guides.map((guide) => (
                    <GuideCard
                      key={guide.id}
                      title={guide.title}
                      duration={guide.duration}
                      iconType={guide.iconType}
                      onPlay={() => handlePlayGuide(guide)}
                    />
                  ))}
                </div>
              </div>

              {/* Report Problem Section */}
              <div className={styles['mb-6']}>
                <div className={styles['section-header']}>
                  <div className={`${styles['section-icon']} ${styles['danger']}`}>
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className={styles['section-title']}>Signaler un problème</h2>
                    <p className={styles['section-subtitle']}>Aidez-nous à améliorer l'application</p>
                  </div>
                </div>

                <ReportForm
                  problemType={problemType}
                  onProblemTypeChange={setProblemType}
                  problemDescription={problemDescription}
                  onProblemDescriptionChange={setProblemDescription}
                  onAttachScreenshot={handleAttachScreenshot}
                  onSubmit={handleSubmitReport}
                />
              </div>

              {/* Footer */}
              <div className={styles['help-footer']}>
                <p className={styles['help-footer-text']}>© 2026 Casablanca Transport</p>
                <p className={styles['help-footer-text']}>Version 2.4.1</p>
                <p className={styles['help-footer-text']}>Fait avec ❤️ à Casablanca</p>
                <div className={styles['help-footer-links']}>
                  <button className={styles['help-footer-link']}>Conditions</button>
                  <span className={styles['help-footer-separator']}>•</span>
                  <button className={styles['help-footer-link']}>Confidentialité</button>
                  <span className={styles['help-footer-separator']}>•</span>
                  <button className={styles['help-footer-link']}>Licences</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}