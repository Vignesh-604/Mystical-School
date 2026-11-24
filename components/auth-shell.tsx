import Image from "next/image";
import { LogoMark } from "./logo";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto grid min-h-[calc(100dvh-4.5rem)] max-w-[96rem] gap-4 p-2.5 sm:p-4 lg:grid-cols-[1.05fr_1fr]">
      <div className="relative isolate hidden overflow-hidden rounded-[2rem] bg-night lg:block">
        <Image src="/edition/hero.webp" alt="" fill priority sizes="50vw" className="-z-10 object-cover" />
        <div aria-hidden className="photo-veil absolute inset-0 -z-10" />
        <div className="flex h-full flex-col justify-between p-12 text-[#fbf6ea]">
          <LogoMark className="size-12" />
          <p className="font-display max-w-md text-[2.6rem] leading-[1.08]">
            &ldquo;The purpose of a mystical school is to <em className="text-[#e8c88a]">awaken the wisdom</em> within.&rdquo;
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center px-3 py-12 sm:px-10">
        <div className="w-full max-w-md animate-fade-up">
          <h1 className="font-display text-5xl leading-none text-ink sm:text-6xl">{title}</h1>
          <p className="mt-4 text-[1.05rem] leading-relaxed text-muted">{subtitle}</p>
          <div className="mt-10">{children}</div>
        </div>
      </div>
    </div>
  );
}
