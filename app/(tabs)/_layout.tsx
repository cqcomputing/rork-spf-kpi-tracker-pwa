import { Tabs } from "expo-router";
import { BarChart3, ClipboardList, Award } from "lucide-react-native";
import React from "react";
import Colors from "@/constants/colors";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "expo-router";

export default function TabLayout() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  
  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);
  
  // Don't render tabs if not authenticated
  if (!isAuthenticated) {
    return null;
  }
  
  const isAdmin = user?.role === "admin";
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.gray.medium,
        tabBarStyle: {
          backgroundColor: Colors.primary,
          borderTopColor: Colors.gray.darkest,
        },
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTitleStyle: {
          color: Colors.secondary,
        },
        headerTintColor: Colors.accent,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => <BarChart3 color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="log-kpis"
        options={{
          title: "Log KPIs",
          tabBarIcon: ({ color }) => <ClipboardList color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Leaderboard",
          tabBarIcon: ({ color }) => <Award color={color} />,
          headerShown: false,
          href: isAdmin ? "/leaderboard" : null,
        }}
      />
    </Tabs>
  );
}