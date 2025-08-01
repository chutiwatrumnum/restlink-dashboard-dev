export const normalInputRule = [
  {
    pattern: new RegExp(/^[a-zA-Z0-9 ]*$/),
    message: "Can't use special character",
  },
  { required: true, message: "This field is required !" },
];

export const requiredMailRule = [
  { type: "email", message: "Email is not a valid email !" },
  { required: true, message: "This field is required !" },
];

export const requiredRule = [
  { required: true, message: "This field is required !" },
];

export const noTextInputRule = [
  { pattern: new RegExp(/^[0-9]*$/), message: "Contact no. is not a valid !" },
  { required: true, message: "This field is required !" },
];
