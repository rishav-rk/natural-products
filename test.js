import moment from "moment";
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

console.log(data)
console.log(moment().startOf('year'))
console.log(moment())