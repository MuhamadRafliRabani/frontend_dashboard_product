const TitleTable = ({ title, desc }: { title: string; desc: string }) => {
  return (
    <div className="">
      <h1 className="font-bold md:text-2xl text-xl">{title}</h1>
      <p className="font-medium text-black/70 md:text-base text-sm">{desc}</p>
    </div>
  );
};

export default TitleTable;
