import React, { Component } from "react";
import ReactDOM from "react-dom";
import logo from "./logo.svg";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

import Facebook from "./components/Facebook";

class App extends Component {
  state = {
    loggedIn: false,
  };

  changeLoggedIn = (status) => {
    this.setState({ loggedIn: status });
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

          <Facebook changeLoggedIn={this.changeLoggedIn} />
        </header>
      </div>
    );
  }
}

export default App;
