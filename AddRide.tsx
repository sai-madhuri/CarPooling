import * as React from "react";
import "../sass/OfferRide.sass";
import { withRouter } from "react-router";
import { DatePicker } from "office-ui-fabric-react";
import { PostData, getCurrentUser } from "../services/UtilityService";
import { Vehicle } from "../Models/Vehicle";
import { Ride } from "../Models/Ride";
import { ViaPoint } from "../Models/ViaPoint";
import { User } from "../Models/User";

class AddRideComponent extends React.Component<any, any>{

    timeSlots = ["5am-9am", "9am-12pm", "12pm-3pm", "3pm-6pm", "6pm-9pm"]
    availableSeatsList = [1, 2, 3]
    vehicleId: any;
    rideId: any;
    isViaPointAdded: boolean;
    
    constructor(props: any) {
        super(props);
        this.state = {
            rideDetailsErrors: { from: "*", to: "*", time: "*", vehicleModel: "*", vehicleNumber: "*" }, addViaPoint: false, showAvailableSeats: true, viaPointCount: 1,
            viaPoints: [], showNextPage: false, showAddButton: true, selectedTimeSlot: -1, availableSeats: -1,
            stops: [""],
            from: "",
            to: "",
            date: new Date(),
            seats: 0,
            price: 0,
            vehicleNumber: "",
            vehicleModel: "",
            time: "",
            validationMessage: "",
            priceError: "",
            seatsValidationMessage: ""
        };
        this.addViaPoint = this.addViaPoint.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.validateField = this.validateField.bind(this);
        this.validateRideForm = this.validateRideForm.bind(this);
        this.submitRideDetails = this.submitRideDetails.bind(this);
        this.publishRide = this.publishRide.bind(this);
        this.onSelectDate = this.onSelectDate.bind(this);
        this.handleStop = this.handleStop.bind(this);
    }

    handleChange = (event) => {
        const target = event.target;
        const fieldName = target.name;
        let errors = this.state.rideDetailsErrors;

        this.setState({ [fieldName]: event.target.value });
        if (fieldName == "price") {
            if (isNaN(event.target.value)) {
                errors.price = "Please enter valid price value";
            }
            else if (event.target.value.length <= 0) {
                errors.price = "Price of the ride cannot be less than 0";
            }
            else errors.price = "";
        }
        this.validateField(fieldName, event.target.value);
        this.setState({ errors: errors });
    }

    validateField(fieldName: string, fieldValue: string) {
        let errors = this.state.rideDetailsErrors;

        switch (fieldName) {
            case 'from':
                if (fieldValue.length < 0) {
                    errors.from = "From cannot be empty";
                }

                else {
                    var regex = /^([a-zA-Z ]{2})+([a-zA-Z ])*$/;
                    errors.from = regex.test(fieldValue) ? '' : 'Please enter a valid From';
                }

                break;

            case 'to':
                if (fieldValue.length < 0) {
                    errors.to = "To cannot be empty";
                }
                else {
                    var regex = /^([a-zA-Z ]{2})+([a-zA-Z ])*$/;
                    errors.to = regex.test(fieldValue) ? '' : 'Please enter a valid To';
                }
                break;

            case 'date': if (fieldValue.length < 0) {
                errors.date = "Date cannot be empty";
            }
            else errors.date = "";
                break;

            case 'vehicleNumber': if (fieldValue.length < 0) {
                errors.vehicleNumber = "Vehicle Number cannot be empty";
            }
            else errors.vehicleNumber = "";

            case 'vehicleModel': if (fieldValue.length < 0) {
                errors.vehicleModel = "Vehicle Model cannot be empty";
            }
            else errors.vehicleModel = "";

        }
        this.setState({ errors: errors });
    }

    validateRideForm(errors: any) {
        let count = 0;

        Object.values(errors).forEach((value: any) => {
            if (value.length > 0) count += 1;
        });

        if (count > 0) {
            this.setState({ validationMessage: "* Please fill the below fields with valid data", errors: errors });
            return false;
        }
        else this.setState({ validationMessage: "", errors: errors });
        return true;
    }

    submitRideDetails() {
        let errors = this.state.rideDetailsErrors;
        if (this.state.time.length == 0) {
            errors.time = "Please select ride start time";
        }
        else errors.time = "";

        if (this.validateRideForm(this.state.rideDetailsErrors)) {
            this.setState({ showNextPage: true, errors: errors });
        }
    }

    addViaPoint() {
        var viaPointCount: number = this.state.viaPointCount;
        viaPointCount += 1;
        if (this.state.viaPointCount < 4) {
            const viaPoints = this.state.viaPoints.concat(ViaPointField);
            // this.setState({addViaPoint : true,  showAvailableSeats : false, viaPointCount : viaPointCount});
            this.setState({ viaPoints: viaPoints, viaPointCount: viaPointCount });
        }
        this.setState({ showAddButton: false });
    }

