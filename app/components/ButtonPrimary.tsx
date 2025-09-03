type ButtonPrimaryProps = {
  href?: string;
  text?: string;
  className?: string;
};

export default function ButtonPrimary({
  href = "#",
  text = "READ ON",
  className = "",
}: ButtonPrimaryProps) {
  const baseClasses =
    "w-40 my-12 p-2 py-3 bg-btn-primary text-white font-bold rounded-full cursor-pointer shadow-xl hover:bg-btn-hover ease-out transition-colors duration-200 inline-block text-center";

  return (
    <a href={href} className={`${baseClasses} ${className}`}>
      {text}
    </a>
  );
}
