import "../styles/common.css";
interface HeaderPropsType {
  title: string;
  className?: string;
}

const Header = ({ title, className="" }: HeaderPropsType) => {
  return (
    <>
      <div>
        <h1 className={`titleHeader ${className} !text-nowrap`}>{title}</h1>
      </div>
    </>
  );
};

export default Header;
