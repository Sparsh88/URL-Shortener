import bcrypt from 'bcryptjs';
import { User } from '../models/User';

export const seedAdminUser = async (): Promise<void> => {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'sparshchauhan050@gmail.com').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Sp@080806';

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      await User.create({
        name: 'Sparsh Chauhan',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        isSuspended: false,
      });
      console.log(`[Seed] Initialized Primary Admin account (${adminEmail})`);
    } else {
      existingAdmin.name = existingAdmin.name || 'Sparsh Chauhan';
      existingAdmin.password = hashedPassword;
      existingAdmin.role = 'admin';
      existingAdmin.isVerified = true;
      existingAdmin.isSuspended = false;
      await existingAdmin.save();
      console.log(`[Seed] Primary Admin account credentials verified and synchronized (${adminEmail})`);
    }

    // Ensure NO OTHER user in the database has admin privileges
    const downgradedResult = await User.updateMany(
      { email: { $ne: adminEmail }, role: 'admin' },
      { $set: { role: 'user' } }
    );

    if (downgradedResult.modifiedCount > 0) {
      console.log(`[Seed] Downgraded ${downgradedResult.modifiedCount} unauthorized admin accounts to regular user`);
    }

    // Clean up old demo admin account if present
    if (adminEmail !== 'admin@linkforge.io') {
      await User.deleteOne({ email: 'admin@linkforge.io' });
    }
  } catch (error) {
    console.error(`[Seed] Admin initialization log: ${(error as Error).message}`);
  }
};

