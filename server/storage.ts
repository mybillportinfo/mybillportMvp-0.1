import { type User, type InsertUser, type Bill, type InsertBill, type Payment, type InsertPayment, type Reward, type InsertReward, users, bills, payments, rewards } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Bill operations
  getBillsByUserId(userId: string): Promise<Bill[]>;
  getBill(id: string): Promise<Bill | undefined>;
  createBill(bill: InsertBill): Promise<Bill>;
  updateBill(id: string, updates: Partial<Bill>): Promise<Bill | undefined>;
  deleteBill(id: string): Promise<boolean>;
  markBillAsPaid(billId: string): Promise<Bill | undefined>;
  updateBillStatus(billId: string, status: 'paid' | 'pending' | 'overdue'): Promise<Bill | undefined>;
  
  // Payment operations
  getPaymentsByUserId(userId: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  
  // Reward operations
  getRewardsByUserId(userId: string): Promise<Reward[]>;
  createReward(reward: InsertReward): Promise<Reward>;
  updateReward(id: string, updates: Partial<Reward>): Promise<Reward | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getBillsByUserId(userId: string): Promise<Bill[]> {
    return await db.select().from(bills).where(eq(bills.userId, userId));
  }

  async getBill(id: string): Promise<Bill | undefined> {
    const [bill] = await db.select().from(bills).where(eq(bills.id, id));
    return bill || undefined;
  }

  async createBill(insertBill: InsertBill): Promise<Bill> {
    // Ensure priority is properly typed
    const validatedBill = {
      ...insertBill,
      priority: insertBill.priority as "urgent" | "medium" | "low"
    };
    const [bill] = await db
      .insert(bills)
      .values(validatedBill)
      .returning();
    return bill;
  }

  async updateBill(id: string, updates: Partial<Bill>): Promise<Bill | undefined> {
    const [bill] = await db
      .update(bills)
      .set(updates)
      .where(eq(bills.id, id))
      .returning();
    return bill || undefined;
  }

  async markBillAsPaid(billId: string): Promise<Bill | undefined> {
    const [bill] = await db
      .update(bills)
      .set({ isPaid: 1 })
      .where(eq(bills.id, billId))
      .returning();
    return bill || undefined;
  }

  async deleteBill(id: string): Promise<boolean> {
    const result = await db.delete(bills).where(eq(bills.id, id)).returning();
    return result.length > 0;
  }

  async getPaymentsByUserId(userId: string): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.userId, userId));
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    // Ensure status is properly typed
    const validatedPayment = {
      ...insertPayment,
      status: insertPayment.status as "pending" | "completed" | "failed"
    };
    const [payment] = await db
      .insert(payments)
      .values(validatedPayment)
      .returning();
    return payment;
  }

  async getRewardsByUserId(userId: string): Promise<Reward[]> {
    return await db.select().from(rewards).where(eq(rewards.userId, userId));
  }

  async createReward(insertReward: InsertReward): Promise<Reward> {
    const [reward] = await db
      .insert(rewards)
      .values(insertReward)
      .returning();
    return reward;
  }

  async updateReward(id: string, updates: Partial<Reward>): Promise<Reward | undefined> {
    const [reward] = await db
      .update(rewards)
      .set(updates)
      .where(eq(rewards.id, id))
      .returning();
    return reward || undefined;
  }

  async updateBillStatus(billId: string, status: 'paid' | 'pending' | 'overdue'): Promise<Bill | undefined> {
    const [bill] = await db
      .update(bills)
      .set({ isPaid: status === 'paid' ? 1 : 0 })
      .where(eq(bills.id, billId))
      .returning();
    return bill || undefined;
  }
}

