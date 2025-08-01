import BG_IMAGE from "../../assets/images/BG.png";

import "../styles/common.css";

type WebBackgroundProps = {
  children: React.ReactNode; // 👈️ type children
};

const WebBackground = (props: WebBackgroundProps) => {
  return (
    <>
      <div className="webBackGround" />
      <div>{props.children}</div>
    </>
  );
};

export default WebBackground;
