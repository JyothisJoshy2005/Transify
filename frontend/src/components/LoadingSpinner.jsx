export default function LoadingSpinner({ size = 'md', label = 'Loading…' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }
  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`${sizes[size]} rounded-full border-2 border-t-transparent animate-spin`}
        style={{borderColor:'var(--teal)', borderTopColor:'transparent'}} />
      {label && <p style={{fontSize:'13px', color:'var(--text-light)'}}>{label}</p>}
    </div>
  )
}
