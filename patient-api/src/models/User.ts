import { Table, Column, DataType, ForeignKey, BelongsTo, HasMany, HasOne } from 'sequelize-typescript';
import bcrypt from 'bcrypt';
import Entity from './Entity';
import Clinic from './Clinic';
import ShippingAddress from './ShippingAddress';
import { PatientAllergy, PatientDisease, PatientMedication } from '../services/pharmacy/patient';
import BrandTreatment from './BrandTreatment';
import UserPatient from './UserPatient';
import UserTag from './UserTag';
import BrandSubscription from './BrandSubscription';
import TenantCustomFeatures from './TenantCustomFeatures';
import TenantAnalyticsEvents from './TenantAnalyticsEvents';

@Table({
  freezeTableName: true,
  tableName: 'users',
})
export default class User extends Entity {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100],
    },
  })
  declare firstName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100],
    },
  })
  declare lastName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      len: [1, 255],
    },
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare passwordHash: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare temporaryPasswordHash: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
  })
  declare dob?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    validate: {
      len: [0, 20],
    },
  })
  declare phoneNumber?: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  declare businessType?: string;

  // TODO: Deprecate this fields in favor of address relationship
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare address?: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  declare city?: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  declare state?: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
  })
  declare zipCode?: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    validate: {
      len: [0, 255],
    },
  })
  declare website?: string;

  // Plan selection fields
  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  declare selectedPlanCategory?: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  declare selectedPlanType?: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare selectedPlanName?: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  declare selectedPlanPrice?: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  declare selectedDownpaymentType?: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare selectedDownpaymentName?: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  declare selectedDownpaymentPrice?: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare planSelectionTimestamp?: Date;

  @Column({
    type: DataType.ENUM('patient', 'doctor', 'admin', 'brand'),
    allowNull: false,
    defaultValue: 'patient',
  })
  declare role: 'patient' | 'doctor' | 'admin' | 'brand';

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare lastLoginAt?: Date;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare activated: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare activationToken?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare activationTokenExpiresAt?: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare consentGivenAt?: Date;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare emailOptedOut: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare smsOptedOut: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare optOutDate?: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare emergencyContact?: string;

  // Pharmacy types:
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare pharmacyPatientId?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare mdPatientId?: string;


  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
    defaultValue: false
  })
  declare newMessages?: boolean;


  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare gender?: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  declare allergies?: PatientAllergy[];

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  declare diseases?: PatientDisease[];

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  declare medications?: PatientMedication[];

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare stripeCustomerId?: string;

  @ForeignKey(() => Clinic)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare clinicId?: string;

  @BelongsTo(() => Clinic)
  declare clinic?: Clinic;

  @HasMany(() => ShippingAddress)
  declare shippingAddresses: ShippingAddress[];

  @HasMany(() => BrandTreatment)
  declare brandTreatments: BrandTreatment[]

  @HasMany(() => UserPatient)
  declare userPatients: UserPatient[];

  @HasMany(() => UserTag)
  declare userTags: UserTag[];

  @HasMany(() => BrandSubscription)
  declare brandSubscriptions: BrandSubscription[];

  @HasOne(() => TenantCustomFeatures)
  declare tenantCustomFeatures?: TenantCustomFeatures;

  @HasMany(() => TenantAnalyticsEvents)
  declare analyticsEvents: TenantAnalyticsEvents[];

  // Instance methods
  public async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash);
  }

  /**
   * Validate either the permanent password or a temporary password if present.
   */
  public async validateAnyPassword(password: string): Promise<boolean> {
    const permanentValid = await this.validatePassword(password);
    if (permanentValid) return true;

    if (this.temporaryPasswordHash) {
      try {
        const tempValid = await bcrypt.compare(password, this.temporaryPasswordHash);
        if (tempValid) return true;
      } catch (_) {
        // ignore compare errors and fall through to false
      }
    }

    return false;
  }

  public async updateLastLogin(): Promise<void> {
    this.lastLoginAt = new Date();
    await this.save();
  }

  public async recordConsent(): Promise<void> {
    this.consentGivenAt = new Date();
    await this.save();
  }

  // Return user data without sensitive information (for API responses)
  public toSafeJSON() {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phoneNumber: this.phoneNumber,
      website: this.website,
      businessType: this.businessType,
      dob: this.dob,
      address: this.address,
      city: this.city,
      state: this.state,
      zipCode: this.zipCode,
      role: this.role,
      clinicId: this.clinicId,
      createdAt: this.createdAt,
      lastLoginAt: this.lastLoginAt,
    };
  }

  // Static methods
  public static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12; // HIPAA requires strong password hashing
    return bcrypt.hash(password, saltRounds);
  }

  public static async createUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: 'patient' | 'doctor' | 'admin' | 'brand';
    dob?: string;
    phoneNumber?: string;
    website?: string;
    businessType?: string;
  }): Promise<User> {
    const passwordHash = await this.hashPassword(userData.password);

    return this.create({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email.toLowerCase().trim(),
      passwordHash,
      role: userData.role || 'patient',
      dob: userData.dob,
      phoneNumber: userData.phoneNumber,
      website: userData.website,
      businessType: userData.businessType,
      consentGivenAt: new Date(), // Record consent when user signs up
    });
  }

  public static async findByEmail(email: string): Promise<User | null> {
    return this.findOne({
      where: { email: email.toLowerCase().trim() }
    });
  }

  /**
   * Generate and set activation token for email verification
   */
  public generateActivationToken(): string {
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');

    this.activationToken = token;
    // Token expires in 24 hours
    this.activationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    return token;
  }

  /**
   * Activate user account
   */
  public async activate(): Promise<void> {
    this.activated = true;
    this.activationToken = undefined;
    this.activationTokenExpiresAt = undefined;
    await this.save();
  }

  /**
   * Check if activation token is valid and not expired
   */
  public isActivationTokenValid(token: string): boolean {
    if (!this.activationToken || !this.activationTokenExpiresAt) {
      return false;
    }

    return this.activationToken === token && this.activationTokenExpiresAt > new Date();
  }
}