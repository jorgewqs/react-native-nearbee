/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {FlatList, Image, NativeEventEmitter, Platform, StyleSheet, View} from 'react-native';
import {ListItem} from 'react-native-elements'
import NearBee from './nearbee_sdk/NearBee';
import Permissions from 'react-native-permissions'


const eventBeacons = "nearBeeNotifications";
const eventError = "nearBeeError";

export default class App extends Component {
    constructor() {
        super();
        this.bgEnabled = false;
        this.scanning = false;
        this.checkPermissions();

        this.state = {
            bgButtonText: "Enable BG notification",
            scanText: "Start scanning",
            beaconString: "No beacons in range",
            beacons: [],
            loading: false,
            locationPermission: false,
            bluetoothPermission: false
        };


    }

    onBackgroundChange = () => {
        if (this.bgEnabled === true) {
            this.setState({
                bgButtonText: "Enable BG notification",
            })
        } else {
            this.setState({
                bgButtonText: "Disable BG notification",
            })
        }
        this.bgEnabled = !this.bgEnabled;
        NearBee.enableBackgroundNotifications(this.bgEnabled);
    };

    onBeaconsFound = (event) => {
        let beacons = [];
        let beacJson = JSON.parse(event.nearBeeNotifications);
        for (let index = 0; index < beacJson.nearBeeNotifications.length; index++) {
            const element = beacJson.nearBeeNotifications[index];
            element['key'] = element.url;
            beacons.push(element);
        }
        this.setState({beacons});
    };

    onError = (event) => {
        let error = event.nearBeeError;
        console.error(error);
    };


    initNearBee() {
        if (!this.state.locationPermission) {
            return;
        }
        NearBee.initialize();
        const eventEmitter = new NativeEventEmitter(NearBee);
        eventEmitter.addListener(eventBeacons, this.onBeaconsFound);
        eventEmitter.addListener(eventError, this.onError);
        this.startScan();
    }

    async requestLocationPermission() {
        Permissions.request('location').then(response => {
            // Returns once the user has chosen to 'allow' or to 'not allow' access
            // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
            if (response === 'authorized') {
                this.checkPermissions()
            }
        })
    }

    async requestBluetoothPermission() {
        Permissions.request('bluetooth').then(response => {
            // Returns once the user has chosen to 'allow' or to 'not allow' access
            // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
            if (response === 'authorized') {
                this.checkPermissions()
            }
        })
    }

    async checkPermissions() {
        const permissionRequests = ['location'];
        const isIOS = Platform.OS === 'ios';
        if (isIOS) {
            permissionRequests.push('bluetooth');
        }
        Permissions.checkMultiple(permissionRequests).then(response => {
            //response is an object mapping type to permission

            if (response.location === 'authorized') {
                this.setState({
                    locationPermission: true,
                });
            }
            if (isIOS) {
                if (response.bluetooth === 'authorized') {
                    this.setState({
                        bluetoothPermission: true
                    });
                }
            } else {
                this.setState({
                    bluetoothPermission: true
                })
            }

            // Checking all the states
            if (!isIOS && !this.state.locationPermission) {
                this.requestLocationPermission();
            } else if (!this.state.bluetoothPermission) {
                this.requestBluetoothPermission();
            } else {
                this.initNearBee();
            }
        });
    }

    startScan() {
        NearBee.startScanning();
        this.scanning = true;
    }

    stopScan() {
        NearBee.stopScannig();
        this.scanning = false;
    }

    render() {
        return (
            <View>
                <FlatList
                    data={this.state.beacons}
                    renderItem={({item}) =>
                        <ListItem
                            title={item.title}
                            subtitle={item.description}
                            hideChevron
                            leftIcon={<Image source={{uri: item.icon}}
                                             style={{height: 60, width: 60}}/>}
                        />
                    }
                />
            </View>
        );
    }

}

const list = [
    {
        name: 'Amy Farha',
        subtitle: 'Vice President'
    },
    {
        name: 'Chris Jackson',
        avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
        subtitle: 'Vice Chairman'
    },
];

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 20,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
    itemBlock: {
        flexDirection: 'row',
        paddingBottom: 5,
    },
    itemImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    itemMeta: {
        marginLeft: 10,
        justifyContent: 'center',
    },
    itemName: {
        fontSize: 20,
    },
    itemLastMessage: {
        fontSize: 14,
        color: "#111",
    }
});
