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
    "block mx-auto my-12 px-5 py-2 rounded-full w-40 uppercase tracking-[1.5px] border-3 border-[#8b0000] bg-[#8b0000] text-white shadow-md whitespace-nowrap font-raelway font-bold " +
    "hover:bg-transparent hover:text-[#8b0000] hover:shadow-md transition-colors duration-200 ease-out text-center";

  return (
    <a href={href} className={`${baseClasses} ${className}`}>
      {text}
    </a>
  );
}
