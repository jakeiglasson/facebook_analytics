// 966307400196373/insights/?metric=page_impressions

import axios from "axios";
import { format, addDays, subDays } from "date-fns";

export const getPageImpressions = async (
  page_id,
  base,
  pageAccessToken,
  callingObj
) => {
  let pageImpressionsRequest = async (startDate, endDate, repeat) => {
    startDate += "T00:00:00";
    endDate += "T24:00:00";

    console.log("startDate: ", startDate);
    console.log("endDate: ", endDate);
    console.log("repeat: ", repeat);

    // Retrieve user engagement metrics
    let since = `since=${startDate}`;
    let until = `until=${endDate}`;
    let metric = `metric=page_impressions`;
    let period = `period=day`;
    let params = `${since}&${until}&${metric}&${period}`;
    let url = `${base}/${page_id}/insights/?${params}&access_token=${pageAccessToken}`;

    console.log("|-> retrieving page impressions metrics: ");
    console.log(url);

    try {
      let response = await axios.get(url);
      console.log(response);
      // handle success
      let data = response.data.data[0].values;
      if (repeat) {
        console.log(data);

        let { pageImpressions } = callingObj.state;
        console.log(pageImpressions);
        pageImpressions.push(data);
        console.log(pageImpressions);

        await callingObj.setState({ pageImpressions: pageImpressions });
        console.log(callingObj.state);
      } else {
        console.log(data);

        await callingObj.setState({
          pageImpressions: data,
        });

        console.log(callingObj.state);
      }
    } catch (error) {
      console.log(error);
    }
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
      await pageImpressionsRequest(startDate, endDate, true, callingObj);
      count += 1;
    }
  } else {
    // Single Request
    let { startDate, endDate } = callingObj.state.dateRange;
    endDate = addDays(endDate, 1);
    startDate = format(new Date(startDate), "MM/dd/yyyy");
    endDate = format(new Date(endDate), "MM/dd/yyyy");
    await pageImpressionsRequest(startDate, endDate, false, callingObj);
    console.log(callingObj.state);
  }
  console.log("out of while loop");

  console.log(callingObj.state);
  if (concatArray) {
    callingObj.reduceArray("pageImpressions");
    // Get total Engagements
    let totalPageImpressions = 0;
    callingObj.state.pageImpressions.map((arr) => {
      arr.map((value) => {
        totalPageImpressions += value.value;
      });
    });
    callingObj.setState({
      totalPageImpressions: totalPageImpressions,
    });
  } else {
    // Get total Engagements
    let totalPageImpressions = 0;
    callingObj.state.pageImpressions.map((value) => {
      // console.log(value);
      totalPageImpressions += value.value;
    });
    callingObj.setState({
      totalPageImpressions: totalPageImpressions,
    });
  }

  // End of page engagement code
  console.log(callingObj.state);
};
