import { Models } from "@rematch/core";
import { userAuth } from "./UserAuthModel";
import { common } from "./CommonModel";
import { announcement } from "./Announcement";
import { facilities } from "./FacilitieModel";
import { MCST } from "./MCSTModel";
import { resident } from "./residentModel";
import { peopleCounting } from "./PeopleCounting";
import { powerManagement } from "./PowerManagement";
import { chat } from "./ChatModel";
import { document } from "./DocumentFormsModel";
import { deliveryLogs } from "./DeliveryLogsModel";
import { emergency } from "./EmergencyModel";
import { serviceCenter } from "./ServiceCenterModel";
import { eventLog } from "./eventLogs";
import { maintenanceGuide } from "./MaintenanceGuide";
import { visitor } from "./visitorModel";
import { juristic } from "./JuristicModel";
export interface RootModel extends Models<RootModel> {
  userAuth: typeof userAuth;
  common: typeof common;
  announcement: typeof announcement;
  facilities: typeof facilities;
  MCST: typeof MCST;
  resident: typeof resident;
  peopleCounting: typeof peopleCounting;
  powerManagement: typeof powerManagement;
  chat: typeof chat;
  document: typeof document;
  deliveryLogs: typeof deliveryLogs;
  emergency: typeof emergency;
  serviceCenter: typeof serviceCenter;
  eventLog: typeof eventLog;
  maintenanceGuide: typeof maintenanceGuide;
  visitor: typeof visitor;
  juristic: typeof juristic;
}
export const models: RootModel = {
  userAuth,
  common,
  announcement,
  facilities,
  MCST,
  resident,
  peopleCounting,
  powerManagement,
  chat,
  document,
  deliveryLogs,
  emergency,
  serviceCenter,
  eventLog,
  maintenanceGuide,
  visitor,
  juristic,
};
