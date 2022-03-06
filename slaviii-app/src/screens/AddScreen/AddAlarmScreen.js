import React, { useEffect, useState } from "react";
import { StyleSheet, Text, Image, TouchableOpacity, Alert } from "react-native";

import styles from "./styles";

import {
  Container,
  Content,
  Form,
  Item,
  Input,
  Button,
  Icon,
  Label,
  View,
} from "native-base";
import { Formik } from "formik";

import { firebase } from "@/src/firebase/config";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";

import { addAlarmSchema } from "@/src/utils";
import { Loader } from "@/src/components";

const AddAlarmScreen = ({ navigation }) => {
  const [time, setTime] = useState(null);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const userID = firebase.auth().currentUser.uid;
  const userAlarmInstance = firebase
    .firestore()
    .collection("users/" + userID + "/alarms");

  const onChangeTime = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    setShow(false);
    setTime(currentTime);
  };

  const showTimePicker = () => {
    setShow(true);
  };

  const handleAddAlarm = async (values) => {
    setLoading(true);

    // alert(JSON.stringify(values));
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    const data = {
      time: values.time,
      name: values.name,
      food: values.food,
      pet: values.pet,
      createdAt: timestamp,
    };

    try {
      await userAlarmInstance.add(data).catch((error) => {
        alert(error);
      });

      Alert.alert(
        "New Alarm Added",
        "Your alarm has been saved to cloud successfully!"
      );

      navigation.navigate("Home");
    } catch (error) {
      alert(error);
    }

    setLoading(false);
  };

  return (
    <Container>
      <Loader loading={loading} />
      <Content padder>
        <Formik
          initialValues={{
            time: "",
            name: "",
            food: "",
            pet: "pet",
          }}
          validationSchema={addAlarmSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setSubmitting(true);
            handleAddAlarm(values);
            setSubmitting(false);
          }}
        >
          {({
            errors,
            touched,
            values,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
            setSubmitting,
            setFieldValue,
          }) => (
            <Form>
              <View style={styles.headerContent}>
                <TouchableOpacity onPress={showTimePicker}>
                  <Text style={styles.timeLabel}>
                    {time ? moment(time).format("HH:mm") : "HH:MM"}
                  </Text>
                  {show && (
                    <DateTimePicker
                      value={new Date()}
                      mode="time"
                      is24Hour={true}
                      display="default"
                      onChange={(event, selectedTime) => {
                        if (selectedTime) {
                          onChangeTime(event, selectedTime);
                          setFieldValue("time", selectedTime);
                        } else {
                          setShow(false);
                        }
                      }}
                    />
                  )}
                </TouchableOpacity>
                {errors.time && touched.time && (
                  <Item>
                    <Label style={{ color: "red" }}>{errors.time}</Label>
                  </Item>
                )}
              </View>

              <Item
                fixedLabel
                error={errors.name && touched.name ? true : false}
              >
                <Label>Name</Label>
                <Input
                  value={values.name}
                  onChangeText={handleChange("name")}
                  onBlur={handleBlur("name")}
                />
                {errors.name && touched.name && <Icon name="close-circle" />}
              </Item>
              {errors.name && touched.name && (
                <Item>
                  <Label style={{ color: "red" }}>{errors.name}</Label>
                </Item>
              )}

              <Item
                fixedLabel
                error={errors.food && touched.food ? true : false}
              >
                <Label>Food</Label>
                <Input
                  value={values.food}
                  onChangeText={handleChange("food")}
                  onBlur={handleBlur("food")}
                />
                {errors.food && touched.food && <Icon name="close-circle" />}
              </Item>
              {errors.food && touched.food && (
                <Item>
                  <Label style={{ color: "red" }}>{errors.food}</Label>
                </Item>
              )}

              <Button
                block
                large
                style={{ marginTop: 30, backgroundColor: "salmon" }}
                onPress={() => {
                  // alert(JSON.stringify(values));
                  handleSubmit();
                  // setSubmitting(false);
                }}
                // If submitted, disable button
                disabled={isSubmitting}
              >
                <Text
                  style={{ color: "white", fontSize: 20, fontWeight: "bold" }}
                >
                  Save
                </Text>
              </Button>
            </Form>
          )}
        </Formik>
      </Content>
    </Container>
  );
};

export default AddAlarmScreen;
