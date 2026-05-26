import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import Header from '../../Components/Layout/Header';
import styles from '../../Styles/HelpSupport.module.css';
import { getUserRapports, submitRapport } from '../../services/rapportService';

const HelpSupportPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // ── FAQ state ──
  const [openFaq, setOpenFaq] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // ── Rapport state ──
  const [rapports, setRapports] = useState([]);
  const [rapportsLoading, setRapportsLoading] = useState(true);

  // Form state
  const [formType, setFormType] = useState('Paiement');
  const [formSubject, setFormSubject] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Detail modal state
  const [selectedRapport, setSelectedRapport] = useState(null);

  // Toast state
  const [toast, setToast] = useState(null);

  // ── Helpers ──
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // ── Load rapports ──
  const loadRapports = useCallback(async () => {
    setRapportsLoading(true);
    try {
      const res = await getUserRapports();
      setRapports(res?.data?.data ?? []);
    } catch {
      // silent
    } finally {
      setRapportsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRapports();
  }, [loadRapports]);

  // ── Handlers ──
  const goBack = () => navigate(-1);

  const toggleFaq = (index) => setOpenFaq(openFaq === index ? null : index);

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!formDescription.trim()) return;
    setFormSubmitting(true);
    try {
      await submitRapport({
        type_probleme: formType,
        sujet: formSubject,
        description: formDescription,
      });
      showToast(t('report_sent_success'), 'success');
      setFormType('Paiement');
      setFormSubject('');
      setFormDescription('');
      loadRapports();
    } catch {
      showToast(t('report_send_error'), 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Contact handlers
  const handleCall = () => {
    showToast(t('call_coming_soon'), 'info');
  };

  const handleEmail = () => {
    window.location.href = 'mailto:support@transport.ma';
  };

  const handleChat = () => {
    showToast(t('chat_coming_soon'), 'info');
  };

  // ── Data ──
  const faqs = [
    {
      question: t('faq_question_1'),
      answer: t('faq_answer_1'),
    },
    {
      question: t('faq_question_2'),
      answer: t('faq_answer_2'),
    },
    {
      question: t('faq_question_3'),
      answer: t('faq_answer_3'),
    },
  ];

  const filteredFaqs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBadgeClass = (statut) => {
    switch (statut) {
      case 'en attente': return styles.badgeEnAttente;
      case 'en cours': return styles.badgeEnCours;
      case 'résolu': return styles.badgeResolu;
      default: return '';
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="app-shell">
      <div className="app-frame">
        <div className={`${styles.helpCard} app-card`}>
          <Header
            title={t('help_support')}
            showBackButton={true}
            onBack={goBack}
          />

          <div className={`app-content ${styles.scrollContainer}`}>
            {/* ======== 1. SOUMETTRE UN RAPPORT ======== */}
            <div className="mb-7">
              <h2 className="text-[#c8a96e] text-sm font-bold uppercase tracking-wider mb-4 flex items-center">
                <span className={styles.sectionNumber}>1</span>
                {t('submit_report')}
              </h2>

              <form onSubmit={handleSubmitReport} className="bg-[rgba(255,255,255,0.04)] border border-[rgba(200,169,110,0.15)] rounded-xl p-5 space-y-4">
                <div>
                  <label className="text-[#e8ddd0] text-xs uppercase tracking-wide mb-2 block opacity-60">{t('problem_type')}</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full bg-[rgba(0,0,0,0.3)] border border-[rgba(200,169,110,0.2)] rounded-xl px-4 py-3 text-[#e8ddd0] text-sm focus:border-[#c8a96e] outline-none transition-all"
                  >
                    <option>{t('report_validation_issue')}</option>
                    <option>{t('report_payment_issue')}</option>
                    <option>{t('report_tech_bug')}</option>
                    <option>{t('report_other')}</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#e8ddd0] text-xs uppercase tracking-wide mb-2 block opacity-60">{t('report_subject')}</label>
                  <input
                    type="text"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    placeholder={t('problem_summary')}
                    maxLength={255}
                    className="w-full bg-[rgba(0,0,0,0.3)] border border-[rgba(200,169,110,0.2)] rounded-xl px-4 py-3 text-[#e8ddd0] text-sm placeholder-[rgba(232,221,208,0.3)] focus:border-[#c8a96e] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-[#e8ddd0] text-xs uppercase tracking-wide mb-2 block opacity-60">{t('problem_description')}</label>
                  <textarea
                    rows={4}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value.slice(0, 5000))}
                    placeholder={t('describe_problem')}
                    className="w-full bg-[rgba(0,0,0,0.3)] border border-[rgba(200,169,110,0.2)] rounded-xl px-4 py-3 text-[#e8ddd0] text-sm placeholder-[rgba(232,221,208,0.3)] focus:border-[#c8a96e] outline-none resize-none transition-all"
                  />
                  <div className="text-right text-[rgba(232,221,208,0.3)] text-xs mt-1">{formDescription.length}/5000</div>
                </div>

                <button
                  type="submit"
                  disabled={formSubmitting || !formDescription.trim()}
                  className="w-full bg-[#c8a96e] text-[#3d1f1a] font-semibold py-3 rounded-xl hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                >
                  {formSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      {t('sending')}
                    </>
                  ) : t('send_report')}
                </button>
              </form>
            </div>

            {/* ======== 2. FAQ ======== */}
            <div className="mb-7">
              <h2 className="text-[#c8a96e] text-sm font-bold uppercase tracking-wider mb-4 flex items-center">
                <span className={styles.sectionNumber}>2</span>
                {t('faq_section')}
              </h2>

              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative bg-[rgba(255,255,255,0.04)] border border-[rgba(200,169,110,0.15)] rounded-xl focus-within:border-yellow-500/30 transition-all">
                  <div className="flex items-center px-4 py-3">
                    <svg className="w-5 h-5 text-white/40 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <input
                      type="text"
                      placeholder={t('search_help')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/40"
                    />
                  </div>
                </div>
              </div>

              {filteredFaqs.length === 0 ? (
                <p className="text-white/40 text-sm text-center py-4">{t('no_result_found')}</p>
              ) : (
                <div className="space-y-2">
                  {filteredFaqs.map((faq, index) => (
                    <div key={index} className="bg-[rgba(255,255,255,0.04)] border border-[rgba(200,169,110,0.15)] rounded-xl overflow-hidden transition-all">
                      <button
                        onClick={() => toggleFaq(index)}
                        className="w-full text-left px-5 py-4 flex items-center justify-between gap-3"
                      >
                        <span className="text-[#e8ddd0] font-medium text-sm">{faq.question}</span>
                        <svg
                          className={`w-4 h-4 text-[#c8a96e] flex-shrink-0 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <div
                        className={`transition-all duration-300 overflow-hidden ${
                          openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="px-5 pb-4 text-[rgba(232,221,208,0.7)] text-sm leading-relaxed border-t border-[rgba(200,169,110,0.1)] pt-3">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ======== 3. CONTACT SECTION ======== */}
            <div className="mb-7">
              <h2 className="text-[#c8a96e] text-sm font-bold uppercase tracking-wider mb-4 flex items-center">
                <span className={styles.sectionNumber}>3</span>
                {t('contact_us')}
              </h2>

              <div className="space-y-3">
                <ContactItem
                  icon="phone"
                  title={t('contact_phone_title')}
                  subtitle="05-22-XX-XX-XX"
                  description={t('contact_phone_hours')}
                  buttonText={t('contact_call_now')}
                  onClick={handleCall}
                />
                <ContactItem
                  icon="email"
                  title={t('contact_email_title')}
                  subtitle="support@transport.ma"
                  description={t('contact_email_response')}
                  buttonText={t('contact_send_email')}
                  onClick={handleEmail}
                />
                <ContactItem
                  icon="chat"
                  title={t('contact_chat_title')}
                  status={t('contact_online')}
                  description={t('contact_chat_hours')}
                  buttonText={t('contact_start_chat')}
                  onClick={handleChat}
                />
              </div>
            </div>

            {/* ======== 4. MES RAPPORTS / SUIVI ======== */}
            <div className="mb-6">
              <h2 className="text-[#c8a96e] text-sm font-bold uppercase tracking-wider mb-4 flex items-center">
                <span className={styles.sectionNumber}>4</span>
                {t('my_reports')}
              </h2>

              {rapportsLoading ? (
                <div className="flex justify-center py-8">
                  <svg className="animate-spin h-6 w-6 text-[#c8a96e]" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                </div>
              ) : rapports.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 mx-auto text-[rgba(200,169,110,0.2)] mb-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-[rgba(232,221,208,0.4)] text-sm">{t('no_reports')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {rapports.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => setSelectedRapport(r)}
                      className={styles.rapportItem}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-[#e8ddd0] text-sm font-medium truncate">
                            {r.sujet || r.type_probleme}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[rgba(232,221,208,0.4)] text-xs">{r.type_probleme}</span>
                            <span className="text-[rgba(232,221,208,0.15)]">•</span>
                            <span className="text-[rgba(232,221,208,0.4)] text-xs">{formatDate(r.created_at)}</span>
                          </div>
                        </div>
                        <span className={`${styles.badge} ${getBadgeClass(r.statut)} flex-shrink-0`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            r.statut === 'en attente' ? 'bg-[#ff9f43]' :
                            r.statut === 'en cours' ? 'bg-[#3699ff]' : 'bg-[#00c9a7]'
                          }`} />
                          {r.statut}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="text-center text-[rgba(232,221,208,0.25)] text-xs mt-6 pb-4">
              <p>{t('footer_copyright')}</p>
              <p className="mt-1">{t('app_version', { version: '2.4.1' })}</p>
              <p className="mt-2">{t('footer_made_with')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Detail Modal ── */}
      {selectedRapport && (
        <div className={styles.modalOverlay} onClick={() => setSelectedRapport(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedRapport(null)}
              className="absolute top-4 right-4 text-[rgba(232,221,208,0.4)] hover:text-[#e8ddd0] transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#c8a96e] font-bold text-lg">{t('report_detail')}</h3>
              <span className={`${styles.badge} ${getBadgeClass(selectedRapport.statut)}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  selectedRapport.statut === 'en attente' ? 'bg-[#ff9f43]' :
                  selectedRapport.statut === 'en cours' ? 'bg-[#3699ff]' : 'bg-[#00c9a7]'
                }`} />
                {selectedRapport.statut}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-[rgba(232,221,208,0.4)] text-xs uppercase tracking-wide mb-1">{t('problem_type')}</p>
                <p className="text-[#e8ddd0] text-sm">{selectedRapport.type_probleme}</p>
              </div>

              {selectedRapport.sujet && (
                <div>
                  <p className="text-[rgba(232,221,208,0.4)] text-xs uppercase tracking-wide mb-1">{t('report_subject')}</p>
                  <p className="text-[#e8ddd0] text-sm">{selectedRapport.sujet}</p>
                </div>
              )}

              <div>
                <p className="text-[rgba(232,221,208,0.4)] text-xs uppercase tracking-wide mb-1">{t('problem_description')}</p>
                <p className="text-[#e8ddd0] text-sm leading-relaxed whitespace-pre-wrap">{selectedRapport.description}</p>
              </div>

              <div>
                <p className="text-[rgba(232,221,208,0.4)] text-xs uppercase tracking-wide mb-1">{t('submitted_on')}</p>
                <p className="text-[rgba(232,221,208,0.6)] text-sm">{formatDate(selectedRapport.created_at)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            )}
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Reusable subcomponents ---

const ContactItem = ({ icon, title, subtitle, status, description, buttonText, onClick }) => (
  <div className="bg-black/40 rounded-xl border border-white/10 p-5 space-y-3">
    <div className="flex items-start space-x-4">
      <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-1">
        <Icon name={icon} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm leading-tight">{title}</p>
        {subtitle && <p className="text-white/60 text-sm mt-2 break-all">{subtitle}</p>}
        {status && <p className="text-green-400 text-xs mt-1 font-semibold">{status}</p>}
        <p className="text-white/40 text-xs mt-2 leading-relaxed">{description}</p>
      </div>
    </div>
    <div className="pl-14 -mt-2">
      <button
        onClick={onClick}
        className="bg-white/5 hover:bg-white/10 rounded-lg px-4 py-2 text-yellow-500 text-sm font-medium transition-colors"
      >
        {buttonText}
      </button>
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

export default HelpSupportPage;
