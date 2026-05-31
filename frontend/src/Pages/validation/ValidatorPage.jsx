import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jsQR from 'jsqr';
import Header from '../../Components/Layout/Header';
import { consumeQrValidationToken, validateTicket } from '../../services/ticketService';
import { adminConsumeQrValidationToken, adminValidateTicket } from '../../services/adminService';

export default function ValidatorPage () {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const frameRequestRef = useRef(null);
  const fileInputRef = useRef(null);

  const [scanValue, setScanValue] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validatorId, setValidatorId] = useState('PC-VALIDATOR-01');
  const [location, setLocation] = useState('Desk A');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showConfig, setShowConfig] = useState(false);

  const isAdminPath = window.location.pathname.startsWith('/admin');

  const stopCamera = () => {
    if (frameRequestRef.current) {
      cancelAnimationFrame(frameRequestRef.current);
      frameRequestRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const isJwtLikeToken = (value) => {
    const parts = String(value || '').trim().split('.');
    return parts.length === 3 && parts.every((part) => part.length > 0);
  };

  const extractTicketUuid = (raw) => {
    const value = String(raw || '').trim();
    if (!value) return '';
    try {
      const parsed = JSON.parse(value);
      if (parsed?.ticket_uuid) return String(parsed.ticket_uuid).trim();
      if (parsed?.uuid) return String(parsed.uuid).trim();
    } catch (_) {}
    return value;
  };

  const processValidation = async (rawCode) => {
    const rawValue = String(rawCode || '').trim();
    const ticketUuid = extractTicketUuid(rawValue);

    setIsSubmitting(true);
    setError('');
    setResult(null);

    try {
      let response;
      if (isJwtLikeToken(rawValue)) {
        const api = isAdminPath ? adminConsumeQrValidationToken : consumeQrValidationToken;
        response = await api({
          validation_token: rawValue,
          validator_id: validatorId || 'PC-VALIDATOR-01',
          location: location || 'Desk A',
        });
      } else {
        if (!ticketUuid) {
          setError('Invalid code. No ticket UUID detected.');
          setIsSubmitting(false);
          return;
        }
        const api = isAdminPath ? adminValidateTicket : validateTicket;
        const payload = isAdminPath
          ? { validator_id: validatorId || 'PC-VALIDATOR-01', location: location || 'Desk A' }
          : { validation_type: 'qr', validator_id: validatorId || 'PC-VALIDATOR-01', location: location || 'Desk A' };
        response = await api(ticketUuid, payload);
      }

      setResult({
        ok: true,
        ticketUuid: ticketUuid || '(token)',
        message: response?.message || 'Validation successful.',
        statusAfter: response?.data?.status_after || response?.status_after || null,
        remainingUses: response?.data?.remaining_uses ?? response?.remaining_uses ?? null,
      });
    } catch (err) {
      setResult({
        ok: false,
        ticketUuid: ticketUuid || '(token)',
        message: err?.response?.data?.message || 'Validation failed.',
        details: err?.response?.data?.data || null,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const scanFrame = async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      frameRequestRef.current = requestAnimationFrame(scanFrame);
      return;
    }
    try {
      let width = video.videoWidth;
      let height = video.videoHeight;
      const MAX_DIMENSION = 800;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(video, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "attemptBoth",
      });
      if (code && code.data) {
        const raw = code.data;
        setScanValue(raw);
        stopCamera();
        await processValidation(raw);
        return;
      }
    } catch (_) {}
    frameRequestRef.current = requestAnimationFrame(scanFrame);
  };

  const startCamera = async () => {
    setError('');
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsScanning(true);
      frameRequestRef.current = requestAnimationFrame(scanFrame);
    } catch (err) {
      setError(err?.message || 'Could not start camera. Check permissions.');
      stopCamera();
    }
  };

  const handleManualValidate = async () => {
    await processValidation(scanValue);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      event.target.value = '';
      return;
    }
    setError('');
    setResult(null);
    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = async () => {
        URL.revokeObjectURL(objectUrl);
        const MAX_DIMENSION = 800;
        let width = img.width;
        let height = img.height;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "attemptBoth"
        });
        if (code && code.data) {
          setScanValue(code.data);
          await processValidation(code.data);
        } else {
          setError('No QR code detected in this image. Make sure the code is readable.');
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        setError('Invalid image format or corrupted image.');
      };
      img.src = objectUrl;
    } catch (err) {
      setError(err?.message || 'Could not analyze this image.');
    } finally {
      event.target.value = '';
    }
  };

  const dismissResult = () => {
    setResult(null);
    setError('');
    setScanValue('');
  };

  const isProcessing = isSubmitting || isScanning;

  // Shared content used in both admin and standalone modes
  const renderContent = () => (
    <>
      {/* ── Config (collapsible) ── */}
      <button
        type="button"
        onClick={() => setShowConfig(!showConfig)}
        className="flex items-center gap-2 text-white/40 text-xs hover:text-white/70 transition-colors"
      >
        <svg className={`w-3 h-3 transition-transform ${showConfig ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
        Configuration
      </button>

      {showConfig && (
        <div className="bg-black/20 border border-white/10 rounded-2xl p-4 space-y-3 animate-fade-in">
          <div>
            <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">Validator ID</label>
            <input
              type="text"
              value={validatorId}
              onChange={(e) => setValidatorId(e.target.value)}
              className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500/50"
            />
          </div>
          <div>
            <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500/50"
            />
          </div>
        </div>
      )}

      {/* ── Camera Section ── */}
      <div className="bg-black/20 border border-white/10 rounded-2xl overflow-hidden">
        {isScanning && (
          <div className="relative">
            <video ref={videoRef} className="w-full aspect-video object-cover bg-black/60" muted playsInline />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-2 border-yellow-500/60 rounded-xl animate-pulse" />
            </div>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
              <div className="bg-yellow-500/20 backdrop-blur-sm text-yellow-300 text-xs px-4 py-1.5 rounded-full border border-yellow-500/30">
                Scanning...
              </div>
            </div>
          </div>
        )}

        <div className="p-4">
          {isScanning ? (
            <button
              type="button"
              onClick={stopCamera}
              className="w-full rounded-xl border border-red-500/40 bg-red-500/10 text-red-300 py-3 text-sm font-semibold hover:bg-red-500/20 transition-colors"
            >
              Stop Camera
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={startCamera}
                disabled={isProcessing}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-300 py-5 hover:bg-yellow-500/20 transition-colors disabled:opacity-40"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-semibold">Scan QR</span>
                <span className="text-[10px] text-yellow-400/50">with Camera</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 text-white py-5 hover:bg-white/10 transition-colors disabled:opacity-40"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                <span className="text-sm font-semibold">Upload QR</span>
                <span className="text-[10px] text-white/50">from Gallery</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Manual entry (compact) ── */}
      <div className="bg-black/20 border border-white/10 rounded-2xl p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={scanValue}
            onChange={(e) => setScanValue(e.target.value)}
            placeholder="Paste UUID or token..."
            className="flex-1 rounded-lg bg-black/40 border border-white/10 px-3 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-yellow-500/50"
            onKeyDown={(e) => e.key === 'Enter' && handleManualValidate()}
          />
          <button
            type="button"
            onClick={handleManualValidate}
            disabled={isSubmitting || !scanValue.trim()}
            className="rounded-lg border border-yellow-500/40 bg-yellow-500/20 text-yellow-300 px-4 py-2.5 text-sm font-semibold hover:bg-yellow-500/30 transition-colors disabled:opacity-40 shrink-0"
          >
            {isSubmitting ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : 'Validate'}
          </button>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300 text-sm flex items-start gap-3">
          <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </>
  );

  return (
    <>
      {isAdminPath ? (
        /* Inside admin layout — skip shell wrappers, fuse with admin background */
        <>
          <Header
            title="PC Validator"
            showBackButton={true}
            onBack={() => navigate(-1)}
          />
          <div className="px-6 pb-8 space-y-5">
            {renderContent()}
          </div>
        </>
      ) : (
        /* Standalone mode (non-admin) — full shell with card */
        <div className="app-shell">
          <div className="app-frame">
            <div className="app-card bg-gradient-to-br from-[#2f0205]/95 to-[#180103]/95">
              <Header
                title="PC Validator"
                showBackButton={true}
                onBack={() => navigate(-1)}
              />
              <div className="app-content px-6 pb-8 space-y-5">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Result Modal ── */}
      {result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={dismissResult}>
          <div
            className="relative w-full max-w-sm rounded-3xl overflow-hidden border border-white/10 backdrop-blur-lg shadow-2xl bg-gradient-to-br from-[#2f0205]/95 to-[#180103]/95 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`absolute top-0 left-0 right-0 h-1 ${
              result.ok ? 'bg-green-500' : 'bg-red-500'
            }`} />

            <div className="p-6 text-center">
              <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                result.ok
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {result.ok ? (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>

              <h2 className={`text-xl font-bold mb-1 ${
                result.ok ? 'text-green-400' : 'text-red-400'
              }`}>
                {result.ok ? 'Validation Success' : 'Validation Failed'}
              </h2>

              <p className="text-white/60 text-sm mb-5">
                {result.message}
              </p>

              <div className="bg-black/20 border border-white/10 rounded-xl p-4 text-left text-sm space-y-2 mb-5">
                <div className="flex justify-between">
                  <span className="text-white/50">Ticket</span>
                  <span className="text-white/80 font-mono text-xs truncate ml-2 max-w-[180px]">{result.ticketUuid}</span>
                </div>
                {result.ok && result.statusAfter && (
                  <div className="flex justify-between">
                    <span className="text-white/50">Status</span>
                    <span className="text-green-400 font-medium capitalize">{result.statusAfter}</span>
                  </div>
                )}
                {result.ok && result.remainingUses !== null && (
                  <div className="flex justify-between">
                    <span className="text-white/50">Remaining</span>
                    <span className="text-white/80 font-medium">{result.remainingUses} uses</span>
                  </div>
                )}
                {!result.ok && result.details && (
                  <div className="flex justify-between">
                    <span className="text-white/50">Details</span>
                    <span className="text-red-400 text-xs text-right max-w-[180px]">
                      {typeof result.details === 'string' ? result.details : JSON.stringify(result.details)}
                    </span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={dismissResult}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-colors border border-white/20 bg-white/5 text-white/80 hover:bg-white/10"
              >
                Scan Another
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
