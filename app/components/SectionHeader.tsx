type SectionHeaderProps = {
  title: string;
  headerStyle?: string;
};

export default function SectionHeader({
  title,
}: SectionHeaderProps) {
  return (
    <div>
      <h1
        className={`text-sm text-text-primary font-raleway font-extrabold tracking-wider text-center`}
      >
        {title}
      </h1>
      <hr className="clear-both mx-auto my-5 h-0 w-[90px] border-0 border-t-[3px] border-solid border-[#8b0000] text-center" />
    </div>
  );
}
