import React, { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info, Terminal } from "lucide-react";

export function DocHeading({ id, level = 2, children }: { id?: string; level?: 1 | 2 | 3 | 4; children: ReactNode }) {
  const classes = {
    1: "text-4xl font-extrabold tracking-tight text-white mb-8 mt-4 scroll-m-20",
    2: "text-2xl font-semibold tracking-tight text-white mt-12 mb-6 scroll-m-20 border-b border-white/10 pb-4",
    3: "text-xl font-medium tracking-tight text-gray-100 mt-8 mb-4 scroll-m-20",
    4: "text-lg font-medium text-gray-200 mt-6 mb-4 scroll-m-20",
  };

  if (level === 1) return <h1 id={id} className={classes[1]}>{children}</h1>;
  if (level === 3) return <h3 id={id} className={classes[3]}>{children}</h3>;
  if (level === 4) return <h4 id={id} className={classes[4]}>{children}</h4>;
  return <h2 id={id} className={classes[2]}>{children}</h2>;
}

export function DocText({ children }: { children: ReactNode }) {
  return <p className="leading-7 text-gray-300 mb-6">{children}</p>;
}

export function DocList({ children, ordered = false }: { children: ReactNode; ordered?: boolean }) {
  const Component = ordered ? "ol" : "ul";
  return (
    <Component className={`my-6 ml-6 space-y-2 text-gray-300 ${ordered ? "list-decimal" : "list-disc relative marker:text-indigo-500"}`}>
      {children}
    </Component>
  );
}

export function DocCodeWrap({ children }: { children: ReactNode }) {
  return (
    <code className="relative rounded bg-white/10 px-[0.3rem] py-[0.2rem] font-mono text-sm text-indigo-300">
      {children}
    </code>
  );
}

export function DocCodeBlock({ code, language = "bash" }: { code: string; language?: string }) {
  return (
    <div className="relative my-6 rounded-lg bg-[#0d1117] border border-white/10 overflow-hidden group">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/5">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-400 font-mono">{language}</span>
        </div>
        <button className="text-xs text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100">Copy</button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm text-gray-300 font-mono leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

export function DocCallout({ type = "info", title, children }: { type?: "info" | "warning" | "success"; title: string; children: ReactNode }) {
  const styles = {
    info: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    warning: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  }[type];

  const Icon = {
    info: Info,
    warning: AlertCircle,
    success: CheckCircle2,
  }[type];

  return (
    <div className={`my-8 p-4 rounded-xl border flex gap-4 ${styles}`}>
      <Icon className="w-5 h-5 mt-0.5 shrink-0" />
      <div>
        <h5 className="font-semibold mb-1 text-white">{title}</h5>
        <div className="text-sm opacity-90 leading-relaxed text-gray-200">
          {children}
        </div>
      </div>
    </div>
  );
}

export function DocCardGrid({ children }: { children: ReactNode }) {
  return <div className="grid sm:grid-cols-2 gap-4 my-8">{children}</div>;
}

export function DocCard({ title, description, href, icon: Icon }: { title: string; description: string; href?: string; icon: any }) {
  return (
    <a href={href || "#"} className="group relative rounded-xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 hover:border-indigo-500/50 transition-all block">
      <div className="mb-4 bg-indigo-500/10 w-10 h-10 rounded-lg flex items-center justify-center text-indigo-400 group-hover:text-indigo-300 group-hover:bg-indigo-500/20 transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-semibold text-white mb-2 group-hover:text-indigo-300 transition-colors">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
    </a>
  );
}
