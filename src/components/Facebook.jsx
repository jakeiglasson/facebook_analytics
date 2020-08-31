import React, { Component } from "react";
// Facebook Login <Button></Button>
import FacebookLogin from "react-facebook-login";
// Font Awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faColumns } from "@fortawesome/free-solid-svg-icons";
// Axios
import axios from "axios";
// Bootstrap
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
// Date Range Picker
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import DateRangePickerComponent from "./DateRangePickerComponent";
import { format, addDays, subDays } from "date-fns";
// Imported Custom Functions
import { setDateRange } from "./setDateRange.jsx";
import { getPageAccessToken } from "./getPageAcessToken.jsx";

class Facebook extends Component {
  state = {
    isLoggedIn: false,
    userID: "",
    name: "",
    email: "",
    picture: "",
    accessToken: "",
    pages: [],
    pageAccessToken: "",
    dateRange: {
      startDate: "",
      endDate: "",
      originalStartDate: "",
      originalEndDate: "",
    },
    requestsNeeded: "",
    engagedUsers: [],
    totalEngagedUsers: "",
    renderPageAnalytics: false,
    pageLikes: "",
    pageLikesBetweenRange: [],
    totalPageLikesBetweenRange: "",
    displayDailyEngagements: "none",
    displayDailyPageLikes: "none",
  };

  responseFacebook = async (response) => {
    console.log(response);
    let pagesData;

    if (response.status != "unknown") {
      await this.setState({
        isLoggedIn: true,
        userID: response.userID,
        name: response.name,
        email: response.email,
        picture: response.picture.data.url,
        accessToken: response.accessToken,
      });
      pagesData = response.accounts.data;
      this.props.changeLoggedIn(true);

      let pages = [];
      pagesData.forEach((page) => {
        pages.push({
          page_name: page.name,
          page_id: page.id,
          page_access_token: page.access_token,
        });
      });

      await this.setState({ pages: pages });

      console.log(pages);
    }
  };

  getPageAnalytics = async (page_id) => {
    console.log("Getting analytics for page");

    await this.setState({
      engagedUsers: [],
      pageLikesBetweenRange: [],
      renderPageAnalytics: false,
    });

    let base = "https://graph.facebook.com";
    let access_token = `access_token=${this.state.accessToken}`;

    // Get and set page access token
    await getPageAccessToken(page_id, base, access_token, this);
    let pageAccessToken = this.state.pageAccessToken;

    await this.getUserPageEngagement(page_id, base, pageAccessToken);
    await this.getPageLikes(page_id, base, pageAccessToken);
    console.log(this.state);

    this.setState({ renderPageAnalytics: true });
  };

  formattedDates = () => {
    let { startDate, endDate } = this.state.dateRange;
    startDate = format(new Date(startDate), "MM/dd/yyyy");
    endDate = addDays(endDate, 1);
    endDate = format(new Date(endDate), "MM/dd/yyyy");
    startDate += "T00:00:00";
    endDate += "T24:00:00";
    return { startDate, endDate };
  };

