import axios from "axios";

export const getPageAccessToken = async (
  page_id,
  base,
  access_token,
  callingObj
) => {
  // Get page access token

  let fields = "fields=access_token";
  let url = `${base}/${page_id}?${fields}&${access_token}`;
  let pageAccessToken;

  console.log("|-> retrieving page access token: ");
  console.log(url);

  await axios
    .get(url)
    .then(async (response) => {
      console.log(response);
      pageAccessToken = response.data.access_token;
      await callingObj.setState({ pageAccessToken: pageAccessToken });
    })
    .catch(async (error) => {
      console.log(error);
    });
};
