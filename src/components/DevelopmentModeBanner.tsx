const DevelopmentModeBanner = () => {
  const isProduction = import.meta.env.VITE_PRODUCTION === 'true';

  if (isProduction) {
    return null;
  }

  return (
    <div className="w-full bg-yellow-50 border-b-2 border-yellow-300 px-4 py-3">
      <div className="max-w-7xl mx-auto">
        <p className="text-yellow-800 font-semibold text-center">
          🔧 Development Mode
        </p>
      </div>
    </div>
  );
};

export default DevelopmentModeBanner;
