import { conditionPage } from '../../../../stores/interface/EventLog'
export const paramsdata = async (condition: conditionPage) => {
  
    let datastr: string = `perPage=${condition.perPage}&curPage=${condition.curPage}`;
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