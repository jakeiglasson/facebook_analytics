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
import Form from "react-bootstrap/Form";
// Date Range Picker
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import DateRangePickerComponent from "./DateRangePickerComponent";
import { format, addDays, subDays } from "date-fns";
// Imported Custom Functions
import { setDateRange } from "./setDateRange.jsx";
import { getPageAccessToken } from "./getPageAccessToken.jsx";
import { getPageAnalytics } from "./getPageAnalytics.jsx";
import { getPageLikes } from "./getPageLikes.jsx";
import { getUserPageEngagement } from "./getUserPageEngagement.jsx";
import { getPageEngagements } from "./getPageEngagements.jsx";
import { getNegativePageEngagements } from "./getNegativePageEngagements.jsx";
import { getPagePostData } from "./getPagePostData.jsx";
import { getPagePostDailyReach } from "./getPagePostDailyReach";
import { getPageDemographics } from "./getPageDemographics";
import { getPageImpressions } from "./getPageImpressions";

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
    pageImpressions: [],
    totalEngagedUsers: "",
    renderPageAnalytics: false,
    pageLikes: "",
    pageLikesBetweenRange: [],
    pageEngagementsBetweenRange: [],
    negativePageEngagementsBetweenRange: [],
    typeTotalsForPageEngagementsBetweenRange: [],
    typeTotalsForNegativePageEngagementsBetweenRange: [],
    totalPageLikesBetweenRange: "",
    totalPageImpressions: "",
    displayDailyEngagements: "none",
    displayDailyPageLikes: "none",
    displayDailyReach: "none",
    displayPageImpressions: "none",
    xPagePosts: 3,
    pagePostsData: [],
    test: 0,
    dailyReachData: [],
    dailyReachTotal: 0,
    pageLikesDemographics: [],
    hideCalender: false,
  };

  responseFacebook = async (response) => {
    // console.log(response);
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

      // console.log(pages);
    }
  };

  reduceArray = async (stateObjName) => {
    // console.log("reducing array");
    // console.log(this.state);

    let value = await this.state[stateObjName];
    value = value.reduce(function (arr, e) {
      return arr.concat(e);
    });

    this.setState({
      [`${stateObjName}`]: value,
    });

    // console.log("finished reducing", this.state);
  };

  LoginButton = () => {
    return (
      <div className="mb-3">
        <FacebookLogin
          appId={this.props.appID}
          autoLoad={true}
          fields="name,email,picture,friends,accounts"
          scope="email,read_insights,pages_show_list,pages_read_engagement,pages_read_user_content,pages_manage_posts,pages_manage_engagement"
          // onClick={this.componentClicked}
          callback={this.responseFacebook}
        />
      </div>
    );
  };

  fbContent = () => {
    let fbContent;
    if (this.state.isLoggedIn) {
      fbContent = <></>;
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
              maxHeight: "300px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {this.state.pages.map((page, i) => {
              return (
                <div
                  style={{
                    width: "15rem",
                    display: "grid",
                    gridTemplateRows: "1fr 25%",
                    rowGap: "10px",
                    alignItems: "center",
                    justifyItems: "center",
                    background: "white",
                    color: "black",
                    padding: "20px",
                    borderRadius: ".25rem",
                  }}
                  key={i}
                >
                  <FontAwesomeIcon
                    icon={faColumns}
                    style={{ fontSize: "50px" }}
                  />
                  <div>{page.page_name}</div>
                  <div>ID: {page.page_id}</div>
                  <Button
                    variant="primary"
                    onClick={(event) => {
                      getPageAnalytics(
                        page.page_id,
                        this,
                        getPageAccessToken,
                        getPageLikes,
                        getUserPageEngagement,
                        getPageEngagements,
                        getNegativePageEngagements,
                        getPagePostData,
                        getPagePostDailyReach,
                        getPageDemographics,
                        getPageImpressions
                      );
                    }}
                  >
                    Get page analytics
                  </Button>
                </div>
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

  pageDemographicsTableData = (pageLikesDemographics) => {
    console.log(pageLikesDemographics);

    const ordered = {};
    Object.keys(pageLikesDemographics)
      .sort()
      .forEach(function (key) {
        ordered[key] = pageLikesDemographics[key];
      });

    console.log(ordered);

    return Object.entries(ordered).map(([key, value]) => {
      console.log(key, value);
      return (
        <tr>
          <td>{key}</td>
          <td>{value}</td>
        </tr>
      );
    });
  };

  pageAnalyticsTable = () => {
    let { renderPageAnalytics } = this.state;

    if (renderPageAnalytics) {
      // console.log(engagedUsers);
      // console.log("rendering page analytics");

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
        displayDailyReach,
        displayPageImpressions,
        typeTotalsForPageEngagementsBetweenRange,
        typeTotalsForNegativePageEngagementsBetweenRange,
        dailyReachData,
        dailyReachTotal,
        pageLikesDemographics,
        pageImpressions,
        totalPageImpressions,
      } = this.state;

      console.log(pageLikesDemographics);

      let { originalEndDate, originalStartDate } = this.state.dateRange;
      originalEndDate = format(new Date(originalEndDate), "dd/MM/yyyy");
      originalStartDate = format(new Date(originalStartDate), "dd/MM/yyyy");

      let last_7d = [];
      let today = new Date();
      let yesterday = subDays(today, 1);
      for (let i = 0; i < 7; i++) {
        let xDate = subDays(yesterday, i);
        last_7d.push(format(new Date(xDate), "dd/MM/yyyy"));
      }

      return (
        <>
          {/* Total Page Likes (Lifetime), Page Likes (date range) */}
          <div style={{ textAlign: "left", marginBottom: "1rem" }}>
            Page Likes:
            <br />
            The number of people who have liked your Page.
          </div>
          <Table striped bordered hover variant="dark">
            {colWidth}
            <thead>
              <tr>
                <th>Total Page Likes (Lifetime)</th>
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
          {/* Total Page Impressions (Lifetime), Page Impressions (date range) */}
          <div style={{ textAlign: "left", marginBottom: "1rem" }}>
            Page Impressions:
            <br />
            The number of times any content from your Page or about your Page
            entered a person's screen. This includes posts, stories, check-ins,
            ads, social information from people who interact with your Page and
            more.
          </div>
          <Table striped bordered hover variant="dark">
            {colWidth}
            <thead>
              <tr>
                <th>
                  Page Impressions
                  <br />
                  {`${originalStartDate}`} - {`${originalEndDate}`}
                  <br />
                  <button
                    type="button"
                    className={`btn btn-primary`}
                    style={{ maxHeight: "38px", width: "100%" }}
                    onClick={(event) => {
                      this.toggleDisplayTableComponent(
                        "displayPageImpressions"
                      );
                    }}
                  >
                    Toggle Daily Breakdown
                  </button>
                </th>
                <th>{totalPageImpressions}</th>
              </tr>
            </thead>
          </Table>
          {this.toggledTableComponent(
            colWidth,
            displayPageImpressions,
            pageImpressions,
            "Total"
          )}
          {/* Page Demographics */}
          <div style={{ textAlign: "left", marginBottom: "1rem" }}>
            Page Demographics (Lifetime):
            <br />
            The number of people who saw any of your posts at least once,
            grouped by age and gender. Aggregated demographic data is based on a
            number of factors, including age and gender information users
            provide in their Facebook profiles. This number is an estimate.
            <br />
            Note: If empty, the page does not have enough demographic
            information. Once sufficient information is present it will return a
            result (this is a facebook api limitation).
          </div>
          <Table striped bordered hover variant="dark">
            {colWidth}
            <thead>
              <tr>
                <th>Gender / Age</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {this.pageDemographicsTableData(pageLikesDemographics)}
            </tbody>
          </Table>
          {/* Daily Reach (last 7 days) */}
          <div style={{ textAlign: "left", marginBottom: "1rem" }}>
            Daily Reach:
            <br />
            The number of people who had any of your Page's posts enter their
            screen. Posts include statuses, photos, links, videos and more.
          </div>
          <Table striped bordered hover variant="dark">
            {colWidth}
            <thead>
              <tr>
                <th>
                  Daily Reach (Last 7 Days)
                  <br />
                  <button
                    type="button"
                    className={`btn btn-primary`}
                    style={{ maxHeight: "38px", width: "100%" }}
                    onClick={(event) => {
                      this.toggleDisplayTableComponent("displayDailyReach");
                    }}
                  >
                    Toggle Daily Breakdown
                  </button>
                </th>
                <th>{dailyReachTotal}</th>
              </tr>
            </thead>
          </Table>
          {this.toggledTableComponent(
            colWidth,
            displayDailyReach,
            dailyReachData,
            "Daily Reach"
          )}
          {/* Engaged Users */}
          <div style={{ textAlign: "left", marginBottom: "1rem" }}>
            Engaged Users:
            <br />
            The number of people who engaged with your Page. Engagement includes
            any click.
          </div>
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
          {/* Positive Engagement Metrics */}
          <div style={{ textAlign: "left", marginBottom: "1rem" }}>
            Positive Engagement Metrics:
            <br />
            The number of times people took a positive action broken down by
            type.
          </div>
          <Table striped bordered hover variant="dark">
            {colWidth}
            <thead>
              <tr>
                <th>
                  Positive Engagement Metrics
                  <br />
                  {`${originalStartDate}`} - {`${originalEndDate}`}
                  <br />
                </th>
                <th>
                  Total:
                  <br />
                  {typeTotalsForPageEngagementsBetweenRange.total}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Answered a question</td>
                <td>{typeTotalsForPageEngagementsBetweenRange.answer}</td>
              </tr>
              <tr>
                <td>Offers claimed</td>
                <td>{typeTotalsForPageEngagementsBetweenRange.claim}</td>
              </tr>
              <tr>
                <td>Commented on a story</td>
                <td>{typeTotalsForPageEngagementsBetweenRange.comment}</td>
              </tr>
              <tr>
                <td>Liked a story</td>
                <td>{typeTotalsForPageEngagementsBetweenRange.like}</td>
              </tr>
              <tr>
                <td>Shared a story</td>
                <td>{typeTotalsForPageEngagementsBetweenRange.link}</td>
              </tr>
              <tr>
                <td>Respond to an event</td>
                <td>{typeTotalsForPageEngagementsBetweenRange.rsvp}</td>
              </tr>
              <tr>
                <td>Other</td>
                <td>{typeTotalsForPageEngagementsBetweenRange.other}</td>
              </tr>
            </tbody>
          </Table>
          {/* Negative Engagement Metrics */}
          <div style={{ textAlign: "left", marginBottom: "1rem" }}>
            Negative Engagement Metrics:
            <br />
            The number of times people took a negative action broken down by
            type.
          </div>
          <Table striped bordered hover variant="dark">
            {colWidth}
            <thead>
              <tr>
                <th>
                  Negative Engagement Metrics
                  <br />
                  {`${originalStartDate}`} - {`${originalEndDate}`}
                  <br />
                </th>
                <th>
                  Total:
                  <br />
                  {typeTotalsForNegativePageEngagementsBetweenRange.total}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Hide story from page</td>
                <td>
                  {typeTotalsForNegativePageEngagementsBetweenRange.hide_clicks}
                </td>
              </tr>
              <tr>
                <td>Hide all posts from page</td>
                <td>
                  {
                    typeTotalsForNegativePageEngagementsBetweenRange.hide_all_clicks
                  }
                </td>
              </tr>
              <tr>
                <td>Reported an object as spam</td>
                <td>
                  {
                    typeTotalsForNegativePageEngagementsBetweenRange.report_spam_clicks
                  }
                </td>
              </tr>
              <tr>
                <td>Unliked page</td>
                <td>
                  {
                    typeTotalsForNegativePageEngagementsBetweenRange.unlike_page_clicks
                  }
                </td>
              </tr>
            </tbody>
          </Table>
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
          {button("Daily Reach (Last 7 Days)", "success")}
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

  handleChange(event, stateObj) {
    let value = event.target.value;

    switch (stateObj) {
      case "xPagePosts":
        if (value > 100) {
          value = 100;
        }
        this.setState({ xPagePosts: value });
        break;
      default:
        this.setState({ [`${stateObj}`]: value });
        break;
    }
  }

  xPagePostsForm = () => {
    return (
      <Form style={{ margin: "auto" }}>
        <Form.Group>
          <Form.Label>Last X posts to retrieve (100 max)</Form.Label>
          <Form.Control
            type="text"
            placeholder="0"
            style={{ maxWidth: "100px", margin: "auto" }}
            value={this.state.xPagePosts}
            onChange={(event) => {
              this.handleChange(event, "xPagePosts");
            }}
          />
        </Form.Group>
      </Form>
    );
  };

  pagePostsCards = () => {
    let { renderPageAnalytics } = this.state;

    if (renderPageAnalytics) {
      let { pagePostsData } = this.state;
      let postCard = (post, key) => {
        let date = format(new Date(post.created_time), "EEEE LLL do yyyy");
        return (
          <Card style={{ color: "black", textAlign: "left" }} key={key}>
            {/* <Card.Img variant="top" src="holder.js/100px180" /> */}
            <Card.Body>
              <Card.Title>{date}</Card.Title>
              <Card.Text>{post.message}</Card.Text>
              <div>Likes: {post.likes}</div>
              <div>Comments: {post.comments}</div>
            </Card.Body>
          </Card>
        );
      };

      return (
        <div
          style={{
            display: "grid",
            rowGap: "10px",
          }}
          className="mb-2"
        >
          {pagePostsData.map((post, key) => {
            return postCard(post, key);
          })}
        </div>
      );
    }
  };

  pageTitle = () => {
    if (!this.props.loggedIn) {
      return (
        <>
          <h1 className="App-title">Facebook Analytics</h1>
          <p>To get started, authenticate with Facebook.</p>
        </>
      );
    } else {
      return (
        <h1 className="App-title">
          Facebook Analytics{" "}
          <img src={this.state.picture} alt={this.state.name} />
        </h1>
      );
    }
  };

  calender = () => {
    if (this.state.hideCalender) {
      return (
        <Button
          variant="primary"
          onClick={(event) => {
            this.setState({
              hideCalender: !this.state.hideCalender,
            });
          }}
          className="mb-2"
        >
          Show calender
        </Button>
      );
    } else {
      return (
        <DateRangePickerComponent
          setDateRange={setDateRange}
          callingComponent={this}
        />
      );
    }
  };

  render() {
    return (
      <>
        {this.pageTitle()}
        <div style={{ width: "900px" }}>
          {this.fbContent()}
          {/* <div>{this.analyticsButtons()}</div> */}

          <div>{this.xPagePostsForm()}</div>
          {this.calender()}
          {this.fbPagesCard()}
          {this.pagePostsCards()}
          {this.pageAnalyticsTable()}
        </div>
      </>
    );
  }
}

export default Facebook;
