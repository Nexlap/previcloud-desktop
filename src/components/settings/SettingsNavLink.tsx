import { Link } from "react-router";
import type { ReactNode } from "react";
import { ListBullets, Percent, CreditCard, ChatCircleText, CaretRight } from "@phosphor-icons/react";

type Props = {
  to: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
};

export default function SettingsNavLink({ to, title, subtitle, icon }: Props) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 rounded-2xl border border-edge-faint bg-surface p-4 shadow-sm shadow-brand-navy/[0.03] transition hover:border-brand-teal/25 hover:shadow-md hover:shadow-brand-teal/5"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-bg text-brand-navy/70 transition group-hover:bg-brand-teal/10 group-hover:text-brand-teal">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-brand-navy">{title}</p>
        <p className="text-sm text-brand-navy/60">{subtitle}</p>
      </div>
      <span className="shrink-0 text-brand-navy/30 transition group-hover:translate-x-0.5 group-hover:text-brand-teal">
        <CaretRight size={16} weight="bold" />
      </span>
    </Link>
  );
}

export const SETTINGS_NAV_ICONS = {
  servizi: <ListBullets size={20} weight="regular" />,
  fiscale: <Percent size={20} weight="regular" />,
  pagamenti: <CreditCard size={20} weight="regular" />,
  messaggi: <ChatCircleText size={20} weight="regular" />,
};
