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
    pageEngagementsBetweenRange: [],
    negativePageEngagementsBetweenRange: [],
    typeTotalsForPageEngagementsBetweenRange: [],
    typeTotalsForNegativePageEngagementsBetweenRange: [],
    totalPageLikesBetweenRange: "",
    displayDailyEngagements: "none",
    displayDailyPageLikes: "none",
    xPagePosts: 3,
    pagePostsData: [],
    test: 0,
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
                        getPageAnalytics(
                          page.page_id,
                          this,
                          getPageAccessToken,
                          getPageLikes,
                          getUserPageEngagement,
                          getPageEngagements,
                          getNegativePageEngagements,
                          getPagePostData
                        );
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
        typeTotalsForPageEngagementsBetweenRange,
        typeTotalsForNegativePageEngagementsBetweenRange,
      } = this.state;

      // console.log(this.state);

      let { originalEndDate, originalStartDate } = this.state.dateRange;
      originalEndDate = format(new Date(originalEndDate), "dd/MM/yyyy");
      originalStartDate = format(new Date(originalStartDate), "dd/MM/yyyy");

      return (
        <>
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

  handleChange(event) {
    let value = event.target.value;
    if (value > 100) {
      value = 100;
    }
    this.setState({ xPagePosts: value });
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
              this.handleChange(event);
            }}
          />
        </Form.Group>
      </Form>
    );
  };

  pagePostsCards = () => {
    let { renderPageAnalytics } = this.state;

    if (renderPageAnalytics) {
      console.log("rendering page posts");
      let { pagePostsData } = this.state;
      console.log(pagePostsData);
      let postCard = (post, key) => {
        console.log(post.likes);
        console.log(post.message);
        let date = format(new Date(post.created_time), "EEEE LLL do yyyy");
        return (
          <Card style={{ width: "18rem", color: "black" }} key={key}>
            {/* <Card.Img variant="top" src="holder.js/100px180" /> */}
            <Card.Body>
              <Card.Title>{date}</Card.Title>
              <Card.Text>{post.message}</Card.Text>
              <div>Likes: {post.likes}</div>
              <div>Comments: {post.comments}</div>
            </Card.Body>
          </Card>
          // <div key={key}>
          //   Page Post
          //   <br />
          //   Message: {post.message}
          //   <br />
          //   Likes: {post.likes}
          //   <br />
          //   Comments: {post.comments}
          // </div>
        );
      };

      return (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
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

  render() {
    return (
      <>
        <div>
          {this.fbContent()}
          <div>{this.analyticsButtons()}</div>

          <div>
            {this.xPagePostsForm()}
            <DateRangePickerComponent
              setDateRange={setDateRange}
              callingComponent={this}
            />
          </div>

          {this.fbPagesCard()}
          {this.pagePostsCards()}
          {this.pageAnalyticsTable()}
        </div>
      </>
    );
  }
}

export default Facebook;
