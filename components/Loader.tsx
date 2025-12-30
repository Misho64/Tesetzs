import React from 'react';

// FIX: Added children prop to allow custom loading messages. This resolves type errors in App.tsx.
const Loader: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    return (
        <div className="absolute inset-0 bg-[var(--panel-bg)] backdrop-blur-lg flex flex-col items-center justify-center z-10 rounded-xl">
            <div className="w-16 h-16 border-4 border-t-cyan-500 border-white/30 rounded-full animate-spin"></div>
            {children ? (
                children
            ) : (
                <>
                    <p className="mt-4 text-lg font-semibold text-cyan-300">Generating your masterpiece...</p>
                    <p className="text-sm text-gray-200">The AI is warming up its pixels.</p>
                </>
            )}
        </div>
    );
};

export default Loader;
