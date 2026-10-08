const VARIANTS = {
  primary: 'bg-accent text-surface hover:bg-accent/90',
  danger: 'bg-accent2 text-surface hover:bg-accent2/90',
  quiet: 'text-ink hover:bg-ink/10',
  quietAccent: 'text-accent hover:bg-accent/10',
  quietDanger: 'text-accent2 hover:bg-accent2/10',
};

// The one button style for the app. `variant` picks the colour; everything else is passed through.
export default function Button({ variant = 'quiet', className = '', type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={`rounded-sm px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
