import type { ComponentType } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  House,
  Plus,
  FileText,
  Users,
  Package,
  Gear,
  User,
  Monitor,
  type IconProps,
} from "@phosphor-icons/react";
import {
  getSectionRoot,
  linkToSection,
  pathToSection,
} from "../lib/navMemory";
import { useNavigaNuovoPreventivo } from "./NuovoPreventivoNavProvider";

type NavItem = {
  to: string;
  label: string;
  Icon: ComponentType<IconProps>;
  emphasis?: boolean;
};

type NavGroup = {
  title: string;
  items: NavItem[];
  separated?: boolean;
};

const mainGroups: NavGroup[] = [
  {
    title: "Panoramica",
    items: [{ to: "/", label: "Home", Icon: House }],
  },
  {
    title: "Lavoro",
    items: [
      { to: "/nuovo", label: "Nuovo preventivo", Icon: Plus, emphasis: true },
      { to: "/storico", label: "Storico preventivi", Icon: FileText },
      { to: "/clienti", label: "Clienti", Icon: Users },
    ],
  },
  {
    title: "Digitale",
    items: [{ to: "/prodotti-digitali", label: "Prodotti digitali", Icon: Package }],
    separated: true,
  },
];

const bottomGroups: NavGroup[] = [
  {
    title: "Configurazione",
    items: [{ to: "/impostazioni", label: "Impostazioni", Icon: Gear }],
  },
  {
    title: "Account",
    items: [
      { to: "/profilo", label: "Profilo", Icon: User },
      { to: "/app", label: "App", Icon: Monitor },
    ],
  },
];

function NavLink({
  item,
  isActive,
  onNavigate,
}: {
  item: NavItem;
  isActive: boolean;
  onNavigate: (to: string) => void;
}) {
  const { to, label, Icon, emphasis } = item;

  if (emphasis) {
    return (
      <a
        href={to}
        onClick={(e) => {
          e.preventDefault();
          onNavigate(to);
        }}
        className={`mt-1 mb-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all active:scale-[0.98] ${
          isActive
            ? "bg-brand-teal text-white shadow-sm shadow-brand-teal/30"
            : "bg-brand-teal/90 text-white hover:bg-brand-teal"
        }`}
      >
        <span className="flex h-5 w-5 shrink-0 items-center justify-center">
          <Icon size={18} weight="bold" />
        </span>
        {label}
      </a>
    );
  }

  return (
    <a
      href={to}
      onClick={(e) => {
        e.preventDefault();
        onNavigate(to);
      }}
      className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "bg-white/12 text-white"
          : "text-white/65 hover:bg-white/8 hover:text-white"
      }`}
    >
      {isActive && (
        <span className="absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand-teal" />
      )}
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center ${
          isActive ? "text-brand-teal" : "text-white/50"
        }`}
      >
        <Icon size={18} weight={isActive ? "fill" : "regular"} />
      </span>
      {label}
    </a>
  );
}

function NavSection({ group, currentSection, onNavigate }: {
  group: NavGroup;
  currentSection: ReturnType<typeof pathToSection>;
  onNavigate: (to: string) => void;
}) {
  return (
    <div className={group.separated ? "space-y-1 border-t border-white/10 pt-4" : "space-y-1"}>
      <p className="px-3 pt-1 pb-1.5 text-[10px] font-semibold tracking-widest text-white/35 uppercase">
        {group.title}
      </p>
      {group.items.map((item) => {
        const section = linkToSection(item.to);
        const isActive = section !== null && currentSection === section;
        return (
          <NavLink key={item.to} item={item} isActive={isActive} onNavigate={onNavigate} />
        );
      })}
    </div>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const navigaNuovoPreventivo = useNavigaNuovoPreventivo();
  const currentSection = pathToSection(location.pathname);

  function handleNavigate(to: string) {
    const section = linkToSection(to);
    if (section === "nuovo") {
      navigaNuovoPreventivo();
      return;
    }
    if (!section) {
      navigate(to);
      return;
    }
    navigate(getSectionRoot(section));
  }

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-white/5 bg-brand-navy text-white">
      <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-teal text-sm font-bold text-white">
          P
        </span>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold tracking-tight">PreviCloud</p>
          <p className="text-xs text-white/45">Desktop</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4">
        {mainGroups.map((group) => (
          <NavSection
            key={group.title}
            group={group}
            currentSection={currentSection}
            onNavigate={handleNavigate}
          />
        ))}

        <div className="flex-1 min-h-4" />

        {bottomGroups.map((group) => (
          <NavSection
            key={group.title}
            group={group}
            currentSection={currentSection}
            onNavigate={handleNavigate}
          />
        ))}
      </nav>
    </aside>
  );
}

