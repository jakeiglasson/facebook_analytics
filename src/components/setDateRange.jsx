import { format, addDays, subDays } from "date-fns";

export const setDateRange = async (startDate, endDate, callingObj) => {
  // console.log("setting date range");
  // console.log(startDate);
  // console.log(callingObj);

  if (callingObj) {
    await callingObj.setState({
      dateRange: {
        startDate: startDate,
        endDate: endDate,
        originalStartDate: startDate,
        originalEndDate: endDate,
      },
    });
    // console.log("date range set");
    // console.log(
    //   callingObj.state.originalStartDate,
    //   callingObj.state.originalEndDate
    // );

    // console.log(callingObj.state);

    // Convert to seconds to get amount of days
    let startDateSec = format(new Date(startDate), "t");
    let endDateSec = format(new Date(endDate), "t");

    // Add additional day to endDate
    endDate = addDays(endDate, 1);

    // Convert date format to mm/dd/yyyy
    startDate = format(new Date(startDate), "MM/dd/yyyy");
    endDate = format(new Date(endDate), "MM/dd/yyyy");

    // console.log("Range: " + startDate + " - " + endDate);

    // Get range amount in days
    let days = 1 + (endDateSec - startDateSec) / 86400;
    // console.log(days);

    // Workout the amount of requests to send
    if (days > 90) {
      await callingObj.setState({ requestsNeeded: Math.ceil(days / 90) });
    } else {
      await callingObj.setState({ requestsNeeded: 1 });
    }
    // console.log(callingObj.state);

    // console.log(callingObj.state);
  }
};
