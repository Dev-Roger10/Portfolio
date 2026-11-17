import { useState } from "react";
import { Check, Copy, Mail, MessageSquare, Phone, Send } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "../../components/ui/BrandIcons";
import { profile } from "../../data/profile";
import { Panel } from "../Panel";

const subjects = ["Oportunidad laboral", "Proyecto freelance", "Colaboración", "Solo saludar"];

const channel =
  "flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-zinc-300 transition-colors hover:border-white/25 hover:bg-white/[0.05] hover:text-white";

export function Contact() {
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState(subjects[0]);
  const [message, setMessage] = useState("");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // sin portapapeles: el enlace mailto sigue funcionando
    }
  };

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const body = `Hola Roger,\n\n${message}\n\n${name}`;
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(`${subject} (${name})`)}&body=${encodeURIComponent(body)}`;
  };

  const field =
    "w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-accent-500/60";

  return (
    <div className="grid grid-cols-1 gap-4 p-4 sm:p-6 lg:grid-cols-[360px_1fr]">
      <Panel title="canales.json" icon={Mail} bodyClassName="space-y-2.5 p-4">
        <h1 className="px-1 pb-2 font-display text-xl font-medium text-white">Escríbeme</h1>
        <p className="px-1 pb-3 text-sm leading-relaxed text-zinc-400">
          Estoy abierto a roles de desarrollo de software y de datos. También a proyectos freelance.
        </p>
        <div className={`${channel} justify-between`}>
          <a href={`mailto:${profile.email}`} className="flex min-w-0 items-center gap-3 hover:text-white">
            <Mail size={16} className="flex-none text-accent-400" />
            <span className="min-w-0 break-all">{profile.email}</span>
          </a>
          <button onClick={copy} aria-label="Copiar correo" className="flex-none text-zinc-500 hover:text-white">
            {copied ? <Check size={15} className="text-mint-400" /> : <Copy size={15} />}
          </button>
        </div>
        <a href={`tel:${profile.phone.replace(/\s+/g, "")}`} className={channel}><Phone size={16} className="text-accent-400" />{profile.phone}</a>
        <a href={profile.linkedin} target="_blank" rel="noreferrer" className={channel}><LinkedinIcon size={16} className="text-accent-400" />{profile.linkedinLabel}</a>
        <a href={profile.github} target="_blank" rel="noreferrer" className={channel}><GithubIcon size={16} className="text-accent-400" />{profile.githubLabel}</a>
      </Panel>

      <Panel title="nuevo_mensaje.msg" icon={MessageSquare} bodyClassName="p-5 sm:p-6">
        <form onSubmit={send} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block font-mono text-[11px] text-zinc-600">Tu nombre</span>
              <input required value={name} onChange={(e) => setName(e.target.value)} className={field} placeholder="Nombre y apellido" />
            </label>
            <label className="block">
              <span className="mb-1.5 block font-mono text-[11px] text-zinc-600">Motivo</span>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} className={field}>
                {subjects.map((s) => <option key={s} className="bg-ink-800">{s}</option>)}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] text-zinc-600">Mensaje</span>
            <textarea required value={message} onChange={(e) => setMessage(e.target.value)} rows={8} className={`${field} resize-y`} placeholder="Cuéntame qué necesitas" />
          </label>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-[11px] text-zinc-600">Se abrirá tu app de correo con el mensaje listo.</p>
            <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-accent-500 px-5 py-2.5 text-sm font-medium text-on-accent hover:bg-accent-400 transition-colors active:scale-[0.98]">
              <Send size={15} /> Enviar mensaje
            </button>
          </div>
        </form>
      </Panel>
    </div>
  );
}
