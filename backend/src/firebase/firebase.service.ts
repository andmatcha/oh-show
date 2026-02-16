import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private app!: admin.app.App;

  onModuleInit() {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (
      !process.env.FIREBASE_PROJECT_ID ||
      !process.env.FIREBASE_CLIENT_EMAIL ||
      !privateKey
    ) {
      throw new Error(
        'Firebase configuration is missing. Please check your .env file.',
      );
    }

    this.app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
  }

  async verifyToken(token: string): Promise<admin.auth.DecodedIdToken> {
    try {
      return await this.app.auth().verifyIdToken(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async createUser(email: string, displayName?: string): Promise<admin.auth.UserRecord> {
    try {
      return await this.app.auth().createUser({
        email,
        displayName: displayName || email,
        emailVerified: false,
      });
    } catch (error: any) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async generatePasswordResetLink(email: string): Promise<string> {
    try {
      const actionCodeSettings = {
        url: `${process.env.FRONTEND_URL}/signup`,
        handleCodeInApp: false,
      };
      return await this.app.auth().generatePasswordResetLink(email, actionCodeSettings);
    } catch (error: any) {
      throw new Error(`Failed to generate password reset link: ${error.message}`);
    }
  }

  getAuth(): admin.auth.Auth {
    return this.app.auth();
  }
}
