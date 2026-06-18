import moment from "moment";
import { Token } from "./src/models/index.js";
const data = [];
console.log(
  moment
    .monthsShort()
    .slice(0, moment().month() + 1)
    .forEach((month) =>
      data.push({
        label: month,
        orderCount: 23,
        amount: 160000,
      }),
    ),
);

console.log(moment().startOf("year"));
console.log(moment(moment().toISOString()).month());
console.log(moment().startOf("week").toISOString());
