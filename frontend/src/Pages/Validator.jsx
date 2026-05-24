import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jsQR from 'jsqr';
import Header from '../Components/Layout/Header';
import { consumeQrValidationToken, validateTicket } from '../services/ticketService';

export default function ValidatorScreen ()  {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);
  const frameRequestRef = useRef(null);

  const [scanValue, setScanValue] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validatorId, setValidatorId] = useState('PC-VALIDATOR-01');
  const [location, setLocation] = useState('Desk A');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

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
    } catch (_) {
      // Not JSON, keep raw value
    }

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
        response = await consumeQrValidationToken({
          validation_token: rawValue,
          validator_id: validatorId || 'PC-VALIDATOR-01',
          location: location || 'Desk A',
        });
      } else {
        if (!ticketUuid) {
          setError('Code invalide. Aucun ticket UUID detecte.');
          return;
        }
        response = await validateTicket(ticketUuid, {
          validation_type: 'qr',
          validator_id: validatorId || 'PC-VALIDATOR-01',
          location: location || 'Desk A',
        });
      }

      setResult({
        ok: true,
        ticketUuid: ticketUuid || '(token)',
        message: response?.message || 'Validation reussie.',
        payload: response || null,
      });
    } catch (err) {
      setResult({
        ok: false,
        ticketUuid: ticketUuid || '(token)',
        message: err?.response?.data?.message || 'Validation echouee.',
        payload: err?.response?.data?.data || null,
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
    } catch (_) {
      // Ignore intermittent detector errors and continue scanning
    }

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
      setError(err?.message || 'Impossible de demarrer la camera. Verifiez les permissions.');
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
        
        // jsQR struggles with extremely large images from phone cameras. 
        // Downscaling to a max dimension of 800px drastically improves detection rate.
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
        
        // Draw the image onto the scaled canvas
        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);

        // Run jsQR with attemptBoth which is much better for camera shots with bad contrast
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "attemptBoth"
        });

        if (code && code.data) {
          const raw = code.data;
          setScanValue(raw);
          await processValidation(raw);
        } else {
          setError('Aucun code QR detecte dans cette image. Assurez-vous que le code est lisible.');
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        setError("Format d'image non valide ou image corrompue.");
      };

      img.src = objectUrl;
    } catch (err) {
      setError(err?.message || "Impossible d'analyser cette image.");
    } finally {
      event.target.value = '';
    }
  };

  return (
    <div className="app-shell">
      <div className="app-frame">
        <div className="app-card bg-gradient-to-br from-[#400106]/95 to-[#260101]/95">
          <Header
            title="PC Validator"
            showBackButton={true}
            onBack={() => navigate(-1)}
          />

          <div className="app-content px-6 pb-8 space-y-4">
            <div className="bg-black/20 border border-white/10 rounded-2xl p-4 space-y-3">
              <label className="text-white/70 text-xs uppercase">Validator ID</label>
              <input
                type="text"
                value={validatorId}
                onChange={(e) => setValidatorId(e.target.value)}
                className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-white text-sm"
              />

              <label className="text-white/70 text-xs uppercase">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-white text-sm"
              />
            </div>

            <div className="bg-black/20 border border-white/10 rounded-2xl p-4">
              <video ref={videoRef} className="w-full rounded-xl bg-black/60 min-h-[220px]" muted playsInline />
              <div className="grid grid-cols-2 gap-3 mt-3">
                <button
                  type="button"
                  onClick={isScanning ? stopCamera : startCamera}
                  className="rounded-xl border border-yellow-500/40 bg-yellow-500/20 text-yellow-300 py-2 text-sm font-semibold"
                >
                  {isScanning ? 'Stop Camera' : 'Start Camera Scan'}
                </button>
                <label className="rounded-xl border border-white/20 bg-white/10 text-white py-2 text-sm font-semibold text-center cursor-pointer">
                  Upload QR Image
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            </div>

            <div className="bg-black/20 border border-white/10 rounded-2xl p-4 space-y-3">
              <label className="text-white/70 text-xs uppercase">Manual code / token</label>
              <textarea
                value={scanValue}
                onChange={(e) => setScanValue(e.target.value)}
                rows={3}
                placeholder="Paste UUID or QR JSON payload"
                className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-white text-sm resize-none"
              />
              <button
                type="button"
                onClick={handleManualValidate}
                disabled={isSubmitting || !scanValue.trim()}
                className="w-full rounded-xl border border-yellow-500/40 bg-yellow-500/20 text-yellow-300 py-2 text-sm font-semibold disabled:opacity-40"
              >
                {isSubmitting ? 'Validating...' : 'Validate Code'}
              </button>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-300 text-sm">
                {error}
              </div>
            )}

            {result && (
              <div className={`rounded-xl p-4 text-sm border ${result.ok ? 'border-green-500/30 bg-green-500/10 text-green-200' : 'border-red-500/30 bg-red-500/10 text-red-200'}`}>
                <p className="font-semibold mb-1">{result.ok ? 'Validation Success' : 'Validation Failed'}</p>
                <p className="mb-1">Ticket: {result.ticketUuid}</p>
                <p className="mb-1">Message: {result.message}</p>
                {result.payload?.status_after && <p>Status after: {result.payload.status_after}</p>}
                {typeof result.payload?.remaining_uses !== 'undefined' && <p>Remaining uses: {result.payload.remaining_uses}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


