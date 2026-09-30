/** Portal UserProfileChip without the photo upload: name, role and initials. */
export function ChipDeUsuario({ nombre, rol }: { nombre: string; rol: string }) {
  const [primero = '', segundo = ''] = nombre.trim().split(/\s+/);
  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-[15px] font-extrabold leading-none">{nombre}</p>
        <p className="mt-1 text-xs font-black uppercase tracking-[0.08em] text-[var(--accent)]">{rol}</p>
      </div>
      <span className="flex size-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--n-200)] text-sm font-extrabold text-[var(--n-700)] shadow-sm ring-2 ring-white sm:size-14">
        {`${primero.charAt(0)}${segundo.charAt(0)}`.toUpperCase() || '·'}
      </span>
    </div>
  );
}
