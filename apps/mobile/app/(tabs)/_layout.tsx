import { Text } from "react-native";
import { Tabs } from "expo-router";
import { colors } from "../../lib/theme";

function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 20 }}>{emoji}</Text>;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.brand[600],
        tabBarInactiveTintColor: colors.gray[400],
        tabBarStyle: {
          borderTopColor: colors.gray[200],
          backgroundColor: colors.white,
        },
        headerStyle: { backgroundColor: colors.white },
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: () => <TabIcon emoji="📊" />,
          headerTitle: "CofounderAI",
        }}
      />
      <Tabs.Screen
        name="new-decision"
        options={{
          title: "New",
          tabBarIcon: () => <TabIcon emoji="💡" />,
          headerTitle: "New Decision",
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: "Journal",
          tabBarIcon: () => <TabIcon emoji="📓" />,
          headerTitle: "Decision Journal",
        }}
      />
      <Tabs.Screen
        name="metrics"
        options={{
          title: "Metrics",
          tabBarIcon: () => <TabIcon emoji="📈" />,
          headerTitle: "Metrics",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: () => <TabIcon emoji="👤" />,
          headerTitle: "Profile",
        }}
      />
    </Tabs>
  );
}
