import bcrypt from 'bcryptjs';
import { User } from '../models/User';

export const seedAdminUser = async (): Promise<void> => {
  try {
    const adminEmail = 'admin@linkforge.io';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('AdminPassword123!', 10);
      await User.create({
        name: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        isSuspended: false,
      });
      console.log(`[Seed] Created default Admin account: ${adminEmail} / AdminPassword123!`);
    } else {
      let needsSave = false;
      if (existingAdmin.name !== 'Admin') {
        existingAdmin.name = 'Admin';
        needsSave = true;
      }
      if (existingAdmin.role !== 'admin' || !existingAdmin.isVerified) {
        existingAdmin.role = 'admin';
        existingAdmin.isVerified = true;
        needsSave = true;
      }
      if (needsSave) {
        await existingAdmin.save();
      }
      console.log(`[Seed] Admin account ready: ${adminEmail}`);
    }
  } catch (error) {
    console.error(`[Seed] Failed to seed admin user: ${(error as Error).message}`);
  }
};
