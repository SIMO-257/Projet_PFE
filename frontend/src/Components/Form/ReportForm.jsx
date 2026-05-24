import React from 'react';

const ReportForm = ({ 
  problemType,
  onProblemTypeChange,
  problemDescription,
  onProblemDescriptionChange,
  onAttachScreenshot,
  onSubmit,
  className = "",
  t
}) => {
  const problemTypes = [
    t('report_validation_issue'),
    t('report_payment_issue'),
    t('report_tech_bug'),
    t('report_account_issue'),
    t('report_other')
  ];

  return (
    <div className={`bg-black/30 rounded-2xl p-4 border border-white/10 space-y-4 ${className}`}>
      {/* Problem Type Dropdown */}
      <div>
        <label className="text-white/60 text-xs uppercase tracking-wide mb-2 block">
          {t('report_problem_type')}
        </label>
        <div className="relative">
          <select
            value={problemType}
            onChange={(e) => onProblemTypeChange(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-yellow-500/50 transition-all appearance-none cursor-pointer"
          >
            {problemTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="text-white/60 text-xs uppercase tracking-wide mb-2 block">
          {t('report_description')}
        </label>
        <textarea
          value={problemDescription}
          onChange={(e) => onProblemDescriptionChange(e.target.value)}
          placeholder={t('report_description_placeholder')}
          rows="4"
          maxLength={500}
          className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-yellow-500/50 transition-all resize-none placeholder-white/40"
        />
        <div className="text-white/40 text-xs mt-1">{problemDescription.length}/500</div>
      </div>

      {/* Attach Screenshot */}
      <button
        onClick={onAttachScreenshot}
        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 flex items-center justify-center space-x-2 hover:bg-white/10 transition-all"
      >
        <svg className="w-5 h-5 text-white/60" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
        </svg>
        <span className="text-white/60 text-sm">{t('report_attach_screenshot')}</span>
      </button>

      {/* Submit Button */}
      <button
        onClick={onSubmit}
        className="w-full bg-gradient-to-r from-[#D9B991] to-[#C9A961] text-[#400106] font-semibold py-3 rounded-xl hover:from-[#E5C5A1] hover:to-[#D9B971] transition-all"
      >
        {t('report_submit')}
      </button>
    </div>
  );
};

export default ReportForm;