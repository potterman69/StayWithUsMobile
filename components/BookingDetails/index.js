import React, { Component } from "react";
import { Text, View, AsyncStorage, RefreshControl, Alert } from "react-native";
import Header from "../../ReuseableComponents/Header";
import Axios from "axios";
import { ActivityIndicator } from "react-native-paper";
import { URL } from "../../Helpers/helper";
import { Button } from "galio-framework";
import { ScrollView } from "react-native-gesture-handler";

export default class BookingDetails extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: true,
			bookings: [],
		};
	}

	async componentDidMount() {
		let currentUser = await AsyncStorage.getItem("currentUser");
		currentUser = JSON.parse(currentUser);
		let userRole = currentUser.userType;
		let userId = currentUser._id;
		this.setState({ userRole, userId });
		this.fetch();
	}

	fetch = () => {
		this.setState({ refreshing: true });
		Axios({
			url: URL + "property/booking/" + this.state.userId,
			method: "GET",
		})
			.then((response) => {
				if (response && response.data) {
					if (response.data.success) {
						this.setState({
							bookings: response.data.message,
							isLoading: false,
							refreshing: false,
						});
					} else {
						this.setState({
							bookings: null,
							isLoading: false,
							refreshing: false,
						});
					}
				}
			})
			.catch((error) => {
				this.setState({ property: null, isLoading: false, refreshing: false });
			});
	};

	handleApprove = (id) => {
		this.setState({ gettingRequest: true });
		Axios({
			url: URL + "property/booking/change/" + id,
			method: "POST",
			data: {
				change: "approved",
			},
		})
			.then((response) => {
				if (response && response.data) {
					if (response.data.success) {
						Alert.alert("Success", response.data.message);
						this.setState({ gettingRequest: false });
					} else {
						Alert.alert("Error", response.data.message);
						this.setState({ gettingRequest: false });
					}
				}
				this.fetch();
			})
			.catch((error) => {
				this.setState({
					property: null,
					isLoading: false,
					refreshing: false,
					gettingRequest: false,
				});
			});
	};

	handleDecline = (id) => {
		Axios({
			url: URL + "property/booking/change/" + id,
			method: "POST",
			data: {
				change: "declined",
			},
		})
			.then((response) => {
				if (response && response.data) {
					if (response.data.success) {
						Alert.alert("Success", response.data.message);
						this.setState({ gettingRequest: false });
					} else {
						Alert.alert("Error", response.data.message);
						this.setState({ gettingRequest: false });
					}
				}
				this.fetch();
			})
			.catch((error) => {
				this.setState({
					property: null,
					isLoading: false,
					refreshing: false,
					gettingRequest: false,
				});
			});
	};

	render() {
		return (
			<View>
				<Header
					title="Booking Requests"
					isBack
					navigation={this.props.navigation}
				/>
				<ScrollView
					style={{ marginTop: 20, height: "100%" }}
					refreshControl={
						<RefreshControl
							refreshing={this.state.refreshing}
							onRefresh={() => this.fetch()}
						/>
					}
				>
					{this.state.isLoading ? (
						<ActivityIndicator />
					) : this.state.bookings.length > 0 ? (
						this.state.bookings.map((item) => {
							return (
								<View
									style={{
										padding: 10,
										alignSelf: "center",
										width: "90%",
										backgroundColor: "#fff",
										shadowColor: "grey",
										shadowOffset: { width: 0, height: 0 },
										shadowOpacity: 1,
										margin: 10,
										borderRadius: 10,
									}}
								>
									<Text style={{ fontSize: 20, fontWeight: "bold" }}>
										{item.checkInDate} - {item.checkOutDate}
									</Text>
									<Text style={{ fontSize: 15, marginTop: 6 }}>
										Rent: {item.rentCost}
									</Text>
									<Text style={{ fontSize: 15, marginTop: 6 }}>
										Breakfast: {item.breakfastCost}
									</Text>
									<Text style={{ fontSize: 15, marginTop: 6 }}>
										Lunch: {item.lunchCost}
									</Text>
									<Text style={{ fontSize: 15, marginTop: 6 }}>
										Dinner: {item.dinnerCost}
									</Text>
									<Text style={{ fontSize: 15, marginTop: 6 }}>
										Vehicle: {item.vehicleCost}
									</Text>
									<Text
										style={{
											fontSize: 15,
											marginTop: 6,
											fontWeight: "bold",
											textAlign: "right",
										}}
									>
										Total Rent:{" "}
										{item.vehicleCost +
											item.dinnerCost +
											item.lunchCost +
											item.rentCost +
											item.breakfastCost}
									</Text>
									<View
										style={{
											flexDirection: "row",
											justifyContent: "space-between",
											marginTop: 10,
										}}
									>
										{this.state.gettingRequest ? (
											<ActivityIndicator />
										) : (
											<>
												<Button
													loading={this.state.gettingRequest}
													style={{ width: "45%" }}
													color="error"
													onPress={() => this.handleDecline(item._id)}
												>
													Decline
												</Button>
												<Button
													loading={this.state.gettingRequest}
													style={{ width: "45%" }}
													color="success"
													onPress={() => this.handleApprove(item._id)}
												>
													Approve
												</Button>
											</>
										)}
									</View>
								</View>
							);
						})
					) : (
						<Text style={{ textAlign: "center", fontSize: 18 }}>
							No booking requests received so far.
						</Text>
					)}
				</ScrollView>
			</View>
		);
	}
}
