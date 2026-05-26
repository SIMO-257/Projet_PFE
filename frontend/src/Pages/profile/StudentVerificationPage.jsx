import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../Components/Layout/Header';
import BottomNavigation from '../../Components/Layout/BottomNavigation';
import { useTranslation } from '../../hooks/useTranslation';
import { fetchStudentStatus, submitStudentVerification } from '../../services/clientService';
import styles from '../../Styles/ProfileScreen.module.css';

export default function StudentVerificationPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [studentStatus, setStudentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [cinDoc, setCinDoc] = useState(null);
  const [schoolDoc, setSchoolDoc] = useState(null);
  const [fileError, setFileError] = useState(null);

  const ALLOWED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  useEffect(() => {
    fetchStudentStatus()
      .then((res) => {
        setStudentStatus(res ?? null);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const validateFile = (file) => {
    if (!file) return t('student_file_required');
    if (!ALLOWED_TYPES.includes(file.type)) return t('student_invalid_file');
    if (file.size > MAX_SIZE) return 'File too large. Maximum size is 10MB.';
    return null;
  };

  const handleCinChange = (e) => {
    const file = e.target.files?.[0] || null;
    const err = validateFile(file);
    if (err) {
      setFileError(err);
      setCinDoc(null);
      return;
    }
    setFileError(null);
    setCinDoc(file);
  };

  const handleSchoolChange = (e) => {
    const file = e.target.files?.[0] || null;
    const err = validateFile(file);
    if (err) {
      setFileError(err);
      setSchoolDoc(null);
      return;
    }
    setFileError(null);
    setSchoolDoc(file);
  };

  const handleSubmit = async () => {
    if (!cinDoc || !schoolDoc) {
      setFileError(t('student_file_required'));
      return;
    }

    setSubmitting(true);
    setError(null);
    setFileError(null);

    try {
      const formData = new FormData();
      formData.append('cin_doc', cinDoc);
      formData.append('school_doc', schoolDoc);

      await submitStudentVerification(formData);
      setSuccess(true);
      setCinDoc(null);
      setSchoolDoc(null);
    } catch (err) {
      const msg = err?.response?.data?.message || t('student_error');
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="app-shell">
        <div className="app-frame">
          <div className={`${styles.profileCard} app-card`}>
            <Header title={t('student_verification_title')} />
            <div className="app-content flex items-center justify-center min-h-[60vh]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
            <BottomNavigation />
          </div>
        </div>
      </div>
    );
  }

  const verification = studentStatus?.verification;

  return (
    <div className="app-shell">
      <div className="app-frame">
        <div className={`${styles.profileCard} app-card`}>
          <Header title={t('student_verification_title')} />

          <div className="app-content p-4 space-y-4 overflow-y-auto">
            {/* Already verified */}
            {studentStatus?.is_student && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="text-white text-xl font-bold mb-2">{t('student_approved')}</h3>
                <p className="text-white/60 text-sm">{t('student_not_eligible')}</p>
              </div>
            )}

            {/* Pending verification */}
            {verification?.status === 'pending' && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="text-white text-xl font-bold mb-2">{t('student_pending')}</h3>
                <p className="text-white/60 text-sm">
                  {t('student_already_submitted')}
                </p>
              </div>
            )}

            {/* Rejected - can resubmit */}
            {verification?.status === 'rejected' && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="text-white text-lg font-bold mb-1">{t('student_rejected')}</h3>
                {verification.rejected_reason && (
                  <p className="text-white/60 text-sm mb-2">{verification.rejected_reason}</p>
                )}
                <p className="text-white/40 text-xs">{t('student_verification_desc')}</p>
              </div>
            )}

            {/* Success message after submission */}
            {success && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="text-white text-xl font-bold mb-2">{t('student_success')}</h3>
                <button
                  onClick={() => navigate('/profile')}
                  className="mt-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-[#400106] font-semibold px-6 py-3 rounded-2xl hover:from-yellow-400 hover:to-yellow-500 transition-all"
                >
                  {t('back_to_home')}
                </button>
              </div>
            )}

            {/* Show form only if not already verified + not pending */}
            {!studentStatus?.is_student && verification?.status !== 'pending' && !success && (
              <>
                {/* Instructions */}
                <div className="bg-gradient-to-br from-[#5C2A36] to-[#3D1A24] rounded-2xl p-5 border border-white/10">
                  <h3 className="text-white font-semibold text-lg mb-3">{t('student_verification_title')}</h3>
                  <p className="text-white/70 text-sm mb-4">{t('student_verification_instruction')}</p>

                  <div className="space-y-4">
                    {/* CIN Document Upload */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <label className="block text-white font-medium text-sm mb-2">
                        {t('student_cin_doc')}
                      </label>
                      <p className="text-white/40 text-xs mb-3">{t('student_cin_hint')}</p>
                      <div className="relative">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleCinChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3 border border-dashed border-white/20 hover:border-yellow-500/50 transition-all">
                          <div className="flex items-center space-x-3">
                            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"/>
                            </svg>
                            <span className="text-white/60 text-sm">
                              {cinDoc ? cinDoc.name : t('student_upload_cin')}
                            </span>
                          </div>
                          {cinDoc && (
                            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* School Document Upload */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <label className="block text-white font-medium text-sm mb-2">
                        {t('student_school_doc')}
                      </label>
                      <p className="text-white/40 text-xs mb-3">{t('student_school_hint')}</p>
                      <div className="relative">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleSchoolChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3 border border-dashed border-white/20 hover:border-yellow-500/50 transition-all">
                          <div className="flex items-center space-x-3">
                            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                            </svg>
                            <span className="text-white/60 text-sm">
                              {schoolDoc ? schoolDoc.name : t('student_upload_school')}
                            </span>
                          </div>
                          {schoolDoc && (
                            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error message */}
                {(fileError || error) && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                    <p className="text-red-400 text-sm">{fileError || error}</p>
                  </div>
                )}

                {/* Submit button */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !cinDoc || !schoolDoc}
                  className={`w-full py-4 rounded-2xl font-semibold text-sm transition-all duration-300 ${
                    submitting || !cinDoc || !schoolDoc
                      ? 'bg-white/10 text-white/30 cursor-not-allowed'
                      : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-[#400106] hover:from-yellow-400 hover:to-yellow-500 shadow-lg'
                  }`}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>{t('student_submitting')}</span>
                    </span>
                  ) : (
                    t('student_submit')
                  )}
                </button>
              </>
            )}
          </div>

          <BottomNavigation />
        </div>
      </div>
    </div>
  );
}
