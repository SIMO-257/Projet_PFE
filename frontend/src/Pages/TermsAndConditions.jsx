import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Info, CheckCircle2 } from "lucide-react";

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
      currentRef.addEventListener("scroll", handleScroll);
      // Initial check in case content is small or already at bottom
      handleScroll();
    }
    return () => {
      if (currentRef) {
        currentRef.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const sections = [
    {
      title: "Introduction",
      content:
        "Les présentes conditions générales de vente régissent l'achat de titres de transport via notre application mobile. En accédant à nos services, vous reconnaissez avoir pris connaissance et accepté sans réserve l'intégralité de ces conditions. Ce document constitue un contrat entre vous et le prestataire de service.",
    },
    {
      title: "Achat de billets",
      content:
        "L'acquisition de billets s'effectue directement via l'interface sécurisée de l'application. Chaque billet est dématérialisé et lié de manière unique à votre compte utilisateur. Il est strictement personnel et non transférable à un tiers après activation.",
    },
    {
      title: "Tarifs et paiement",
      content: (
        <div className="space-y-4">
          <ul className="list-disc pl-5 space-y-2 opacity-90">
            <li>
              Tous nos tarifs sont exprimés en{" "}
              <strong className="text-[#8b6f47]">MAD TTC</strong>.
            </li>
            <li>
              Modes de recharge : Cartes bancaires, Portefeuille numérique, et
              points de vente partenaires.
            </li>
            <li>
              <strong className="text-[#8b6f47]">Aucun frais caché</strong> : le
              prix affiché est le prix final payé.
            </li>
            <li>
              Le prix en vigueur au moment de l'achat fait foi pour la
              transaction.
            </li>
          </ul>
          <div className="flex items-start gap-3 p-4 bg-[#2d1616] rounded-xl border border-[#4a2a2a]">
            <Info size={18} className="text-[#8b6f47] shrink-0 mt-0.5" />
            <p className="text-xs italic leading-relaxed text-[#9ca3af]">
              Note : Les tarifs sont susceptibles d'évoluer selon les décisions
              réglementaires de transport urbain.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Validité et utilisation",
      content:
        "La validité d'un billet commence dès son achat ou son activation selon le type de titre choisi. Un billet doit être impérativement validé à chaque montée dans un véhicule via le scan du QR Code présent à bord. En cas de contrôle, vous devez présenter l'écran de validation actif sur votre appareil.",
    },
    {
      title: "Remboursement",
      content:
        "Compte tenu de la nature instantanée du service, aucun remboursement n'est accordé après l'achat, sauf en cas de défaut technique majeur imputable à la plateforme. Toute réclamation doit être formulée via le support client dans un délai maximum de 48h suivant l'incident.",
    },
    {
      title: "Responsabilité",
      content:
        "L'utilisateur est seul responsable de la sécurité de son compte et de son appareil mobile. Le prestataire décline toute responsabilité en cas de perte, vol de l'appareil ou épuisement de la batterie lors d'un contrôle de titre de transport. Veillez à maintenir votre appareil chargé et sécurisé.",
    },
  ];

  return (
    <div className="min-h-[100dvh] bg-[#2a1a1a] p-4 md:p-6 font-sora flex flex-col justify-center">
      <div className="w-full max-w-[42rem] mx-auto">
        <div className="bg-[#3d1f1f] rounded-lg overflow-hidden border border-[#5a3a3a] flex flex-col max-h-[85vh] shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-b from-[#4a2626] to-[#3d1f1f] p-6 border-b border-[#5a3a3a]">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-xl md:text-2xl font-semibold text-white">
                Conditions Générales
              </h1>
              <button
                onClick={() => navigate(-1)}
                className="text-[#9ca3af] hover:text-white transition-colors"
              >
                <span className="text-xl font-bold">×</span>
              </button>
            </div>
            <p className="text-[#9ca3af] text-sm">
              Veuillez lire attentivement avant de continuer.
            </p>
          </div>

          {/* Content Area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth"
          >
            <style>{`
                            div::-webkit-scrollbar {
                                width: 6px;
                            }
                            div::-webkit-scrollbar-track {
                                background: #2d1616;
                                border-radius: 4px;
                            }
                            div::-webkit-scrollbar-thumb {
                                background-color: #8b6f47;
                                border-radius: 4px;
                            }
                        `}</style>

            {sections.map((section, index) => (
              <section key={index} className="relative pl-12">
                {/* Section Number Circle */}
                <div className="absolute left-0 top-0 w-8 h-8 rounded-full border border-[#8b6f47] flex items-center justify-center text-[#8b6f47] text-sm font-bold bg-[#2d1616]">
                  {index + 1}
                </div>
                <h2 className="text-white text-lg font-medium mb-3 uppercase tracking-wider">
                  {section.title}
                </h2>
                <div className="text-[#9ca3af] text-sm leading-relaxed">
                  {section.content}
                </div>
              </section>
            ))}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[#5a3a3a] bg-[#3d1f1f]">
            <div className="mb-6">
              <label
                className={`flex items-start gap-3 cursor-pointer select-none transition-all duration-300 ${hasReadToBottom ? "opacity-100" : "opacity-50"}`}
              >
                <div className="relative flex items-center mt-0.5">
                  <input
                    type="checkbox"
                    disabled={!hasReadToBottom}
                    checked={isChecked}
                    onChange={(e) => setIsChecked(e.target.checked)}
                    className={`
                                            w-5 h-5 rounded border appearance-none cursor-pointer transition-all
                                            ${isChecked ? "bg-[#8b6f47] border-[#8b6f47]" : "bg-[#2d1616] border-[#5a3a3a]"}
                                            disabled:cursor-not-allowed
                                        `}
                  />
                  {isChecked && (
                    <CheckCircle2
                      size={14}
                      className="absolute left-0.5 top-0.5 text-[#2d1616] pointer-events-none"
                    />
                  )}
                </div>
                <span
                  className={`text-sm leading-tight ${isChecked ? "text-white" : "text-[#9ca3af]"}`}
                >
                  J'accepte les conditions générales de vente
                </span>
              </label>

              {!hasReadToBottom && (
                <p className="text-[#8b6f47] text-xs mt-2 font-medium tracking-wide animate-pulse">
                  ⬇️ Faites défiler pour lire tout le contenu
                </p>
              )}
            </div>

            <button
              onClick={() => navigate(-1)}
              disabled={!isChecked}
              className={`
                                w-full py-4 px-6 rounded-lg font-semibold text-base transition-all
                                ${
                                  isChecked
                                    ? "bg-gradient-to-r from-[#6b4423] to-[#8b6f47] text-white shadow-lg hover:from-[#7a5129] hover:to-[#9d7d52]"
                                    : "bg-[#2d1616] border border-[#4a2a2a] text-[#6b7280] cursor-not-allowed"
                                }
                            `}
            >
              Accepter et continuer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
