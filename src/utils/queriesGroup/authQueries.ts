import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { encryptStorage } from "../../utils/encryptStorage";

// Services Chat
const getProjectID = async () => {
  let url = `/my-project`;
  const res = await axios.get(url);
  // console.log("RES : ", res);
  encryptStorage.setItem("projectId", res.data.data.myProjectId);

  return res.data.data;
};

//  Queries Service Chat
export const getProjectIDQuery = () => {
  return useQuery({
    queryKey: ["projectId"],
    queryFn: getProjectID,
  });
};
