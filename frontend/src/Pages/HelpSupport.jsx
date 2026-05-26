import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Components/Layout/Header';
import styles from '../Styles/HelpSupport.module.css';
import { getUserRapports, submitRapport } from '../services/rapportService';

const HelpSupport = () => {
  const navigate = useNavigate();

  // ── State ──
  const [openFaq, setOpenFaq] = useState(null);
  const [rapports, setRapports] = useState([]);
  const [rapportsLoading, setRapportsLoading] = useState(true);

  // Form state — Rapport
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
      showToast('Rapport envoyé avec succès !', 'success');
      setFormType('Paiement');
      setFormSubject('');
      setFormDescription('');
      loadRapports();
    } catch {
      showToast('Erreur lors de l\'envoi du rapport.', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  // ── Data ──
  const faqs = [
    {
      question: 'Comment recharger mon portefeuille ?',
      answer: 'Rendez-vous dans la section "Portefeuille" depuis l\'accueil, cliquez sur "Recharger", choisissez un montant, puis validez le paiement par carte bancaire via notre système sécurisé Stripe. Le crédit est disponible instantanément après confirmation.',
    },
    {
      question: 'Mon billet n\'est pas valide, que faire ?',
      answer: 'Si votre QR Code ou NFC ne fonctionne pas, vérifiez que votre billet est encore valide (date d\'expiration). Si le problème persiste, soumettez un rapport depuis cette page avec le type "Billet invalide" en décrivant la situation. Notre équipe vous répondra sous 24h.',
    },
    {
      question: 'Comment contacter le support ?',
      answer: 'Vous pouvez nous contacter directement via le bouton "Contacter le support" ci-dessous pour envoyer un message. Vous pouvez aussi utiliser le formulaire "Soumettre un rapport" pour les problèmes spécifiques. Chaque demande reçoit un suivi avec statut visible dans la section "Mes rapports".',
    },
    {
      question: 'Puis-je obtenir un remboursement ?',
      answer: 'Les billets achetés sont remboursables sous 14 jours uniquement s\'ils n\'ont pas été utilisés. Pour demander un remboursement, veuillez soumettre un rapport de type "Paiement" avec les détails de votre achat. Les remboursements sont traités sous 5 à 10 jours ouvrés.',
    },
    {
      question: 'Pourquoi mon QR Code ne fonctionne pas ?',
      answer: 'Plusieurs raisons possibles : billet expiré, écran trop sombre (augmentez la luminosité), ou problème de lecture du validateur. Essayez de régénérer l\'affichage du QR Code depuis la page du billet. Si le problème persiste, contactez le support.',
    },
  ];

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
            title="Aide & Support"
            showBackButton={true}
            onBack={goBack}
          />

          <div className={`app-content ${styles.scrollContainer}`}>
            {/* ======== 1. SOUMETTRE UN RAPPORT ======== */}
            <div className="mb-7">
              <h2 className="text-[#c8a96e] text-sm font-bold uppercase tracking-wider mb-4 flex items-center">
                <span className={styles.sectionNumber}>1</span>
                Soumettre un rapport
              </h2>

              <form onSubmit={handleSubmitReport} className="bg-[rgba(255,255,255,0.04)] border border-[rgba(200,169,110,0.15)] rounded-xl p-5 space-y-4">
                <div>
                  <label className="text-[#e8ddd0] text-xs uppercase tracking-wide mb-2 block opacity-60">Type de problème</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full bg-[rgba(0,0,0,0.3)] border border-[rgba(200,169,110,0.2)] rounded-xl px-4 py-3 text-[#e8ddd0] text-sm focus:border-[#c8a96e] outline-none transition-all"
                  >
                    <option>Paiement</option>
                    <option>Billet invalide</option>
                    <option>Problème technique</option>
                    <option>Autre</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#e8ddd0] text-xs uppercase tracking-wide mb-2 block opacity-60">Sujet</label>
                  <input
                    type="text"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    placeholder="Résumé du problème..."
                    maxLength={255}
                    className="w-full bg-[rgba(0,0,0,0.3)] border border-[rgba(200,169,110,0.2)] rounded-xl px-4 py-3 text-[#e8ddd0] text-sm placeholder-[rgba(232,221,208,0.3)] focus:border-[#c8a96e] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-[#e8ddd0] text-xs uppercase tracking-wide mb-2 block opacity-60">Description</label>
                  <textarea
                    rows={4}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value.slice(0, 5000))}
                    placeholder="Décrivez le problème en détail..."
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
                      Envoi...
                    </>
                  ) : 'Envoyer le rapport'}
                </button>
              </form>
            </div>

            {/* ======== 2. FAQ ======== */}
            <div className="mb-7">
              <h2 className="text-[#c8a96e] text-sm font-bold uppercase tracking-wider mb-4 flex items-center">
                <span className={styles.sectionNumber}>3</span>
                Questions Fréquentes
              </h2>

              <div className="space-y-2">
                {faqs.map((faq, index) => (
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
            </div>

            {/* ======== 3. MES RAPPORTS / SUIVI ======== */}
            <div className="mb-6">
              <h2 className="text-[#c8a96e] text-sm font-bold uppercase tracking-wider mb-4 flex items-center">
                <span className={styles.sectionNumber}>3</span>
                Mes rapports / Suivi
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
                  <p className="text-[rgba(232,221,208,0.4)] text-sm">Aucun rapport soumis pour le moment.</p>
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
              <p>© 2026 CasaWay • Tous droits réservés</p>
              <p className="mt-1">Version 2.4.1</p>
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
              <h3 className="text-[#c8a96e] font-bold text-lg">Détail du rapport</h3>
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
                <p className="text-[rgba(232,221,208,0.4)] text-xs uppercase tracking-wide mb-1">Type</p>
                <p className="text-[#e8ddd0] text-sm">{selectedRapport.type_probleme}</p>
              </div>

              {selectedRapport.sujet && (
                <div>
                  <p className="text-[rgba(232,221,208,0.4)] text-xs uppercase tracking-wide mb-1">Sujet</p>
                  <p className="text-[#e8ddd0] text-sm">{selectedRapport.sujet}</p>
                </div>
              )}

              <div>
                <p className="text-[rgba(232,221,208,0.4)] text-xs uppercase tracking-wide mb-1">Description</p>
                <p className="text-[#e8ddd0] text-sm leading-relaxed whitespace-pre-wrap">{selectedRapport.description}</p>
              </div>

              <div>
                <p className="text-[rgba(232,221,208,0.4)] text-xs uppercase tracking-wide mb-1">Soumis le</p>
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

export default HelpSupport;
