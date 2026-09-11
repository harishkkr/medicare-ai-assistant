function Card({ title, subtitle, icon: Icon, action, className = '', children }) {
  return (
    <div
      className={`glass-card p-5 md:p-6 backdrop-blur-xl bg-white/70 border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_36px_rgb(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 ${className}`}
    >
      {(title || Icon || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20 shadow-sm">
                <Icon size={19} />
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-base font-semibold text-slate-800 tracking-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-slate-500 font-normal">{subtitle}</p>
              )}
            </div>
          </div>
          {action && <div className="flex items-center">{action}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  )
}

export default Card