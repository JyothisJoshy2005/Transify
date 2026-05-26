export default function LoadingSpinner({ size = 'md', label = 'Processing…' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`${sizes[size]} relative`}>
        <div className={`${sizes[size]} rounded-full border-4 border-slate-200 dark:border-slate-700`} />
        <div className={`${sizes[size]} rounded-full border-4 border-primary-500 border-t-transparent animate-spin absolute inset-0`} />
      </div>
      {label && (
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium animate-pulse">
          {label}
        </p>
      )}
    </div>
  )
}