    appendViaPoint() {
        var newInput = this.state.viaPointCount + 1;
        if (this.state.viaPointCount < 4) {
            this.setState(prevState => ({ inputs: prevState.viaPoints.concat([newInput]), viaPointCount: newInput }));
            // this.setState({addViaPoint : true,  showAvailableSeats : false, viaPointCount : viaPointCount});
        }

    }

    selectedAvailableSeats(seatCount) {
        this.setState({ availableSeats: seatCount });
    }

    addVehicle() {
        var activeUser : User = getCurrentUser();
        var vehicle: Vehicle = new Vehicle("-1", activeUser.id, this.state.vehicleModel, this.state.vehicleNumber);
        const vehicleUrl = "vehicle/AddVehicle";
        return PostData(vehicleUrl, vehicle).then(result => {
            try {
                this.vehicleId = result;
                return true;
            }
            catch (error) {
                console.log(error);
                return false;
            }
        })
    }

    addRide() {
        var activeUser : User = getCurrentUser();
        const moment = require('moment');
        var rideDate = this.onFormatDate(this.state.date) + 'T' + this.state.time + ":00";
        var rideStartDate = new moment(rideDate).format('YYYY-MM-DD HH:mm:ss');
        var ride: Ride = new Ride("-1", activeUser.id, this.state.from, this.state.to, this.state.availableSeats, this.state.price, rideStartDate, this.vehicleId);
        const url = "ride/AddRide";

        return PostData(url, ride).then(result => {
            try {
                if (result != null)
                    this.rideId = result;
                else return false;
                return true;
            }
            catch (error) {
                console.log(error);
                return false;
            }
        })
    }

    addViaPoints() {
        const viaPointUrl = "viaPoint/AddViaPoint";

        for (let index = 0; index < this.state.viaPointCount; index++) {
            var viaPoint = new ViaPoint("-1", this.rideId, this.state.stops[index], index+1,0);
            PostData(viaPointUrl, viaPoint).then(result => {
                try {
                    if (result == true) this.isViaPointAdded = true;
                    else this.isViaPointAdded = false;
                    return true;
                }
                catch (error) {
                    console.log(error);
                    this.isViaPointAdded = false;
                }
            })
        }
    }

    async publishRide() {
        if (this.state.availableSeats == -1) {
            this.setState({ seatsValidationMessage: "* Please select available seats" });
        }
        else if (this.state.price == 0) {
            this.setState({ priceError: "Please enter price value" });
        }
        else {
            console.log(this.state.stop1);
            console.log(this.state.stop2);
            console.log(this.state.stop3);
            this.setState({ seatsValidationMessage: "" });
            var isVehicleAdded = await this.addVehicle();
            if (isVehicleAdded == true) {
                var isRideAdded = await this.addRide();
            }
            if (isRideAdded == true) this.addViaPoints();
            this.props.history.push("/myRides");
        }
    }

    onFormatDate = (date: Date): string => {
        // return date.getFullYear()+'-'+(date.getMonth() + 1)+'-' + date.getDay();
        var today = new Date(date);
        var dd = today.getDate().toString();
        var mm = (today.getMonth() + 1).toString();
        var yyyy = today.getFullYear();
        if (parseInt(dd) < 10) {
            dd = '0' + dd.toString();
        }
        if (parseInt(mm) < 10) {
            mm = '0' + mm.toString();
        }

        return yyyy + '-' + mm + '-' + dd;
    };

    onSelectDate = (date: Date | null | undefined): void => {
        this.setState({ date: date });
    };

    handleStop(index, event) {
        let stops = this.state.stops;
        // const target = event.target;
        // const fieldName = target.name;

        // this.setState({ [fieldName]: event.target.value });
        stops[index] = event.target.value;
        this.setState({ stops: stops });
        console.log(this.state.stops);
    }

