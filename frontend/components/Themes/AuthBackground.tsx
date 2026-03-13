export default function AuthBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
      <div className="absolute top-[20%] right-[10%] w-32 h-32 border border-primary/20 rounded-full opacity-30" />
      <div className="absolute bottom-[20%] left-[15%] w-24 h-24 border-2 border-primary/10 rotate-45 opacity-20" />
      <div className="absolute top-[60%] right-[25%] w-16 h-16 bg-primary/5 rounded-lg rotate-12 opacity-40" />
    </div>
  );
}
