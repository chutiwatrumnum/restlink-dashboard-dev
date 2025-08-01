import { conditionPage } from '../../../../stores/interface/Facilities'
export const paramsData = (condition: conditionPage) => {
    let datastr: string = `perPage=${condition.perPage}&curPage=${condition.curPage}&facilitiesId=${condition.facilitiesId}`;
  
    if (condition.startDate) {
      datastr = datastr + "&startDate=" + condition.startDate;
    }
    if (condition.endDate) {
      datastr = datastr + "&endDate=" + condition.endDate;
    }
    if (condition.search) {
        datastr+="&search="+condition.search
    }
    if (condition.sort&&condition.sortBy) {
      datastr+=`&sortBy=${condition.sortBy}&sort=${condition.sort.slice(0, -3)}`
    }
    if (datastr) {
      return {
        status: true,
        paramsstr: datastr,
      };
    } else {
      return {
        status: false,
        paramsstr: "",
      };
    }
  };