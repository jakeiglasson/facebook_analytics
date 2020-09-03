import React, { Component } from "react";
import ReactDOM from "react-dom";
import logo from "./logo.svg";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import Facebook from "./components/Facebook";

class App extends Component {
  state = {
    loggedIn: false,
    showFacebookLogin: false,
    displayGetAppID: "block",
    appID: "720814561829107",
  };

  changeLoggedIn = (status) => {
    this.setState({ loggedIn: status });
  };

  handleChange(event, stateObj) {
    let value = event.target.value;
    this.setState({ [`${stateObj}`]: value });
  }

  getAppId = () => {
    let { displayGetAppID } = this.state;
    return (
      <Form
        style={{
          marginLeft: "auto",
          marginRight: "auto",
          display: `${displayGetAppID}`,
        }}
      >
        <Form.Group>
          <Form.Label>Facebook Developer App ID</Form.Label>
          <Form.Control
            type="text"
            placeholder="0"
            style={{
              maxWidth: "400px",
              margin: "auto",
              display: "inline-block",
            }}
            value={this.state.appID}
            onChange={(event) => {
              this.handleChange(event, "appID");
            }}
          />
          <Button
            variant="primary"
            type="submit"
            style={{ height: "38px", verticalAlign: "baseline" }}
            className="ml-2"
            onClick={(event) => {
              this.handleSetAppID(event);
            }}
          >
            Submit
          </Button>
        </Form.Group>
      </Form>
    );
  };

  handleSetAppID = (event) => {
    event.preventDefault();

    this.setState({
      displayGetAppID: "none",
      showFacebookLogin: true,
    });
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          {/* <img src={logo} className="App-logo" alt="logo" /> */}
          <h1 className="App-title">Facebook Analytics</h1>
          {(() => {
            if (!this.state.loggedIn) {
              return <p>To get started, authenticate with Facebook.</p>;
            }
          })()}
          {this.getAppId()}
          {(() => {
            if (this.state.showFacebookLogin) {
              return (
                <Facebook
                  changeLoggedIn={this.changeLoggedIn}
                  appID={this.state.appID}
                />
              );
            }
          })()}
        </header>
      </div>
    );
  }
}

export default App;
