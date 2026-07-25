import bcrypt from 'bcryptjs';
import { User } from '../models/User';

export const seedAdminUser = async (): Promise<void> => {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@linkforge.io').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        isSuspended: false,
      });
      console.log(`[Seed] Initialized Admin account (${adminEmail})`);
    } else {
      let needsSave = false;
      if (existingAdmin.role !== 'admin' || !existingAdmin.isVerified) {
        existingAdmin.role = 'admin';
        existingAdmin.isVerified = true;
        needsSave = true;
      }
      if (needsSave) {
        await existingAdmin.save();
      }
      console.log(`[Seed] Admin account ready (${adminEmail})`);
    }
  } catch (error) {
    console.error(`[Seed] Admin initialization log: ${(error as Error).message}`);
  }
};
