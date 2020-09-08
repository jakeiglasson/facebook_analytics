import axios from "axios";
import { format, addDays, subDays } from "date-fns";

export const getPagePostDailyReach = async (
  page_id,
  base,
  pageAccessToken,
  callingObj
) => {
  // Get daily reach (last_7d)
  let metric = "metric=page_posts_impressions_unique";
  let date_preset = "date_preset=last_7d";
  let period = "period=day";
  let url = `${base}/${page_id}/insights/?${metric}&${date_preset}&${period}&access_token=${pageAccessToken}`;

  console.log("|-> retrieving daily reach for page:");
  console.log(url);

  try {
    const response = await axios.get(url);
    console.log("dailyReachData", response.data.data[0]);

    let dailyReach = response.data.data[0].values;
    console.log("dailyReachData", dailyReach);

    let dailyReachTotal = 0;
    dailyReach.map((data) => {
      dailyReachTotal += data.value;
    });

    callingObj.setState({
      dailyReachData: dailyReach,
      dailyReachTotal: dailyReachTotal,
    });
  } catch (error) {
    console.log(error);
  }
};
