import React, { useEffect, useState } from "react";
import { Button, Text, TextInput, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Card from "./ui/Card";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
//import { Category, Transaction } from "../types";

export default function AddTransaction({ insertTransaction }) {
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [categories, setCategories] = useState([]);
  const [typeSelected, setTypeSelected] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Expense");
  const [categoryId, setCategoryId] = useState(1);

  useEffect(() => {
    getExpenseType(currentTab);
  }, [currentTab]);

  async function getExpenseType(currentTab) {
    setCategory(currentTab === 0 ? "Expense" : "Income");
    const type = currentTab === 0 ? "Expense" : "Income";

    const result = await db.getAllAsync(
      `SELECT * FROM Categories WHERE type = ?;`,
      [type]
    );
    setCategories(result);
  }

  async function handleSave() {
    console.log({
      amount: Number(amount),
      description,
      category_id: categoryId,
      date: new Date().getTime() / 1000,
      type: category,
    });

    await insertTransaction({
      amount: Number(amount),
      description,
      category_id: categoryId,
      date: new Date().getTime() / 1000,
      type: category,
    });
    setAmount("");
    setDescription("");
    setCategory("Expense");
    setCategoryId(1);
    setCurrentTab(0);
    setIsAddingTransaction(false);
  }

  return (
    <View style={{ marginBottom: 15 }}>
      {isAddingTransaction ? (
        <View>
          <Card>
            <TextInput
              placeholder="$Amount"
              style={{ fontSize: 32, marginBottom: 15, fontWeight: "bold" }}
              keyboardType="numeric"
              onChangeText={(text) => {
                const numericValue = text.replace(/[^0-9.]/g, "");
                setAmount(numericValue);
              }}
              value={amount}
            />
            <TextInput
              placeholder="Description"
              style={{ marginBottom: 15 }}
              onChangeText={setDescription}
              value={description}
            />
            <Text style={{ marginBottom: 6 }}>Select an entry type</Text>
            <SegmentedControl
              values={["Expense", "Income"]}
              style={{ marginBottom: 15 }}
              selectedIndex={currentTab}
              onChange={(event) => {
                setCurrentTab(event.nativeEvent.selectedSegmentIndex);
              }}
            />
            {categories.map((cat) => (
              <CategoryButton
                key={cat.name}
                id={cat.id}
                title={cat.name}
                isSelected={typeSelected === cat.name}
                setTypeSelected={setTypeSelected}
                setCategoryId={setCategoryId}
              />
            ))}
          </Card>
          <View
            style={{ flexDirection: "row", justifyContent: "space-around" }}
          >
            <Button
              title="Cancel"
              color="red"
              onPress={() => setIsAddingTransaction(false)}
            />
            <Button title="Save" onPress={handleSave} />
          </View>
        </View>
      ) : (
        <AddButton setIsAddingTransaction={setIsAddingTransaction} />
      )}
    </View>
  );
}

function CategoryButton({
  id,
  title,
  isSelected,
  setTypeSelected,
  setCategoryId,
}) {
  return (
    <TouchableOpacity
      onPress={() => {
        setTypeSelected(title);
        setCategoryId(id);
      }}
      activeOpacity={0.6}
      style={{
        height: 40,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: isSelected ? "#007BFF20" : "#00000020",
        borderRadius: 15,
        marginBottom: 6,
      }}
    >
      <Text
        style={{
          fontWeight: "700",
          color: isSelected ? "#007BFF" : "#000000",
          marginLeft: 5,
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

function AddButton({ setIsAddingTransaction }) {
  return (
    <TouchableOpacity
      onPress={() => setIsAddingTransaction(true)}
      activeOpacity={0.6}
      style={{
        height: 40,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#007BFF20",
        borderRadius: 15,
      }}
    >
      <MaterialIcons name="add-circle-outline" size={24} color="#007BFF" />
      <Text style={{ fontWeight: "700", color: "#007BFF", marginLeft: 5 }}>
        New Entry
      </Text>
    </TouchableOpacity>
  );
}
