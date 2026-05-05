import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../Components/Layout/Header';
import BottomNavigation from '../../Components/Layout/BottomNavigation';
import PurchasedCardItem from '../../Components/Cards/PurchasedCardItem';
import { fetchPurchasedCards, setDefaultPurchasedCard } from '../../services/clientService';

const PurchasedCards = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');

  const activeCards = cards.filter((card) => card.status === 'active');
  const expiredCards = cards.filter((card) => card.status === 'expired');

  const loadCards = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchPurchasedCards();
      setCards(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Erreur lors du chargement des tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  const handleSelect = async (ticketId) => {
    setSavingId(ticketId);
    setError('');
    try {
      await setDefaultPurchasedCard(ticketId);
      await loadCards();
    } catch (err) {
      setError(err?.response?.data?.message || 'Impossible de definir ce ticket par defaut.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2a0b0f] to-[#1a0507] flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="relative rounded-3xl shadow-2xl border border-yellow-500/20 overflow-hidden bg-gradient-to-br from-[#400106]/90 to-[#260101]/90 backdrop-blur-sm">
          <Header title="Mes cartes achetees" showBackButton={true} onBack={() => navigate(-1)} />

          <div className="max-h-[calc(100vh-200px)] overflow-y-auto no-scrollbar px-6 pb-24">
            {error && <p className="text-red-300 text-xs mb-3">{error}</p>}
            {loading ? (
              <p className="text-white/60 text-sm py-4">Chargement...</p>
            ) : cards.length === 0 ? (
              <p className="text-white/60 text-sm py-4 italic">Aucun ticket achete.</p>
            ) : (
              <div className="space-y-3 py-2">
                {activeCards.map((card) => (
                  <PurchasedCardItem
                    key={card.id}
                    card={card}
                    onSelect={handleSelect}
                    isSubmitting={savingId === card.id}
                  />
                ))}
                {expiredCards.map((card) => (
                  <PurchasedCardItem
                    key={card.id}
                    card={card}
                    onSelect={handleSelect}
                    isSubmitting={savingId === card.id}
                  />
                ))}
              </div>
            )}
          </div>

          <BottomNavigation />
        </div>
      </div>
    </div>
  );
};

export default PurchasedCards;
