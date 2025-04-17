import "../styles/common.css";
interface HeaderPropsType {
  title: string;
}

const Header = ({ title }: HeaderPropsType) => {
  return (
    <>
      <div>
        <h1 className="titleHeader">{title}</h1>
      </div>
    </>
  );
};

export default Header;
