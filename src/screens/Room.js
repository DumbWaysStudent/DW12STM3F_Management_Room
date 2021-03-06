import React from 'react';
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  ToastAndroid,
  ScrollView,
  StatusBar,
  Dimensions,
  Vibration,
  StyleSheet,
  Animated,
} from 'react-native';
import {Icon, Fab} from 'native-base';
import Header from '../components/header';
import {ThemeColor} from '../Assets/constantColor';
import ModalAddNewRoom from '../components/modalRoom';
import {
  AddNewRoom,
  getUserToken,
  updateRoom,
  deleteRoom,
  deleteRoomWithOrder,
  getAdminId,
} from '../functions';

import {connect} from 'react-redux';
import {actionGetAllRoom} from '../redux/actions/actionRoom';
import {actionGetAllOrder} from '../redux/actions/actionOrder';

console.disableYellowBox = true;
class Room extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isModalVisble: false,
      isModalAdd: false,
      inputRoomName: '',
      roomId: '',
      animRoom: new Animated.Value(0),
    };
  }
  async componentDidMount() {
    const id = await getAdminId();
    const token = await getUserToken();
    Animated.timing(this.state.animRoom, {
      toValue: 1,
      duration: 5000,
    }).start();
    if (!token) {
      Alert.alert('You Are Not Login', 'Please Login First', [
        {text: 'Login', onPress: () => this.props.navigation.navigate('Auth')},
      ]);
    }
    await this.props.actionGetAllRoom(token, id);
    await this.props.actionGetAllOrder(token, id);
    await this.props.allRoom.data;
    await this.props.DarkMode;
  }

  handleAddNewRoom = async () => {
    const response = await AddNewRoom(this.state.inputRoomName);
    ToastAndroid.showWithGravity(
      `${response.data.message}`,
      ToastAndroid.LONG,
      ToastAndroid.CENTER,
    );
    const token = await getUserToken();
    const id = await getAdminId();
    await this.props.actionGetAllRoom(token, id);
    this.setState({isModalAdd: false, inputRoomName: ''});
  };

  handleUpdateRoom = async (Id, roomName) => {
    this.setState({isModalVisble: true, inputRoomName: roomName, roomId: Id});
  };

  handleUpdateNewRoom = async () => {
    const token = await getUserToken();
    const id = await getAdminId();
    const res = await updateRoom(this.state.inputRoomName, this.state.roomId);
    ToastAndroid.showWithGravity(
      `${res.data.message}`,
      ToastAndroid.LONG,
      ToastAndroid.CENTER,
    );
    await this.props.actionGetAllRoom(token, id);
    this.setState({isModalVisble: false, inputRoomName: ''});
  };

  handleDeleteRoom = async (roomId, orderId) => {
    const token = await getUserToken();
    const id = await getAdminId();
    const res = await deleteRoom(roomId);

    ToastAndroid.showWithGravity(
      `${res.data.message}`,
      ToastAndroid.LONG,
      ToastAndroid.CENTER,
    );
    if (this.props.isVibrate) {
      Vibration.vibrate(2000);
    }
    await this.props.actionGetAllRoom(token, id);
  };

  handleDeleteRoomWithOrder = async (roomId, orderId) => {
    const token = await getUserToken();
    const id = await getAdminId();
    const res = await deleteRoomWithOrder(roomId, orderId);

    ToastAndroid.showWithGravity(
      `${res.data.message}`,
      ToastAndroid.LONG,
      ToastAndroid.CENTER,
    );
    await this.props.actionGetAllRoom(token, id);
  };

  handleErr = () => {
    ToastAndroid.showWithGravity(
      'Cannot be Deleted, The Room still in Order',
      ToastAndroid.LONG,
      ToastAndroid.CENTER,
    );
  };

  handleActionRoom = item => {
    item.is_booked
      ? this.handleErr()
      : item.order_id == undefined
      ? this.handleDeleteRoom(item._id)
      : this.handleDeleteRoomWithOrder(item._id, item.order_id._id);
  };
  render() {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: this.props.DarkMode.background,
        }}>
        <ModalAddNewRoom
          title="Update Room"
          isVisible={this.state.isModalVisble}
          onCancel={() =>
            this.setState({isModalVisble: false, inputRoomName: ''})
          }
          inputChangeValue={text => this.setState({inputRoomName: text})}
          inputValue={this.state.inputRoomName}
          onSubmit={() => this.handleUpdateNewRoom()}
        />
        <ModalAddNewRoom
          title="Add New Room"
          isVisible={this.state.isModalAdd}
          onCancel={() => this.setState({isModalAdd: false, inputRoomName: ''})}
          inputChangeValue={text => this.setState({inputRoomName: text})}
          inputValue={this.state.inputRoomName}
          onSubmit={() => this.handleAddNewRoom()}
        />
        <StatusBar
          backgroundColor={this.props.DarkMode.status}
          barStyle={
            this.props.DarkMode.isDarkmode ? 'light-content' : 'dark-content'
          }
        />
        <Header titleText="Room" />
        <ScrollView>
          <View
            style={{
              flexWrap: 'wrap',
              flexDirection: 'row',
              justifyContent: 'center',
            }}>
            {this.props.allRoom.data <= 0 ? (
              <View />
            ) : (
              this.props.allRoom.data.data.map(item => {
                return (
                  <TouchableOpacity
                    key={item._id}
                    onPress={() =>
                      this.handleUpdateRoom(item._id, item.room_name)
                    }
                    onLongPress={() => this.handleActionRoom(item)}>
                    <Animated.View style={{opacity: this.state.animRoom}}>
                      <View
                        style={[
                          Styles.containerRoom,
                          {
                            backgroundColor: this.props.DarkMode.isDarkmode
                              ? '#fff'
                              : this.props.DarkMode.background,
                          },
                        ]}>
                        <Text style={Styles.textRoomName}>
                          {item.room_name}
                        </Text>
                      </View>
                    </Animated.View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </ScrollView>

        <Fab
          position="bottomRight"
          style={{
            backgroundColor: this.props.DarkMode.button,
            marginBottom: 50,
          }}
          onPress={() => this.setState({isModalAdd: true})}>
          <Icon
            name="add"
            style={{color: this.props.DarkMode.isDarkmode ? 'white' : 'blue'}}
          />
        </Fab>
      </View>
    );
  }
}

const mapStateToProps = state => {
  return {
    allRoom: state.getAllRoom,
    DarkMode: state.setDarkMode,
    isVibrate: state.setVibrate.isVibrate,
  };
};
export default connect(
  mapStateToProps,
  {actionGetAllRoom, actionGetAllOrder},
)(Room);

const Styles = StyleSheet.create({
  btnAdd: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    marginBottom: 50,
  },
  containerBtnAdd: {borderWidth: 4, height: 80, width: 80, margin: 10},
  iconAdd: {fontSize: 50, alignSelf: 'center'},
  textRoomName: {alignSelf: 'center', fontSize: 30},
  containerRoom: {
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.5,
    elevation: 2,
    shadowColor: '#000',
    shadowRadius: 12,
    borderWidth: 3,
    borderColor: '#a4b0be',
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderRadius: 4,
    height: Dimensions.get('screen').height / 9,
    width: Dimensions.get('screen').width * 0.25,
    margin: 10,
    paddingTop: 15,
  },
});
