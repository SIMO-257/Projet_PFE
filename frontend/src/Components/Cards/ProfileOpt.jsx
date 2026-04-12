const ProfileOpt = ({ label, icon, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white/5 rounded-2xl p-4 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 flex items-center justify-center">
            {icon}
          </div>
          <span className="text-white font-medium text-sm">{label}</span>
        </div>
        <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
};

export default ProfileOpt;
