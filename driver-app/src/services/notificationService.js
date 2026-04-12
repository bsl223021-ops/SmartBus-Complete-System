import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebaseService";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const requestNotificationPermission = async () => {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
};

export const registerForPushNotifications = async (userId) => {
  const granted = await requestNotificationPermission();
  if (!granted) return null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#1D4ED8",
    });
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId: "smartbus-project-ed975" });
  if (userId) {
    await updateDoc(doc(db, "drivers", userId), { pushToken: token.data });
  }
  return token.data;
};

export const scheduleLocalNotification = async (title, body, data = {}) => {
  return Notifications.scheduleNotificationAsync({
    content: { title, body, data, sound: true },
    trigger: null,
  });
};

export const addNotificationListener = (handler) => {
  return Notifications.addNotificationReceivedListener(handler);
};

export const addNotificationResponseListener = (handler) => {
  return Notifications.addNotificationResponseReceivedListener(handler);
};
