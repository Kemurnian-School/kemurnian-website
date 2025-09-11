type SectionHeaderProps = {
  title: string;
  h2ClassName?: string; // custom classes for <h2>
  hrClassName?: string; // custom classes for <hr>
};

export default function SectionHeader({
  title,
  h2ClassName = '', // defaults to nothing, user can override
  hrClassName = '', 
}: SectionHeaderProps) {
  return (
    <div>
      <h2 
        className={`text-md tracking-wider text-center font-extrabold font-raleway ${h2ClassName}`}
      >
        {title}
      </h2>
      <hr 
        className={`clear-both mx-auto my-5 h-0 w-[90px] border-0 border-t-[3px] border-solid border-[#8b0000] ${hrClassName}`} 
      />
    </div>
  );
}