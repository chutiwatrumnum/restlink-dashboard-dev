import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Functions section
const getUnitList = async () => {
  let url = `/document-form/unit-filter-list`;
  const res = await axios.get(url);
  //   console.log("RES : ", res);

  return res.data.result;
};

// Queries section
export const getUnitListQuery = () => {
  return useQuery({
    queryKey: ["unitList"],
    queryFn: getUnitList,
  });
};
