import axios from "axios";
import { format, addDays, subDays } from "date-fns";

export const getPagePostData = async (
  page_id,
  base,
  pageAccessToken,
  callingObj
) => {
  // Get post identifying data (created_time, message, id)
  let postIdentifyingData;
  let getPostIdentifyingData = async () => {
    let xPagePosts = callingObj.state.xPagePosts;
    let limit = `limit=${xPagePosts}`;

    let url = `${base}/${page_id}/published_posts/?${limit}&access_token=${pageAccessToken}`;

    console.log("|-> retrieving published posts from page:");
    console.log(url);

    try {
      const response = await axios.get(url);
      postIdentifyingData = response.data.data;
    } catch (error) {
      console.log(error);
    }
  };
  await getPostIdentifyingData();

  // Retrieve all given posts likes and comments
  let postData = [];

  let getTotalMetric = async (metric, post_id, i) => {
    let summary = "summary=total_count";
    let url = `${base}/${post_id}/${metric}/?${summary}&access_token=${pageAccessToken}`;

    console.log(`|-> retrieving post ${metric}:`);
    console.log(url);

    try {
      const response = await axios.get(url);
      postData[i][`${metric}`] = response.data.summary.total_count;
    } catch (error) {
      console.log(error);
    }
  };

  const retrievePostData = async () => {
    let promises = [];
    postIdentifyingData.forEach((post, i) => {
      postData.push({});
      promises.push(getTotalMetric("likes", post.id, i));
      promises.push(getTotalMetric("comments", post.id, i));
    });
    await Promise.all(promises);
  };
  await retrievePostData();

  const combinePostData = () => {
    postData.forEach((post, i) => {
      postData[i] = Object.assign(postData[i], postIdentifyingData[i]);
      if (postData[i].message == undefined) {
        postData[i]["message"] = "-";
      }
    });
  };
  await combinePostData();

  // Set posts data into Facebook components state
  await callingObj.setState({
    pagePostsData: postData,
  });

  console.log(callingObj.state.pagePostsData);
};
