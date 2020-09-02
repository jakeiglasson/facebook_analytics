import axios from "axios";
import { format, addDays, subDays } from "date-fns";

export const getNegativePageEngagements = async (
  page_id,
  base,
  pageAccessToken,
  callingObj
) => {
  // Get page engagement between range
  let getNegativePageEngagementsBetweenRange = async (
    startDate,
    endDate,
    repeat
  ) => {
    // let { startDate, endDate } = callingObj.formattedDates();
    startDate += "T00:00:00";
    endDate += "T24:00:00";

    let metric = `metric=page_negative_feedback_by_type`;
    let dateRange = `since=${startDate}&until=${endDate}`;
    let period = "period=day";

    let url = `${base}/${page_id}/insights/?${metric}&${dateRange}&${period}&access_token=${pageAccessToken}`;

    console.log(
      "|-> retrieving negative page engagement metrics with given range:"
    );
    console.log(url);

    let negativePageEngagementsBetweenRange = 0;

    await axios
      .get(url)
      .then(async (response) => {
        // handle success
        console.log(response);
        let data = await response.data.data[0].values;

        if (repeat) {
          console.log(data);

          let { negativePageEngagementsBetweenRange } = callingObj.state;
          console.log(negativePageEngagementsBetweenRange);
          negativePageEngagementsBetweenRange.push(data);
          console.log(negativePageEngagementsBetweenRange);

          await callingObj.setState({
            negativePageEngagementsBetweenRange: negativePageEngagementsBetweenRange,
          });
          console.log(callingObj.state);
        } else {
          console.log(data);

          await callingObj.setState({
            negativePageEngagementsBetweenRange: data,
          });

          console.log(callingObj.state);
        }
      })
      .catch((error) => {
        // handle error
        console.log(error);
      });
  };

  // Handle multiple requests
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
      await getNegativePageEngagementsBetweenRange(startDate, endDate, true);
      count += 1;
    }
  } else {
    // Single Request
    let { startDate, endDate } = callingObj.state.dateRange;
    endDate = addDays(endDate, 1);
    startDate = format(new Date(startDate), "MM/dd/yyyy");
    endDate = format(new Date(endDate), "MM/dd/yyyy");
    await getNegativePageEngagementsBetweenRange(startDate, endDate, false);
    console.log(callingObj.state);
  }
  console.log("out of while loop");

  console.log(callingObj.state);
  if (concatArray) {
    await callingObj.reduceArray("negativePageEngagementsBetweenRange");

    let { negativePageEngagementsBetweenRange } = callingObj.state;
    console.log(negativePageEngagementsBetweenRange);

    let array = {
      answer: 0,
      claim: 0,
      comment: 0,
      like: 0,
      link: 0,
      other: 0,
      rsvp: 0,
    };

    negativePageEngagementsBetweenRange.map((value) => {
      console.log(value.value);
    });

    // // Set data into useable format for table generator
    // let array = [];
    // // console.log(callingObj.state.NegativePageEngagementsBetweenRange);
    // let { NegativePageEngagementsBetweenRange } = await callingObj.state;

    // NegativePageEngagementsBetweenRange.map((y) => {
    //   y.map((x) => {
    //     array.push({
    //       value: x.value.total,
    //       end_time: x.end_time,
    //     });
    //   });
    // });
    // console.log(array);
    // callingObj.setState({
    //   NegativePageEngagementsBetweenRange: array,
    // });
  } else {
    console.log(callingObj.state);

    let { negativePageEngagementsBetweenRange } = callingObj.state;
    console.log(negativePageEngagementsBetweenRange);

    let object = {
      hide_clicks: 0,
      hide_all_clicks: 0,
      report_spam_clicks: 0,
      unlike_page_clicks: 0,
    };

    let array = [
      "hide_clicks",
      "hide_all_clicks",
      "report_spam_clicks",
      "unlike_page_clicks",
    ];

    negativePageEngagementsBetweenRange.map((value) => {
      array.map((type) => {
        try {
          if (value.value[type] == undefined) {
            throw `property type "${type}" not present`;
          }
          // console.log(
          //   `adding property type "${type}", value: `,
          //   value.value[type]
          // );

          object[`${type}`] += value.value[type];

          // console.log(value.value[type]);
        } catch (error) {
          // console.log(error);
        }
      });
    });

    // Add up all engagements for a total
    let total = 0;
    let keys = Object.keys(object);
    keys.map((type) => {
      total += object[type];
    });
    object.total = total;

    console.log(object);

    await callingObj.setState({
      typeTotalsForNegativePageEngagementsBetweenRange: object,
    });

    console.log(callingObj.state);

    // let { NegativePageEngagementsBetweenRange } = callingObj.state;
    // console.log(NegativePageEngagementsBetweenRange);
    // NegativePageEngagementsBetweenRange.map((value) => {
    //   console.log(value);
    // });
    // // Set data into useable format for table generator
    // let array = [];
    // // console.log(callingObj.state.NegativePageEngagementsBetweenRange);
    // let { NegativePageEngagementsBetweenRange } = await callingObj.state;
    // NegativePageEngagementsBetweenRange.map((x) => {
    //   // console.log(x.value);
    //   array.push({ value: x.value.total, end_time: x.end_time });
    // });
    // console.log(array);
    // callingObj.setState({
    //   NegativePageEngagementsBetweenRange: array,
    // });
  }
};
