interface WhiteLabelType {
  buttonShape: "default" | "round";
  primaryColor: string;
  secondaryColor: string;
  loginColor: string;
  logoutColor: string;
  whiteColor: string;
  whiteTransColor: string;
  blackColor: string;
  grayColor: string;
  cardBGColor: string;
  grayTransColor: string;

  // Semantic Colors
  dangerColor: string;
  warningColor: string;
  successColor: string;

  // Text colors
  mainTextColor: string;
  menuTextColor: string;
  menuTextActiveColor: string;
  subMenuTextColor: string;
  subMenuTextActiveColor: string;
  successTextColor: string;
  dangerTextColor: string;

  // BG colors
  mainBgColor: string;
  menuBgColor: string;
  menuBgActiveColor: string;
  subMenuBgColor: string;
  subMenuBgActiveColor: string;

  // Button colors
  mainBtnColor: string;
  cancelBtnColor: string;
  mainBtnTextColor: string;
  cancelBtnTextColor: string;

  // Table Colors
  tableHeadBgColor: string;
  tableHeadTextColor: string;
  subTableHeadBgColor: string;

  // Font weights
  normalWeight: number;
  boldWeight: number;
}

export const theme: object = {
  token: {
    colorPrimary: "#56a0d9",
    colorText: "#3F3F3F",
    colorInfo: "#3F3F3F",
    colorLink: "#3F3F3F",
    fontFamily: "Sarabun",
  },
};

export const whiteLabel: WhiteLabelType = {
  buttonShape: "default",
  primaryColor: "#36CCCC",
  secondaryColor: "#E7F5F5",
  loginColor: "#36CCCC",
  logoutColor: "#221F20",
  whiteColor: "#F4F4F4",
  whiteTransColor: "rgba(255, 255, 255, 0.8)",
  blackColor: "#403D38",
  grayColor: "#9F9C9B",
  cardBGColor: "#FEE7E2",
  grayTransColor: "#E0E1E3",

  // Semantic Colors
  dangerColor: "#AD1B20",
  warningColor: "#FAC63B",
  successColor: "#38BE43",

  // Text colors
  mainTextColor: "#3F3F3F",
  dangerTextColor: "#AD1B20",
  successTextColor: "#63A164",
  menuTextColor: "#FFFFFF",
  menuTextActiveColor: "#E98366",
  subMenuTextColor: "#7B7B7B",
  subMenuTextActiveColor: "#E98366",

  // BG colors
  mainBgColor: "#E98366",
  menuBgColor: "#F2BAAA",
  menuBgActiveColor: "#5F2424",
  subMenuBgColor: "#FFFFFF",
  subMenuBgActiveColor: "#E4CFCF",

  // Button colors
  mainBtnColor: "#E98366",
  cancelBtnColor: "#9F9C9B",
  mainBtnTextColor: "#FFFFFF",
  cancelBtnTextColor: "#3F3F3F",

  // Table colors
  tableHeadBgColor: "#F2BAAA",
  tableHeadTextColor: "#FFFFFF",
  subTableHeadBgColor: "#9F9C9B",

  // Font weights
  normalWeight: 400,
  boldWeight: 700,
};
