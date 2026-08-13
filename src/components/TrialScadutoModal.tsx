type Props = { visibile: boolean }

export function TrialScadutoModal({ visibile }: Props) {
  if (!visibile) return null
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center
                    bg-brand-navy text-white p-8">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Periodo di prova terminato
      </h1>
      <p className="text-center text-gray-300 leading-relaxed max-w-md">
        Il tuo periodo di prova BETA è terminato.<br /><br />
        Contattaci per continuare a usare PreviCloud.
      </p>
      <a
        href="mailto:info@previcloud.it"
        style={{ marginTop: 16, color: '#0E9F8E', textDecoration: 'underline', fontSize: '15px' }}
      >
        Contatta il supporto
      </a>
    </div>
  )
}
