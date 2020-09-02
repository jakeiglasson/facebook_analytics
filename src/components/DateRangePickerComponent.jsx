import React, { Component } from "react";
import { DateRangePicker, DateRange } from "react-date-range";
import { addDays } from "date-fns";

class DateRangePickerComponent extends Component {
  state = {
    selection: [
      {
        startDate: new Date(),
        endDate: addDays(new Date(), 7),
        key: "selection",
      },
    ],
  };

  componentDidMount = () => {
    // console.log(this.state);
    // console.log("componentDidMount: DateRangePickerComponent");

    let startDate = this.state.selection[0].startDate;
    let endDate = this.state.selection[0].endDate;
    // console.log(startDate);
    // console.log(endDate);

    this.props.setDateRange(startDate, endDate, this.props.callingComponent);
  };

  handleChange = async (selection) => {
    // console.log(selection);
    await this.setState({ selection: selection });

    // console.log(this.state);
    let startDate = this.state.selection[0].startDate;
    let endDate = this.state.selection[0].endDate;

    this.props.setDateRange(startDate, endDate, this.props.callingComponent);
  };
  render() {
    return (
      <React.Fragment>
        <DateRange
          onChange={(item) => {
            // console.log(item);
            this.handleChange([item.selection]);
          }}
          showSelectionPreview={true}
          moveRangeOnFirstSelection={false}
          months={2}
          ranges={this.state.selection}
          direction="horizontal"
          className="mb-4"
        />
      </React.Fragment>
    );
  }
}

export default DateRangePickerComponent;
