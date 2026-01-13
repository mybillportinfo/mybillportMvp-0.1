import { storage } from "./storage";

export async function seedDatabase(): Promise<string | null> {
  try {
    // Check if demo user already exists
    const existingUser = await storage.getUserByUsername("johndoe");
    if (existingUser) {
      console.log("Database already seeded, skipping...");
      return null;
    }

    console.log("Seeding database with demo data...");

    // Create demo user
    const demoUser = await storage.createUser({
      username: "johndoe",
      password: "demo123",
      name: "John Doe"
    });

    const userId = demoUser.id;

    // Create demo bills with Canadian utilities
    await storage.createBill({
      userId,
      name: "Hydro One",
      company: "Hydro One Networks",
      amount: "187.45",
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      priority: "urgent",
      icon: "fas fa-bolt",
      isPaid: 0,
    });

    await storage.createBill({
      userId,
      name: "Enbridge Gas",
      company: "Enbridge Gas Distribution",
      amount: "156.80",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      priority: "urgent",
      icon: "fas fa-fire",
      isPaid: 0,
    });

    await storage.createBill({
      userId,
      name: "Rogers Wireless",
      company: "Rogers Communications",
      amount: "125.00",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      priority: "medium",
      icon: "fas fa-phone",
      isPaid: 0,
    });

    await storage.createBill({
      userId,
      name: "Bell Internet",
      company: "Bell Canada",
      amount: "99.99",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      priority: "medium",
      icon: "fas fa-wifi",
      isPaid: 0,
    });

    await storage.createBill({
      userId,
      name: "Netflix",
      company: "Netflix Canada",
      amount: "22.99",
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      priority: "low",
      icon: "fas fa-tv",
      isPaid: 0,
    });

    await storage.createBill({
      userId,
      name: "Toronto Hydro",
      company: "Toronto Hydro Electric",
      amount: "142.30",
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      priority: "medium",
      icon: "fas fa-bolt",
      isPaid: 0,
    });

    // Create demo rewards
    await storage.createReward({
      userId,
      points: 250,
      title: "On-time Payment Bonus",
      description: "Earned for paying 5 bills on time",
      isRedeemed: 0,
    });

    await storage.createReward({
      userId,
      points: 100,
      title: "First Payment",
      description: "Welcome bonus for first payment",
      isRedeemed: 0,
    });

    console.log("Database seeded successfully with Canadian utilities!");
    return userId;
  } catch (error) {
    console.error("Seeding error:", error);
    return null;
  }
}
