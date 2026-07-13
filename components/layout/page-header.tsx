export function PageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <header>
      <p className="text-sm font-medium text-gold">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-normal text-text sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{description}</p>
    </header>
  );
}
