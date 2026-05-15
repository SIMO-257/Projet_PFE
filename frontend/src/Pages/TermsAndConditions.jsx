import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, CheckCircle2 } from 'lucide-react';

export default function TermsAndConditions() {
    const navigate = useNavigate();
    const [hasReadToBottom, setHasReadToBottom] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const scrollRef = useRef(null);

    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
            // Add a small buffer (10px) to ensure it triggers reliably on all browsers
            if (scrollTop + clientHeight >= scrollHeight - 10) {
                setHasReadToBottom(true);
            }
        }
    };

    useEffect(() => {
        const currentRef = scrollRef.current;
        if (currentRef) {
            currentRef.addEventListener('scroll', handleScroll);
            // Initial check in case content is small or already at bottom
            handleScroll();
        }
        return () => {
            if (currentRef) {
                currentRef.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    const sections = [
        {
            title: "Introduction",
            content: "Les présentes conditions générales de vente régissent l'achat de titres de transport via notre application mobile. En accédant à nos services, vous reconnaissez avoir pris connaissance et accepté sans réserve l'intégralité de ces conditions. Ce document constitue un contrat entre vous et le prestataire de service."
        },
        {
            title: "Achat de billets",
            content: "L'acquisition de billets s'effectue directement via l'interface sécurisée de l'application. Chaque billet est dématérialisé et lié de manière unique à votre compte utilisateur. Il est strictement personnel et non transférable à un tiers après activation."
        },
        {
            title: "Tarifs et paiement",
            content: (
                <div className="space-y-4">
                    <ul className="list-disc pl-5 space-y-2 opacity-90 text-white/80">
                        <li>Tous nos tarifs sont exprimés en <strong className="text-[#f5d579]">MAD TTC</strong>.</li>
                        <li>Modes de recharge : Cartes bancaires, Portefeuille numérique, et points de vente partenaires.</li>
                        <li><strong className="text-[#f5d579]">Aucun frais caché</strong> : le prix affiché est le prix final payé.</li>
                        <li>Le prix en vigueur au moment de l'achat fait foi pour la transaction.</li>
                    </ul>
                    <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-[#f5d579]/20">
                        <Info size={18} className="text-[#f5d579] shrink-0 mt-0.5" />
                        <p className="text-xs italic leading-relaxed text-white/70">
                            Note : Les tarifs sont susceptibles d'évoluer selon les décisions réglementaires de transport urbain.
                        </p>
                    </div>
                </div>
            )
        },
        {
            title: "Validité et utilisation",
            content: "La validité d'un billet commence dès son achat ou son activation selon le type de titre choisi. Un billet doit être impérativement validé à chaque montée dans un véhicule via le scan du QR Code présent à bord. En cas de contrôle, vous devez présenter l'écran de validation actif sur votre appareil."
        },
        {
            title: "Remboursement",
            content: "Compte tenu de la nature instantanée du service, aucun remboursement n'est accordé après l'achat, sauf en cas de défaut technique majeur imputable à la plateforme. Toute réclamation doit être formulée via le support client dans un délai maximum de 48h suivant l'incident."
        },
        {
            title: "Responsabilité",
            content: "L'utilisateur est seul responsable de la sécurité de son compte et de son appareil mobile. Le prestataire décline toute responsabilité en cas de perte, vol de l'appareil ou épuisement de la batterie lors d'un contrôle de titre de transport. Veillez à maintenir votre appareil chargé et sécurisé."
        }
    ];

    return (
        <div className="app-shell font-sora">
            <div className="app-frame">
                <div className="app-card bg-gradient-to-br from-[#400106] to-[#260101] relative flex flex-col h-[100dvh]">
                    
                    {/* Header */}
                    <div className="p-6 md:p-8 border-b border-[#f5d579]/10 bg-black/20 flex-shrink-0 z-10 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <h1 className="text-2xl md:text-3xl font-bold text-[#f5d579]">
                                Conditions Générales
                            </h1>
                            <span className="px-3 py-1 bg-[#f5d579]/10 text-[#f5d579] text-xs font-bold rounded-full border border-[#f5d579]/30">
                                6 sections
                            </span>
                        </div>
                        <p className="text-white/60 text-sm">Veuillez lire attentivement avant de continuer.</p>
                    </div>

                    {/* Content Area */}
                    <div 
                        ref={scrollRef}
                        className="app-content p-6 md:p-8 space-y-10 scroll-smooth relative"
                    >
                        <style>{`
                            div::-webkit-scrollbar {
                                width: 4px;
                            }
                            div::-webkit-scrollbar-track {
                                background: rgba(255, 255, 255, 0.05);
                                border-radius: 10px;
                            }
                            div::-webkit-scrollbar-thumb {
                                background-color: #f5d579;
                                border-radius: 10px;
                            }
                        `}</style>

                        {sections.map((section, index) => (
                            <section key={index} className="relative pl-12 max-w-3xl mx-auto">
                                {/* Section Number Circle */}
                                <div className="absolute left-0 top-0 w-8 h-8 rounded-full border border-[#f5d579] flex items-center justify-center text-[#f5d579] text-sm font-bold bg-[#f5d579]/5">
                                    {index + 1}
                                </div>
                                <h2 className="text-[#f5d579] text-lg font-bold mb-3 uppercase tracking-wider">
                                    {section.title}
                                </h2>
                                <div className="text-white/80 text-sm leading-relaxed">
                                    {section.content}
                                </div>
                            </section>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="p-6 md:p-8 border-t border-[#f5d579]/10 bg-black/20 flex-shrink-0 z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.2)]">
                        <div className="max-w-3xl mx-auto">
                            <div className="mb-6">
                                <label 
                                    className={`flex items-start gap-3 cursor-pointer select-none transition-all duration-300 ${hasReadToBottom ? 'opacity-100' : 'opacity-40'}`}
                                >
                                    <div className="relative flex items-center mt-0.5">
                                        <input 
                                            type="checkbox" 
                                            disabled={!hasReadToBottom}
                                            checked={isChecked}
                                            onChange={(e) => setIsChecked(e.target.checked)}
                                            className={`
                                                w-5 h-5 rounded border-2 appearance-none cursor-pointer transition-all
                                                ${isChecked ? 'bg-[#f5d579] border-[#f5d579]' : 'bg-transparent border-[#f5d579]/40'}
                                                disabled:cursor-not-allowed
                                            `}
                                        />
                                        {isChecked && (
                                            <CheckCircle2 size={14} className="absolute left-0.5 top-0.5 text-[#260101] pointer-events-none" />
                                        )}
                                    </div>
                                    <span className={`text-sm leading-tight ${isChecked ? 'text-white' : 'text-white/60'}`}>
                                        J'ai lu et j'accepte l'intégralité des conditions générales d'utilisation.
                                    </span>
                                </label>
                                
                                {!hasReadToBottom && (
                                    <p className="text-[#f5d579] text-[10px] mt-2 font-medium tracking-wide uppercase animate-pulse">
                                        ⬇️ Faites défiler pour lire tout le contenu
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-4">
                                <button 
                                    onClick={() => navigate(-1)}
                                    className="flex-1 py-4 px-6 rounded-2xl border border-[#f5d579]/30 text-[#f5d579] font-bold text-sm hover:bg-[#f5d579]/5 transition-all active:scale-95"
                                >
                                    Retour
                                </button>
                                <button 
                                    onClick={() => navigate('/signup')}
                                    disabled={!isChecked}
                                    className={`
                                        flex-[2] py-4 px-6 rounded-2xl font-bold text-sm transition-all
                                        ${isChecked 
                                            ? 'bg-gradient-to-r from-[#f5d579] to-[#d4af37] text-[#260101] shadow-xl shadow-[#f5d579]/20 active:scale-95' 
                                            : 'bg-[#f5d579]/10 text-[#f5d579]/30 cursor-not-allowed'}
                                    `}
                                >
                                    Accepter et continuer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
