export const getPageAnalytics = async (
  page_id,
  callingObj,
  getPageAccessToken,
  getPageLikes,
  getUserPageEngagement,
  getPageEngagements,
  getNegativePageEngagements,
  getPagePostData
) => {
  console.log("Getting analytics for page");

  await callingObj.setState({
    engagedUsers: [],
    pageLikesBetweenRange: [],
    renderPageAnalytics: false,
    getPageEngagements: [],
  });

  let base = "https://graph.facebook.com";
  let access_token = `access_token=${callingObj.state.accessToken}`;

  // Get and set page access token
  await getPageAccessToken(page_id, base, access_token, callingObj);
  let pageAccessToken = callingObj.state.pageAccessToken;

  let promises = [];
  promises.push(
    getUserPageEngagement(page_id, base, pageAccessToken, callingObj),
    getPageLikes(page_id, base, pageAccessToken, callingObj),
    getPageEngagements(page_id, base, pageAccessToken, callingObj),
    getNegativePageEngagements(page_id, base, pageAccessToken, callingObj),
    getPagePostData(page_id, base, pageAccessToken, callingObj)
  );
  await Promise.all(promises);

  console.log(callingObj.state);

  callingObj.setState({ renderPageAnalytics: true });
};
