import axios from "axios";
import { format, addDays, subDays } from "date-fns";

export const getPagePostData = async (
  page_id,
  base,
  pageAccessToken,
  callingObj
) => {
  let postIdentifyingData;

  let getPostIdentifyingData = async () => {
    let xPagePosts = callingObj.state.xPagePosts;
    let limit = `limit=${xPagePosts}`;

    let url = `${base}/${page_id}/published_posts/?${limit}&access_token=${pageAccessToken}`;

    console.log("|-> retrieving published posts from page:");
    console.log(url);

    await axios
      .get(url)
      .then(async (response) => {
        // handle success
        console.log(response);

        postIdentifyingData = await response.data.data;
      })
      .catch((error) => {
        // handle error
        console.log(error);
      });

    console.log(postIdentifyingData);
  };

  await getPostIdentifyingData();

  let getPostInfo = async (post_id, i) => {
    console.log(post_id);
    let summary = "summary=total_count";

    let objectData = {
      likes: "",
      comments: "",
    };

    // Get total likes
    let url = `${base}/${post_id}/likes/?${summary}&access_token=${pageAccessToken}`;

    console.log("|-> retrieving post information:");
    console.log(url);

    await axios
      .get(url)
      .then(async (response) => {
        // handle success
        console.log(response);
        objectData["likes"] = await response.data.summary.total_count;
      })
      .catch((error) => {
        // handle error
        console.log(error);
      });
    // --> End: Get total Likes

    // Get total comments
    url = `${base}/${post_id}/comments/?${summary}&access_token=${pageAccessToken}`;

    console.log("|-> retrieving post information:");
    console.log(url);

    await axios
      .get(url)
      .then(async (response) => {
        // handle success
        await console.log(response);
        objectData["comments"] = await response.data.summary.total_count;
      })
      .catch((error) => {
        // handle error
        console.log(error);
      });
    // --> End: get total comments
    console.log(objectData);
    console.log(objectData.likes);
    return objectData;
  };

  let packageData = async () => {
    try {
      console.log(postIdentifyingData);
      let postsData = {};
      console.log(postIdentifyingData);
      // postIdentifyingData.map(async (object, i) => {
      //   getPostInfo(object.id, i).then(async (response) => {
      //     try {
      //       console.log(await response[0].likes);
      //     } catch (error) {
      //       console.log(error);
      //     }
      //   });
      //   console.log(getPostInfo(object.id, i));
      //   postsData[i] = await getPostInfo(object.id, i);
      // });

      // postIdentifyingData.map(async (object, i) => {
      //   let x = await getPostInfo(object.id, i);
      //   console.log(x);
      //   postIdentifyingData[i] = Object.assign(postIdentifyingData[i], x);
      // });
      postIdentifyingData.forEach(async (object, i) => {
        let x = await getPostInfo(object.id, i);
        console.log(x);
        postIdentifyingData[i] = Object.assign(postIdentifyingData[i], x);
      });

      // console.log(postsData);
      // console.log(postsData[0].likes);
      console.log(postIdentifyingData);
      console.log(postIdentifyingData[0].comments);

      await callingObj.setState(
        {
          pagePostsData: postIdentifyingData,
        },
        () => {
          console.log("setState complete");
        }
      );

      const { comments, likes } = callingObj.state.pagePostsData[0];
      console.log(comments, likes);

      try {
        console.log(callingObj.state);
        console.log(callingObj.state.pagePostsData);
        console.log(callingObj.state.pagePostsData[0]);
        console.log(callingObj.state.pagePostsData[0].id);
        console.log(callingObj.state.pagePostsData[0].comments);
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      console.log(error);
    }
  };

  await packageData();

  console.log(callingObj.state);
  try {
    console.log(callingObj.state.pagePostsData[0].comments);
  } catch (error) {
    console.log(error);
  }

  // let x = await callingObj.state.pagePostsData[0];
  // console.log(x.comments);
  // console.log(x[0].message);
  // console.log(x[0].likes.total_count);
  // console.log(await x[0].comments);
};
