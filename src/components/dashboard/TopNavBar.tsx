export function TopNavBar() {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-horizon-mist sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-[1280px] mx-auto px-10 h-20 flex justify-between items-center">
        {/* Brand Mark */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="font-headline text-3xl font-extrabold tracking-tight text-primary-dark leading-none">
              JIY
            </span>
            <span className="font-body text-[10px] uppercase tracking-[0.25em] text-ash-slate font-bold mt-1">
              MEMBER SPACE
            </span>
          </div>
        </div>

        {/* Balanced Centered Navigation */}
        <nav className="hidden md:flex gap-8 font-body text-xs uppercase tracking-[0.2em] font-semibold text-ash-slate">
          {["Events", "Scholar Q&A", "The Press", "Opportunity Board", "Merch Shop"].map((label) => (
            <a
              key={label}
              className="hover:text-damascus-gold transition-colors duration-200 relative py-1 group"
              href="#"
            >
              {label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-damascus-gold transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* Utility Elements */}
        <div className="flex items-center gap-6">
          <button
            className="relative text-primary-dark hover:text-damascus-gold transition-colors p-1"
            aria-label="Shopping Cart"
          >
            <span
              className="material-symbols-outlined text-[26px]"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
            >
              shopping_bag
            </span>
            <span className="absolute -top-1 -right-1 bg-deep-garnet text-[9px] text-white font-bold w-4 h-4 rounded-full flex items-center justify-center">
              2
            </span>
          </button>
          <div className="h-6 w-px bg-horizon-mist" />
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="text-right hidden sm:block">
              <p className="font-body text-xs font-bold text-primary-dark group-hover:text-damascus-gold transition-colors">
                Ali R.
              </p>
              <p className="font-body text-[9px] tracking-wider text-ash-slate uppercase font-medium">
                Member
              </p>
            </div>
            <span
              className="material-symbols-outlined text-3xl text-damascus-gold transition-transform group-hover:scale-105"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 300" }}
            >
              account_circle
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