// In-memory storage implementation for fallback
export class MemoryStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private usersByUsername: Map<string, User> = new Map();
  private billsByUser: Map<string, Bill[]> = new Map();
  private billsById: Map<string, Bill> = new Map();
  private paymentsByUser: Map<string, Payment[]> = new Map();
  private rewardsByUser: Map<string, Reward[]> = new Map();
  private rewardsById: Map<string, Reward> = new Map();

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.usersByUsername.get(username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: Date.now().toString(),
      ...insertUser
    };
    this.users.set(user.id, user);
    this.usersByUsername.set(user.username, user);
    return user;
  }

  async getBillsByUserId(userId: string): Promise<Bill[]> {
    return this.billsByUser.get(userId) || [];
  }

  async getBill(id: string): Promise<Bill | undefined> {
    return this.billsById.get(id);
  }

  async createBill(insertBill: InsertBill): Promise<Bill> {
    const bill: Bill = {
      id: Date.now().toString(),
      ...insertBill,
      priority: insertBill.priority as "urgent" | "medium" | "low",
      createdAt: new Date(),
      isPaid: insertBill.isPaid ?? 0
    };
    
    this.billsById.set(bill.id, bill);
    const userBills = this.billsByUser.get(bill.userId) || [];
    userBills.push(bill);
    this.billsByUser.set(bill.userId, userBills);
    
    return bill;
  }

  async updateBill(id: string, updates: Partial<Bill>): Promise<Bill | undefined> {
    const existingBill = this.billsById.get(id);
    if (!existingBill) return undefined;

    const updatedBill = { ...existingBill, ...updates };
    this.billsById.set(id, updatedBill);
    
    // Update in user's bill list
    const userBills = this.billsByUser.get(existingBill.userId) || [];
    const index = userBills.findIndex(b => b.id === id);
    if (index >= 0) {
      userBills[index] = updatedBill;
      this.billsByUser.set(existingBill.userId, userBills);
    }
    
    return updatedBill;
  }

  async markBillAsPaid(billId: string): Promise<Bill | undefined> {
    return this.updateBill(billId, { isPaid: 1 });
  }

  async deleteBill(id: string): Promise<boolean> {
    const bill = this.billsById.get(id);
    if (!bill) return false;
    
    this.billsById.delete(id);
    const userBills = this.billsByUser.get(bill.userId) || [];
    const filtered = userBills.filter(b => b.id !== id);
    this.billsByUser.set(bill.userId, filtered);
    
    return true;
  }

  async getPaymentsByUserId(userId: string): Promise<Payment[]> {
    return this.paymentsByUser.get(userId) || [];
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const payment: Payment = {
      id: Date.now().toString(),
      ...insertPayment,
      status: insertPayment.status as "pending" | "completed" | "failed",
      paymentDate: new Date()
    };
    
    const userPayments = this.paymentsByUser.get(payment.userId) || [];
    userPayments.push(payment);
    this.paymentsByUser.set(payment.userId, userPayments);
    
    return payment;
  }

  async getRewardsByUserId(userId: string): Promise<Reward[]> {
    return this.rewardsByUser.get(userId) || [];
  }

  async createReward(insertReward: InsertReward): Promise<Reward> {
    const reward: Reward = {
      id: Date.now().toString(),
      ...insertReward,
      createdAt: new Date(),
      points: insertReward.points ?? 0,
      description: insertReward.description ?? null,
      isRedeemed: insertReward.isRedeemed ?? 0
    };
    
    this.rewardsById.set(reward.id, reward);
    const userRewards = this.rewardsByUser.get(reward.userId) || [];
    userRewards.push(reward);
    this.rewardsByUser.set(reward.userId, userRewards);
    
    return reward;
  }

  async updateReward(id: string, updates: Partial<Reward>): Promise<Reward | undefined> {
    const existingReward = this.rewardsById.get(id);
    if (!existingReward) return undefined;

    const updatedReward = { ...existingReward, ...updates };
    this.rewardsById.set(id, updatedReward);
    
    // Update in user's reward list
    const userRewards = this.rewardsByUser.get(existingReward.userId) || [];
    const index = userRewards.findIndex(r => r.id === id);
    if (index >= 0) {
      userRewards[index] = updatedReward;
      this.rewardsByUser.set(existingReward.userId, userRewards);
    }
    
    return updatedReward;
  }

  async updateBillStatus(billId: string, status: 'paid' | 'pending' | 'overdue'): Promise<Bill | undefined> {
    return this.updateBill(billId, { isPaid: status === 'paid' ? 1 : 0 });
  }
}

// Auto-detect storage: use memory fallback if database is unavailable
async function createStorage(): Promise<IStorage> {
  try {
    // Test database connection
    const testStorage = new DatabaseStorage();
    await testStorage.getBillsByUserId("test-connection");
    console.log("✅ Database connection successful - using DatabaseStorage");
    return testStorage;
  } catch (error) {
    console.log("⚠️ Database unavailable - using MemoryStorage fallback");
    return new MemoryStorage();
  }
}

// Export a storage instance based on configuration  
export let storage: IStorage;

// Initialize storage on startup
export async function initializeStorage(): Promise<void> {
  storage = await createStorage();
}
