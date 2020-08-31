export const getPageAnalytics = async (
  page_id,
  getPageAccessToken,
  callingObj
) => {
  console.log("Getting analytics for page");

  await callingObj.setState({
    engagedUsers: [],
    pageLikesBetweenRange: [],
    renderPageAnalytics: false,
  });

  let base = "https://graph.facebook.com";
  let access_token = `access_token=${callingObj.state.accessToken}`;

  // Get and set page access token
  await getPageAccessToken(page_id, base, access_token, callingObj);
  let pageAccessToken = callingObj.state.pageAccessToken;

  await callingObj.getUserPageEngagement(page_id, base, pageAccessToken);
  await callingObj.getPageLikes(page_id, base, pageAccessToken);
  console.log(callingObj.state);

  callingObj.setState({ renderPageAnalytics: true });
};
