import { Geometry } from "./geometry";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto grid min-h-[calc(100dvh-4rem)] max-w-6xl items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-2">
      <div className="relative hidden aspect-square max-w-lg items-center justify-center lg:flex">
        <Geometry motif="flower" className="animate-slow-spin absolute inset-0 text-gold/25" strokeWidth={0.7} />
        <Geometry motif="seed" className="animate-breathe relative w-1/2 text-gold" strokeWidth={1} />
      </div>
      <div className="mx-auto w-full max-w-md">
        <h1 className="font-display text-4xl font-semibold text-ink sm:text-5xl">{title}</h1>
        <p className="mt-3 text-muted">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
