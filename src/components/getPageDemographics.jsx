import axios from "axios";
import { format, addDays, subDays } from "date-fns";

export const getPageDemographics = async (
  page_id,
  base,
  pageAccessToken,
  callingObj
) => {
  // Get likes by age and gender
  let metric = "metric=page_fans_gender_age";
  let url = `${base}/${page_id}/insights/?${metric}&access_token=${pageAccessToken}`;

  console.log("|-> retrieving likes by age and gender:");
  console.log(url);

  try {
    const response = await axios.get(url);
    // console.log("pageLikesDemographics", response.data.data[0].values[0].value);

    let pageLikesDemographics = response.data.data[0].values[0].value;
    // console.log("pageLikesDemographics", dailyReach);

    callingObj.setState({
      pageLikesDemographics: pageLikesDemographics,
    });
    console.log(callingObj.state);
  } catch (error) {
    console.log(error);
  }
};
