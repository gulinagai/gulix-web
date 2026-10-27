type WordmarkProps = {
  className?: string;
};

export function Wordmark({ className = "" }: WordmarkProps) {
  return (
    <span
      className={`inline-block text-[1.45rem] leading-none font-semibold tracking-[-0.04em] text-white ${className}`}
    >
      Guli<span className="text-brand">X</span>
    </span>
  );
}
