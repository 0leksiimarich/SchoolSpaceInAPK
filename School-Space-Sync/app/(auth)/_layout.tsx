import { Stack } from "expo-router";
import Colors from "@/constants/colors";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackButtonDisplayMode: "minimal",
        headerStyle: { backgroundColor: Colors.bg },
        headerTintColor: Colors.accent,
        contentStyle: { backgroundColor: Colors.bg },
      }}
    >
      <Stack.Screen name="login" options={{ title: "Вхід", headerShown: false }} />
      <Stack.Screen name="register" options={{ title: "Реєстрація" }} />
    </Stack>
  );
}
