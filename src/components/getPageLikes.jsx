import axios from "axios";
import { format, addDays, subDays } from "date-fns";

export const getPageLikes = async (
  page_id,
  base,
  pageAccessToken,
  callingObj
) => {
  // Get total page likes
  let fields = `fields=fan_count`;
  let url = `${base}/${page_id}/?${fields}&access_token=${pageAccessToken}`;

  console.log("|-> retrieving metric: total page likes");
  console.log(url);

  await axios
    .get(url)
    .then(async (response) => {
      // handle success
      console.log(response);
      await callingObj.setState({
        pageLikes: response.data.fan_count,
      });
      console.log(callingObj.state);
    })
    .catch((error) => {
      // handle error
      console.log(error);
    });

  // Get page likes between range
  let getPageLikesBetweenRange = async (startDate, endDate, repeat) => {
    // let { startDate, endDate } = callingObj.formattedDates();
    startDate += "T00:00:00";
    endDate += "T24:00:00";

    let metric = `metric=page_fan_adds_by_paid_non_paid_unique`;
    let dateRange = `since=${startDate}&until=${endDate}`;

    url = `${base}/${page_id}/insights/?${metric}&${dateRange}&access_token=${pageAccessToken}`;

    console.log("|-> retrieving page likes metric with given range: ");
    console.log(url);

    let pageLikesBetweenRange = 0;

    await axios
      .get(url)
      .then(async (response) => {
        // handle success
        console.log(response);
        let data = await response.data.data[0].values;

        if (repeat) {
          console.log(data);

          let { pageLikesBetweenRange } = callingObj.state;
          console.log(pageLikesBetweenRange);
          pageLikesBetweenRange.push(data);
          console.log(pageLikesBetweenRange);

          await callingObj.setState({
            pageLikesBetweenRange: pageLikesBetweenRange,
          });
          console.log(callingObj.state);
        } else {
          console.log(data);

          await callingObj.setState({
            pageLikesBetweenRange: data,
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
      await getPageLikesBetweenRange(startDate, endDate, true);
      count += 1;
    }
  } else {
    // Single Request
    let { startDate, endDate } = callingObj.state.dateRange;
    endDate = addDays(endDate, 1);
    startDate = format(new Date(startDate), "MM/dd/yyyy");
    endDate = format(new Date(endDate), "MM/dd/yyyy");
    await getPageLikesBetweenRange(startDate, endDate, false);
    console.log(callingObj.state);
  }
  console.log("out of while loop");

  console.log(callingObj.state);
  if (concatArray) {
    callingObj.reduceArray("pageLikesBetweenRange");
    // Get total Likes for range
    let totalPageLikesBetweenRange = 0;
    callingObj.state.pageLikesBetweenRange.map((arr) => {
      arr.map((value) => {
        // console.log(value);
        totalPageLikesBetweenRange += value.value.total;
      });
    });
    callingObj.setState({
      totalPageLikesBetweenRange: totalPageLikesBetweenRange,
    });

    // Set data into useable format for table generator
    let array = [];
    // console.log(callingObj.state.pageLikesBetweenRange);
    let { pageLikesBetweenRange } = await callingObj.state;

    pageLikesBetweenRange.map((y) => {
      y.map((x) => {
        array.push({
          value: x.value.total,
          end_time: x.end_time,
        });
      });
    });
    console.log(array);
    callingObj.setState({
      pageLikesBetweenRange: array,
    });
  } else {
    // Get total Likes for range
    let totalPageLikesBetweenRange = 0;
    callingObj.state.pageLikesBetweenRange.map((value) => {
      // console.log(value);
      totalPageLikesBetweenRange += value.value.total;
    });
    callingObj.setState({
      totalPageLikesBetweenRange: totalPageLikesBetweenRange,
    });

    // Set data into useable format for table generator
    let array = [];
    // console.log(callingObj.state.pageLikesBetweenRange);
    let { pageLikesBetweenRange } = await callingObj.state;

    pageLikesBetweenRange.map((x) => {
      // console.log(x.value);
      array.push({ value: x.value.total, end_time: x.end_time });
    });
    console.log(array);
    callingObj.setState({
      pageLikesBetweenRange: array,
    });
  }
  console.log(callingObj.state);
};
