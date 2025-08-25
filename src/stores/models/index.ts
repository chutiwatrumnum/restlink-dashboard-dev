// File: src/stores/models/index.ts (Updated with VMSVisitor model)

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
import { setupProject } from "./SetupProjectModel";
import { sosWarning } from "./SosWarning";
import { invitation } from "./InvitationModel";
import { house } from "./HouseModel";
import { area } from "./AreaModel";
import { vehicle } from "./VehicleModel";
import { logAccess } from "./LogAccessModel";
import { logPassage } from "./LogPassageModel";
import { vmsVisitor } from "./VMSVisitorModel"; // Add VMS Visitor

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
  setupProject: typeof setupProject;
  sosWarning: typeof sosWarning;
  invitation: typeof invitation;
  house: typeof house;
  area: typeof area;
  vehicle: typeof vehicle;
  logAccess: typeof logAccess;
  logPassage: typeof logPassage;
  vmsVisitor: typeof vmsVisitor;
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
  setupProject,
  sosWarning,
  invitation,
  house,
  area,
  vehicle,
  logAccess,
  logPassage,
  vmsVisitor,
};