    render() {
        let errors = this.state.rideDetailsErrors;
        var today = new Date();
        const viaPoints = this.state.viaPoints.map((i, index) => {
            if (index == this.state.viaPoints.length - 1) {
                return (
                    <span className="newInputField">
                        <ViaPointField key={index} handleStop={this.handleStop} addViaPoint={this.addViaPoint} index={index + 1} />
                        {this.state.showAddButton ? "" : <input type="button" className="addViaPointButton" onClick={this.addViaPoint} value="+" />}
                    </span>
                )
            }

            return (
                <span className="inputField">
                    <ViaPointField key={index} handleStop={this.handleStop} addViaPoint={this.addViaPoint} index={index + 1} />
                </span>
            )

        }
        );

        const availableSeats = this.availableSeatsList.map((seatCount) => {
            return (
                <li key={seatCount} onClick={() => this.selectedAvailableSeats(seatCount)} className={this.state.availableSeats == seatCount ? "selectedSeatCount" : ""}>
                    {seatCount}
                </li>
            )
        })

        return (
                <div className="ms-Grid offerRideBody" dir="ltr">
                    <div className="ms-Grid-row offerRideGridBody">
                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ms-xl4 offerRideForm">
                            <p className="formTitle"> Offer a Ride </p>
                            <p className="formTag"> we get you the matches asap !</p>
                            <div className="errorValidationMessage">{this.state.validationMessage}</div>
                            <div className="searchFields">

                                <p className="formLabel">From
                                {errors.from.length > 0 ?
                                        <span className='error'>{errors.from}</span> : ""}
                                </p>
                                <input type="text" className={this.state.from.length == 0 ? "emptyTextField" : "filledTextField"} onChange={this.handleChange} name="from" value={this.state.from} />

                                <p className="formLabel">To
                                {errors.to.length > 0 ?
                                        <span className='error'>{errors.to}</span> : ""}
                                </p>
                                <input type="text" className={this.state.to.length == 0 ? "emptyTextField" : "filledTextField"} onChange={this.handleChange} name="to" value={this.state.to} />

                                <p className="formLabel">Date</p>
                                <div className="dateField"><DatePicker minDate={today} value={this.state.date}
                                    isRequired={true} onSelectDate={this.onSelectDate}></DatePicker></div>

                                <p className="formLabel">Time
                                {errors.time.length > 0 ?
                                        <span className='error'>{errors.time}</span> : ""}
                                </p>
                                <input type="time" className={this.state.time.length == 0 ? "emptyTextField" : "filledTextField"} onChange={this.handleChange}
                                    name="time" value={this.state.time} />

                                <p className="formLabel">
                                    Vehicle Number
                                {errors.vehicleNumber.length > 0 ?
                                        <span className='error'>{errors.vehicleNumber}</span> : ""}
                                </p>
                                <input type="text" className={this.state.vehicleNumber.length == 0 ? "emptyTextField" : "filledTextField"} onChange={this.handleChange} name="vehicleNumber" value={this.state.vehicleNumber} />

                                <p className="formLabel">
                                    Vehicle Model
                                {errors.vehicleModel.length > 0 ?
                                        <span className='error'>{errors.vehicleModel}</span> : ""}
                                </p>
                                <input type="text" className={this.state.vehicleModel.length == 0 ? "emptyTextField" : "filledTextField"} onChange={this.handleChange} name="vehicleModel" value={this.state.vehicleModel} />

                                <input type="button" className="nextButton" onClick={this.submitRideDetails} value="Next>>" />

                            </div>
                        </div>

                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ms-xl4">
                            {this.state.showNextPage ?
                                <div className="offerRideForm">
                                    <p className="formTitle"> Offer a Ride </p>
                                    <p className="formLabel"> we get you the matches asap !</p>
                                    <div className="searchFields">
                                        <p className="formLabel">Stop 1</p>
                                        <span className="inputField">
                                            <input type="text" className={this.state.stops[0].length == 0 ? "emptyField" : "filledField"}
                                                onChange={(event) => this.handleStop(0, event)} name="stop1" value={this.state.stops[0]} />
                                            {this.state.showAddButton ? <input type="button" className="addViaPoint" onClick={this.addViaPoint} value="+" /> : ""}
                                        </span>
                                    </div>
                                    <div className="viaPoint">
                                        {viaPoints}
                                        {/* {this.state.showAddButton ? "" : <input type="button" className="addViaPointButton" onClick={this.addViaPoint} value="+" />} */}
                                    </div>
                                    <div className="cardRow">
                                        <span className="rowElement"> <p className="rowLabel">Available Seats
                                <div className="error">{this.state.seatsValidationMessage}</div>
                                        </p></span>
                                        <span className="rowElement">
                                            <p className="rowLabel">
                                                Price{this.state.priceError.length > 0 ?
                                                    <span className='error'>{this.state.priceError}</span> : ""}
                                            </p>

                                        </span>
                                    </div>
                                    <div className="cardRow">
                                        <span className="rowElement">
                                            <ul className="availableSeats">
                                                {availableSeats}
                                            </ul>
                                        </span>
                                        <span className="rowElement price">
                                            <input type="number" className={this.state.price == 0 ? "emptyTextField" : "filledTextField"} onChange={this.handleChange} name="price" value={this.state.price} />
                                        </span>
                                    </div>
                                    <input type="button" className="submitButton" onClick={this.publishRide} value="Submit" />
                                </div>
                                : ""}
                        </div>
                    </div>
                </div>
        )
    }
}

class ViaPointField extends React.Component<any, any>{
    index: number;

    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.state = { isStopEmpty: true };
        this.index = 0;
        this.handleStop = this.handleStop.bind(this);
        this.addViaPoint = this.addViaPoint.bind(this);
    }

    handleChange = (event) => {
        if (event.target.value.length > 0) {
            this.setState({ isStopEmpty: false });
        }
    }

    handleStop(index, event) {
        const handleStop = this.props.handleStop;
        handleStop(index, event);
    }

    addViaPoint() {
        const addViaPoint = this.props.addViaPoint;
        addViaPoint();
    }

    render() {
        this.index += 1
        let name = "stop" + this.props.index.toString()
        return (
            <div className="viaPointField">
                <p className="formLabel">Stop {this.props.index + 1}</p>
                <input type="text" className={this.state.isStopEmpty ? "emptyField" : "filledField"} onChange={(event) => this.handleStop(this.props.index, event)} name={name} />
            </div>
        )
    }
}


export default withRouter(AddRideComponent);