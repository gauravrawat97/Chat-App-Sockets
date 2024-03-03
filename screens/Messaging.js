import React, { useEffect, useLayoutEffect, useState } from "react";
import { View, TextInput, Text, FlatList, Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MessageComponent from "../components/MessageComponent";
import { styles } from "../utils/styles";
import socket from "../utils/socket";

const Messaging = ({ route, navigation }) => {
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState("");
  //👇🏻 Access the chatroom's name and id

  useLayoutEffect(() => {
    navigation.setOptions({ title: "Group Chat" });
    getUsername();
    // socket.emit("findRoom", id);
    // socket.on("foundRoom", (roomChats) => setChatMessages(roomChats));
    function fetchGroups() {
      fetch("http://localhost:4000/api")
        .then((res) => res.json())
        .then((data) => setChatMessages(data))
        .catch((err) => console.error(err));
    }
    fetchGroups();
  }, []);
  //👇🏻 This runs when the messages are updated.
  useEffect(() => {
    socket.on("roomMessage", (roomMessage) => {
      setChatMessages(roomMessage);
    });
  }, [socket]);

  //👇🏻 This function gets the username saved on AsyncStorage
  const getUsername = async () => {
    try {
      const value = await AsyncStorage.getItem("username");
      if (value !== null) {
        setUser(value);
      }
    } catch (e) {
      console.error("Error while loading username!");
    }
  };

  /*👇🏻 
        This function gets the time the user sends a message, then 
        logs the username, message, and the timestamp to the console.
     */

  const handleNewMessage = () => {
    const hour =
      new Date().getHours() < 10
        ? `0${new Date().getHours()}`
        : `${new Date().getHours()}`;

    const mins =
      new Date().getMinutes() < 10
        ? `0${new Date().getMinutes()}`
        : `${new Date().getMinutes()}`;

    socket.emit("newMessage", {
      message,
      user,
      timestamp: { hour, mins },
    });
    setMessage("");
  };

  return (
    <View style={styles.messagingscreen}>
      <View
        style={[
          styles.messagingscreen,
          { paddingVertical: 15, paddingHorizontal: 10 },
        ]}
      >
        {chatMessages?.length ? (
          <FlatList
            data={chatMessages}
            renderItem={({ item }) => (
              <MessageComponent item={item} user={user} />
            )}
            keyExtractor={(item) => item.id}
          />
        ) : (
          ""
        )}
      </View>

      <View style={styles.messaginginputContainer}>
        <TextInput
          style={styles.messaginginput}
          onChangeText={(value) => setMessage(value)}
          value={message}
        />
        <Pressable
          style={styles.messagingbuttonContainer}
          onPress={handleNewMessage}
        >
          <View>
            <Text style={{ color: "#f2f0f1", fontSize: 20 }}>SEND</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
};

export default Messaging;
