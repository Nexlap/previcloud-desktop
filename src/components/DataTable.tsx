interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function DataTable({ children, className = "" }: Props) {
  return (
    <div className={`mt-6 overflow-x-auto rounded-2xl border border-edge-faint bg-surface shadow-sm shadow-brand-navy/[0.03] ${className}`}>
      {children}
    </div>
  );
}
