import { FC } from "react";
import ScheduledEmploymentList from "./MinimumWagesEmploymentList";

const NonScheduledEmploymentList: FC = () => (
  <ScheduledEmploymentList mode="non-scheduled" />
);

export default NonScheduledEmploymentList;
