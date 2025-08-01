const validateMessages = {
  required: "Please input your ${label}",
};

const noSpacialInputRule = [
  {
    pattern: new RegExp(/^[a-zA-Z0-9 ]*$/),
    message: "Can't use special character",
  },
  { required: true },
];

const requiredRule = [{ required: true }];

const emailRule = [
  {
    pattern: new RegExp(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    ),
    message: "The input is not valid Email!",
  },
  {
    required: true,
    // message: "Please input your Email!",
  },
];

const resetPasswordRule = [
  { required: true },
  {
    pattern: new RegExp(
      "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@~`!@#$%^&*()_=+\\\\';:\"\\/?>.<,-])[a-zA-Z0-9@~`!@#$%^&*()_=+\\\\';:\"\\/?>.<,-]{8,}$"
    ),
    message: (
      <span>
        Password must have at least 8 characters, 1 lowercase, 1 upper case, 1
        number and 1 special character.
      </span>
    ),
  },
];

const telRule = [
  {
    pattern: new RegExp(/^[0-9]*$/),
    message: "Only numbers",
  },
  {
    required: true,
  },
];

export {
  validateMessages,
  noSpacialInputRule,
  requiredRule,
  emailRule,
  resetPasswordRule,
  telRule,
};
