import React from 'react';

const StatCard = ({ value, description, icon }) => {
  return (
    <div className="bg-gray-100 rounded-xl border border-gray-100 relative overflow-hidden group">
      <div className="p-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#6936F5]/10 text-[#6936F5] mb-6 relative z-10">
          {icon}
        </div>
        <div className="flex items-baseline gap-1">
          <div className="text-5xl font-bold text-[#6936F5] font-inter relative z-10">{value}</div>
        </div>
        <div className="text-convrt-dark-blue/80 mt-2 font-inter text-xl font-semibold relative z-10">
          {description}
        </div>
        <div className="text-convrt-dark-blue/60 text-sm mt-2 relative z-10 leading-relaxed">
          Transform survey responses into powerful insights with AI-driven analysis and visualization
        </div>
      </div>
    </div>
  );
};

export default StatCard; 