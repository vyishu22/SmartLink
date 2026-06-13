const LoadingScreen = () => (
  <div className="flex h-screen items-center justify-center bg-surface-950">
    <div className="flex flex-col items-center gap-4">
      <div className="h-8 w-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      <p className="text-sm text-zinc-500">Loading SmartLink…</p>
    </div>
  </div>
);

export default LoadingScreen;
