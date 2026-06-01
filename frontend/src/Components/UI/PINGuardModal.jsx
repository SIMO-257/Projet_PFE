import { useState, useEffect, useRef, useCallback } from 'react';
import { verifyPin } from '../../services/pinService';

const PIN_LENGTH = 4;

export default function PINGuardModal({
    show,
    onClose,
    onSuccess,
    title = "Code PIN",
    description = "Entrez votre code PIN pour continuer",
    loading: externalLoading = false,
}) {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [shake, setShake] = useState(false);
    const inputRef = useRef(null);

    // Auto-focus on mount
    useEffect(() => {
        if (show) {
            setPin('');
            setError('');
            setVerifying(false);
            setShake(false);
            // Small delay so the animation plays after mount
            const t = setTimeout(() => inputRef.current?.focus(), 100);
            return () => clearTimeout(t);
        }
    }, [show]);

    // Use refs to avoid stale closures in keydown handler
    const pinRef = useRef(pin);
    useEffect(() => { pinRef.current = pin; }, [pin]);
    const verifyRef = useRef(handleVerify);
    useEffect(() => { verifyRef.current = handleVerify; }, [handleVerify]);

    const handleKeyDown = useCallback((e) => {
        const currentPin = pinRef.current;
        if (e.key >= '0' && e.key <= '9' && currentPin.length < PIN_LENGTH) {
            setPin(prev => prev + e.key);
            setError('');
        } else if (e.key === 'Backspace') {
            setPin(prev => prev.slice(0, -1));
            setError('');
        } else if (e.key === 'Enter' && currentPin.length === PIN_LENGTH) {
            verifyRef.current?.();
        }
    }, []);

    const handleDigit = (digit) => {
        if (pin.length < PIN_LENGTH) {
            setPin(prev => prev + digit);
            setError('');
        }
    };

    const handleBackspace = () => {
        setPin(prev => prev.slice(0, -1));
        setError('');
    };

    const handleVerify = async () => {
        if (pin.length !== PIN_LENGTH || verifying || externalLoading) return;

        setVerifying(true);
        setError('');

        try {
            const res = await verifyPin(pin);
            const pinToken = res?.data?.pin_token || res?.pin_token;

            if (onSuccess && pinToken) {
                onSuccess(pinToken);
            } else {
                setError('Erreur de validation');
                triggerShake();
            }
        } catch (err) {
            const msg = err?.response?.data?.message || 'Code PIN incorrect';
            setError(msg);
            triggerShake();
        } finally {
            setVerifying(false);
        }
    };

    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setPin('');
    };

    if (!show) return null;

    const isComplete = pin.length === PIN_LENGTH;
    const isLoading = verifying || externalLoading;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn p-4">
            <div
                className={`bg-gradient-to-br from-[#2f0205]/95 to-[#180103]/95 border border-[#f5d579]/20 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl shadow-black/50 animate-countUp ${shake ? 'animate-shake' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Header ── */}
                <div className="relative pt-8 pb-4 px-6 text-center">
                    {/* Lock icon */}
                    <div className="mx-auto w-14 h-14 rounded-full bg-[#f5d579]/10 border border-[#f5d579]/20 flex items-center justify-center mb-4">
                        <svg className="w-7 h-7 text-[#f5d579]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                        </svg>
                    </div>

                    <h2 className="text-[#f5d579] font-bold text-lg">{title}</h2>
                    <p className="text-white/50 text-xs mt-1">{description}</p>
                </div>

                {/* ── PIN Dots Display ── */}
                <div className="flex justify-center gap-3 my-6">
                    {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                        <div
                            key={i}
                            className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                                pin.length > i
                                    ? 'bg-[#f5d579] border-[#f5d579] scale-110'
                                    : 'bg-transparent border-white/30'
                            }`}
                        />
                    ))}
                </div>

                {/* ── Error Message ── */}
                {error && (
                    <p className="text-red-400 text-xs text-center px-6 -mt-4 mb-2 animate-fadeIn">
                        {error}
                    </p>
                )}

                {/* ── Hidden input for keyboard support ── */}
                <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="absolute opacity-0 pointer-events-none"
                    value={pin}
                    onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, PIN_LENGTH);
                        setPin(val);
                        setError('');
                    }}
                    onKeyDown={handleKeyDown}
                    autoComplete="off"
                    aria-hidden="true"
                />

                {/* ── Numeric Keypad ── */}
                <div className="px-6 pb-6">
                    <div className="grid grid-cols-3 gap-3 max-w-[260px] mx-auto">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                            <button
                                key={digit}
                                onClick={() => handleDigit(String(digit))}
                                disabled={isLoading}
                                className="w-full aspect-square rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-xl
                                    hover:bg-white/10 hover:border-white/20 active:scale-90 active:bg-[#f5d579]/20 transition-all duration-150
                                    disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {digit}
                            </button>
                        ))}

                        {/* Backspace */}
                        <button
                            onClick={handleBackspace}
                            disabled={isLoading || pin.length === 0}
                            className="w-full aspect-square rounded-2xl bg-white/5 border border-white/10 text-white/70
                                hover:bg-white/10 hover:border-white/20 active:scale-90 transition-all duration-150
                                disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
                            </svg>
                        </button>

                        {/* Digit 0 */}
                        <button
                            onClick={() => handleDigit('0')}
                            disabled={isLoading}
                            className="w-full aspect-square rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-xl
                                hover:bg-white/10 hover:border-white/20 active:scale-90 active:bg-[#f5d579]/20 transition-all duration-150
                                disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            0
                        </button>

                        {/* Confirm */}
                        <button
                            onClick={handleVerify}
                            disabled={!isComplete || isLoading}
                            className={`w-full aspect-square rounded-2xl font-bold text-lg transition-all duration-150 flex items-center justify-center
                                ${isComplete && !isLoading
                                    ? 'bg-gradient-to-br from-[#f5d579] to-[#d4af37] text-[#260101] shadow-lg shadow-[#f5d579]/20 active:scale-90 hover:shadow-xl hover:shadow-[#f5d579]/30'
                                    : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
                                }`}
                        >
                            {isLoading ? (
                                <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Cancel button */}
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="w-full mt-4 py-3 rounded-2xl text-white/50 text-sm font-medium
                            hover:text-white hover:bg-white/5 transition-all duration-150
                            disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Annuler
                    </button>
                </div>
            </div>


        </div>
    );
}