  getPageLikes = async (page_id, base, pageAccessToken) => {
    // Retrieve page likes metric
    // insights/?metric=page_fan_adds_by_paid_non_paid_unique&since=08/27/2020T00:00:00&until=09/04/2020T24:00:00

    // Get total page likes
    let fields = `fields=fan_count`;
    let url = `${base}/${page_id}/?${fields}&access_token=${pageAccessToken}`;

    console.log("|-> retrieving page likes metric: ");
    console.log(url);

    await axios
      .get(url)
      .then(async (response) => {
        // handle success
        console.log(response);
        await this.setState({
          pageLikes: response.data.fan_count,
        });
        console.log(this.state);
      })
      .catch((error) => {
        // handle error
        console.log(error);
      });

    // Get page likes between range
    let getPageLikesBetweenRange = async (startDate, endDate, repeat) => {
      // let { startDate, endDate } = this.formattedDates();
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

          // let likesByRange = await response.data.data[0].values;
          // likesByRange.map((like, i) => {
          //   pageLikesBetweenRange += like.value.total;
          // });

          // await this.setState({
          //   pageLikesBetweenRange: pageLikesBetweenRange,
          // });
          // // -----
          // console.log(response);

          // handle success
          if (repeat) {
            console.log(data);

            let { pageLikesBetweenRange } = this.state;
            console.log(pageLikesBetweenRange);
            pageLikesBetweenRange.push(data);
            console.log(pageLikesBetweenRange);

            await this.setState({
              pageLikesBetweenRange: pageLikesBetweenRange,
            });
            console.log(this.state);
          } else {
            console.log(data);

            await this.setState({
              pageLikesBetweenRange: data,
            });

            console.log(this.state);
          }
        })
        .catch((error) => {
          // handle error
          console.log(error);
        });
    };

    let concatArray = false;
    if (this.state.requestsNeeded > 1) {
      // Multiple requests
      concatArray = true;
      let { requestsNeeded } = this.state;
      let count = 1;
      while (requestsNeeded > 0) {
        console.log("Executing while loop: ", count);
        let { startDate } = this.state.dateRange;
        startDate = addDays(startDate, 90 * (count - 1));
        let endDate = addDays(startDate, 90);

        if (requestsNeeded == 1) {
          endDate = this.state.dateRange.endDate;
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
      let { startDate, endDate } = this.state.dateRange;
      endDate = addDays(endDate, 1);
      startDate = format(new Date(startDate), "MM/dd/yyyy");
      endDate = format(new Date(endDate), "MM/dd/yyyy");
      await getPageLikesBetweenRange(startDate, endDate, false);
      console.log(this.state);
    }
    console.log("out of while loop");

    console.log(this.state);
    if (concatArray) {
      this.reduceArray("pageLikesBetweenRange");
      // Get total Likes for range
      let totalPageLikesBetweenRange = 0;
      this.state.pageLikesBetweenRange.map((arr) => {
        arr.map((value) => {
          // console.log(value);
          totalPageLikesBetweenRange += value.value.total;
        });
      });
      this.setState({
        totalPageLikesBetweenRange: totalPageLikesBetweenRange,
      });

      // Set data into useable format for table generator
      let array = [];
      // console.log(this.state.pageLikesBetweenRange);
      let { pageLikesBetweenRange } = await this.state;

      pageLikesBetweenRange.map((y) => {
        y.map((x) => {
          array.push({
            value: x.value.total,
            end_time: x.end_time,
          });
        });
      });
      console.log(array);
      this.setState({
        pageLikesBetweenRange: array,
      });
    } else {
      // Get total Likes for range
      let totalPageLikesBetweenRange = 0;
      this.state.pageLikesBetweenRange.map((value) => {
        // console.log(value);
        totalPageLikesBetweenRange += value.value.total;
      });
      this.setState({
        totalPageLikesBetweenRange: totalPageLikesBetweenRange,
      });

      // Set data into useable format for table generator
      let array = [];
      // console.log(this.state.pageLikesBetweenRange);
      let { pageLikesBetweenRange } = await this.state;

      pageLikesBetweenRange.map((x) => {
        // console.log(x.value);
        array.push({ value: x.value.total, end_time: x.end_time });
      });
      console.log(array);
      this.setState({
        pageLikesBetweenRange: array,
      });
    }
  };

  getUserPageEngagement = async (page_id, base, pageAccessToken) => {
    let userPageEngagementRequest = async (startDate, endDate, repeat) => {
      console.log(this.state);
      startDate += "T00:00:00";
      endDate += "T24:00:00";

      console.log("startDate: ", startDate);
      console.log("endDate: ", endDate);
      console.log("repeat: ", repeat);

      // Retrieve user engagement metrics
      let since = `since=${startDate}`;
      let until = `until=${endDate}`;
      let metric = `metric=page_engaged_users`;
      let period = `period=day`;
      let params = `${since}&${until}&${metric}&${period}`;
      let url = `${base}/${page_id}/insights/?${params}&access_token=${pageAccessToken}`;

      console.log("|-> retrieving user page engagement metrics: ");
      console.log(url);

      await axios
        .get(url)
        .then(async (response) => {
          console.log(response);
          // handle success
          let data = await response.data.data[0].values;
          if (repeat) {
            console.log(data);

            let { engagedUsers } = this.state;
            console.log(engagedUsers);
            engagedUsers.push(data);
            console.log(engagedUsers);

            await this.setState({ engagedUsers: engagedUsers });
            console.log(this.state);
          } else {
            console.log(data);

            await this.setState({
              engagedUsers: data,
            });

            console.log(this.state);
          }
        })
        .catch((error) => {
          // handle error
          console.log(error);
        });
    };

    let concatArray = false;
    if (this.state.requestsNeeded > 1) {
      // Multiple requests
      concatArray = true;
      let { requestsNeeded } = this.state;
      let count = 1;
      while (requestsNeeded > 0) {
        console.log("Executing while loop: ", count);
        let { startDate } = this.state.dateRange;
        startDate = addDays(startDate, 90 * (count - 1));
        let endDate = addDays(startDate, 90);

        if (requestsNeeded == 1) {
          endDate = this.state.dateRange.endDate;
          endDate = addDays(endDate, 1);
        }

        console.log(endDate);

        // Convert date format to mm/dd/yyyy
        startDate = format(new Date(startDate), "MM/dd/yyyy");
        endDate = format(new Date(endDate), "MM/dd/yyyy");

        console.log(endDate);

        requestsNeeded -= 1;
        await userPageEngagementRequest(startDate, endDate, true, this);
        count += 1;
      }
    } else {
      // Single Request
      let { startDate, endDate } = this.state.dateRange;
      endDate = addDays(endDate, 1);
      startDate = format(new Date(startDate), "MM/dd/yyyy");
      endDate = format(new Date(endDate), "MM/dd/yyyy");
      await userPageEngagementRequest(startDate, endDate, false, this);
      console.log(this.state);
    }
    console.log("out of while loop");

    console.log(this.state);
    if (concatArray) {
      this.reduceArray("engagedUsers");
      // Get total Engagements
      let totalEngagedUsers = 0;
      this.state.engagedUsers.map((arr) => {
        arr.map((value) => {
          totalEngagedUsers += value.value;
        });
      });
      this.setState({
        totalEngagedUsers: totalEngagedUsers,
      });
    } else {
      // Get total Engagements
      let totalEngagedUsers = 0;
      this.state.engagedUsers.map((value) => {
        // console.log(value);
        totalEngagedUsers += value.value;
      });
      this.setState({
        totalEngagedUsers: totalEngagedUsers,
      });
    }

    // End of page engagement code
  };

  reduceArray = async (stateObjName) => {
    console.log("reducing engaged users array");
    console.log(this.state);

    let value = await this.state[stateObjName];
    value = value.reduce(function (arr, e) {
      return arr.concat(e);
    });

    this.setState({
      [`${stateObjName}`]: value,
    });

    console.log("finished reducing", this.state);
  };

  LoginButton = () => {
    return (
      <div className="mb-3">
        <FacebookLogin
          appId="720814561829107"
          autoLoad={true}
          fields="name,email,picture,friends,accounts"
          scope="public_profile,email,user_friends,pages_show_list,user_birthday,pages_read_engagement,pages_show_list,read_insights"
          // onClick={this.componentClicked}
          callback={this.responseFacebook}
        />
      </div>
    );
  };

  fbContent = () => {
    let fbContent;
    if (this.state.isLoggedIn) {
      fbContent = (
        <div
          style={{
            width: "400px",
            margin: "auto",
            padding: "20px",
          }}
        >
          {/* <img src={this.state.picture} alt={this.state.name} /> */}
          <h2>Welcome {this.state.name}</h2>
          {/* Email: {this.state.email}
          <p style={{ fontSize: "10px", wordWrap: "break-word" }}>
            Access Token: {this.state.accessToken}
          </p> */}
        </div>
      );
    } else {
      fbContent = this.LoginButton();
    }
    return fbContent;
  };

  fbPagesCard = () => {
    if (this.state.isLoggedIn) {
      return (
        <div className="mb-4">
          <h3>Your Pages</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              justifyItems: "center",
              maxWidth: "900px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {this.state.pages.map((page, i) => {
              return (
                <Card
                  style={{
                    width: "15rem",
                    minHeight: "270px",
                    display: "inline-block",
                    color: "black",
                  }}
                  key={i}
                  className="mr-4"
                >
                  {/* <Card.Img variant="top" src="holder.js/100px180" /> */}
                  <FontAwesomeIcon icon={faColumns} />
                  <Card.Body>
                    <Card.Title style={{ fontSize: "16px" }}>
                      {page.page_name}
                    </Card.Title>
                    <Card.Text style={{ fontSize: "16px" }}>
                      page_id: {page.page_id}
                    </Card.Text>
                    <Button
                      variant="primary"
                      onClick={(event) => {
                        this.getPageAnalytics(page.page_id);
                      }}
                    >
                      Get page analytics
                    </Button>
                  </Card.Body>
                </Card>
              );
            })}
          </div>
        </div>
      );
    }
  };

  toggleDisplayTableComponent = (stateObjName) => {
    let value = this.state[stateObjName];
    if (value == "none") {
      this.setState({
        [`${stateObjName}`]: "table",
      });
    } else {
      this.setState({
        [`${stateObjName}`]: "none",
      });
    }
  };

  toggledTableComponent = (colWidth, display, metric, heading) => {
    return (
      <Table
        striped
        bordered
        hover
        variant="dark"
        style={{ display: `${display}` }}
      >
        {colWidth}
        <thead>
          <tr>
            <th>Daily Breakdown</th>
            <th>{heading}</th>
          </tr>
        </thead>
        <tbody>
          {metric.map((data, i) => {
            // console.log("----------------");
            // console.log(data.end_time);

            let date = format(new Date(data.end_time), "yyyy-MM-dd");
            // console.log(date);

            date = new Date(date);
            // console.log(date);

            date = subDays(date, 1);
            // console.log(date);

            date = format(new Date(date), "EEEE LLL do yyyy");
            // console.log(date);

            // console.log("----------------");
            return (
              <tr key={i}>
                <td>{date}</td>
                <td>{data.value}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    );
  };

  pageAnalyticsTable = () => {
    let { renderPageAnalytics } = this.state;

    if (renderPageAnalytics) {
      // console.log(engagedUsers);
      console.log("rendering page analytics");

      let colWidth = (
        <colgroup>
          <col span="1" style={{ width: "50%" }} />
          <col span="1" style={{ width: "50%" }} />
        </colgroup>
      );

      let {
        engagedUsers,
        totalEngagedUsers,
        pageLikes,
        pageLikesBetweenRange,
        totalPageLikesBetweenRange,
        displayDailyEngagements,
        displayDailyPageLikes,
      } = this.state;

      console.log(this.state);

      let { originalEndDate, originalStartDate } = this.state.dateRange;
      originalEndDate = format(new Date(originalEndDate), "dd/MM/yyyy");
      originalStartDate = format(new Date(originalStartDate), "dd/MM/yyyy");

      return (
        <>
          <Table striped bordered hover variant="dark">
            {colWidth}
            <thead>
              <tr>
                <th>Total Page Likes</th>
                <th>{pageLikes}</th>
              </tr>
              <tr>
                <th>
                  Page Likes <br />
                  {`${originalStartDate}`} - {`${originalEndDate}`}
                  <br />
                  <button
                    type="button"
                    className={`btn btn-primary`}
                    style={{ maxHeight: "38px", width: "100%" }}
                    onClick={(event) => {
                      this.toggleDisplayTableComponent("displayDailyPageLikes");
                    }}
                  >
                    Toggle Daily Breakdown
                  </button>
                </th>
                <th>{totalPageLikesBetweenRange}</th>
              </tr>
            </thead>
          </Table>
          {this.toggledTableComponent(
            colWidth,
            displayDailyPageLikes,
            pageLikesBetweenRange,
            "Likes"
          )}
          <Table striped bordered hover variant="dark">
            {colWidth}
            <thead>
              <tr>
                <th>
                  Engaged Users
                  <br />
                  {`${originalStartDate}`} - {`${originalEndDate}`}
                  <br />
                  <button
                    type="button"
                    className={`btn btn-primary`}
                    style={{ maxHeight: "38px", width: "100%" }}
                    onClick={(event) => {
                      this.toggleDisplayTableComponent(
                        "displayDailyEngagements"
                      );
                    }}
                  >
                    Toggle Daily Breakdown
                  </button>
                </th>
                <th>{totalEngagedUsers}</th>
              </tr>
            </thead>
          </Table>
          {this.toggledTableComponent(
            colWidth,
            displayDailyEngagements,
            engagedUsers,
            "User Engagements"
          )}
        </>
      );
    }
  };

  analyticsButtons = () => {
    let button = (text, type) => {
      return (
        <button
          type="button"
          className={`btn btn-${type} mb-2`}
          style={{ maxHeight: "38px", width: "100%" }}
        >
          {text}
        </button>
      );
    };

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          maxWidth: "900px",
          marginLeft: "auto",
          marginRight: "auto",
          columnGap: "2rem",
        }}
      >
        <div>
          {button("Total Page Likes for a page", "success")}
          {button("Daily Reach", "success")}
          {button("Demographics", "success")}
        </div>
        <div>
          {button("Get The # of New Page Likes", "primary")}
          {button("last x posts from facebook page", "primary")}
          {button("Page Impressions", "primary")}
        </div>
        <div>
          {button("Engagements within a date range", "primary")}
          {button("Engaged Users", "primary")}
        </div>
      </div>
    );
  };

  render() {
    return (
      <>
        <div>
          {this.fbContent()}
          <div>{this.analyticsButtons()}</div>

          <div>
            <DateRangePickerComponent
              setDateRange={setDateRange}
              callingComponent={this}
            />
          </div>
          {this.fbPagesCard()}
          {this.pageAnalyticsTable()}
        </div>
      </>
    );
  }
}

export default Facebook;
