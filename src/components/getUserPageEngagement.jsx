import axios from "axios";
import { format, addDays, subDays } from "date-fns";

export const getUserPageEngagement = async (
  page_id,
  base,
  pageAccessToken,
  callingObj
) => {
  let userPageEngagementRequest = async (startDate, endDate, repeat) => {
    console.log(callingObj.state);
    startDate += "T00:00:00";
    endDate += "T24:00:00";

    console.log("startDate: ", startDate);
    console.log("endDate: ", endDate);
    console.log("repeat: ", repeat);

    // Retrieve user engagement metrics
    let since = `since=${startDate}`;
    let until = `until=${endDate}`;
    let metric = `metric=page_engaged_users`;
    let period = `period=day`;
    let params = `${since}&${until}&${metric}&${period}`;
    let url = `${base}/${page_id}/insights/?${params}&access_token=${pageAccessToken}`;

    console.log("|-> retrieving user page engagement metrics: ");
    console.log(url);

    await axios
      .get(url)
      .then(async (response) => {
        console.log(response);
        // handle success
        let data = await response.data.data[0].values;
        if (repeat) {
          console.log(data);

          let { engagedUsers } = callingObj.state;
          console.log(engagedUsers);
          engagedUsers.push(data);
          console.log(engagedUsers);

          await callingObj.setState({ engagedUsers: engagedUsers });
          console.log(callingObj.state);
        } else {
          console.log(data);

          await callingObj.setState({
            engagedUsers: data,
          });

          console.log(callingObj.state);
        }
      })
      .catch((error) => {
        // handle error
        console.log(error);
      });
  };

  let concatArray = false;
  if (callingObj.state.requestsNeeded > 1) {
    // Multiple requests
    concatArray = true;
    let { requestsNeeded } = callingObj.state;
    let count = 1;
    while (requestsNeeded > 0) {
      console.log("Executing while loop: ", count);
      let { startDate } = callingObj.state.dateRange;
      startDate = addDays(startDate, 90 * (count - 1));
      let endDate = addDays(startDate, 90);

      if (requestsNeeded == 1) {
        endDate = callingObj.state.dateRange.endDate;
        endDate = addDays(endDate, 1);
      }

      console.log(endDate);

      // Convert date format to mm/dd/yyyy
      startDate = format(new Date(startDate), "MM/dd/yyyy");
      endDate = format(new Date(endDate), "MM/dd/yyyy");

      console.log(endDate);

      requestsNeeded -= 1;
      await userPageEngagementRequest(startDate, endDate, true, callingObj);
      count += 1;
    }
  } else {
    // Single Request
    let { startDate, endDate } = callingObj.state.dateRange;
    endDate = addDays(endDate, 1);
    startDate = format(new Date(startDate), "MM/dd/yyyy");
    endDate = format(new Date(endDate), "MM/dd/yyyy");
    await userPageEngagementRequest(startDate, endDate, false, callingObj);
    console.log(callingObj.state);
  }
  console.log("out of while loop");

  console.log(callingObj.state);
  if (concatArray) {
    callingObj.reduceArray("engagedUsers");
    // Get total Engagements
    let totalEngagedUsers = 0;
    callingObj.state.engagedUsers.map((arr) => {
      arr.map((value) => {
        totalEngagedUsers += value.value;
      });
    });
    callingObj.setState({
      totalEngagedUsers: totalEngagedUsers,
    });
  } else {
    // Get total Engagements
    let totalEngagedUsers = 0;
    callingObj.state.engagedUsers.map((value) => {
      // console.log(value);
      totalEngagedUsers += value.value;
    });
    callingObj.setState({
      totalEngagedUsers: totalEngagedUsers,
    });
  }

  // End of page engagement code
};
