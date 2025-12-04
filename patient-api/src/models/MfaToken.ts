import { Table, Column, DataType, ForeignKey, BelongsTo, Index } from 'sequelize-typescript';
import Entity from './Entity';
import User from './User';

/**
 * MfaToken model for storing email OTP codes during MFA verification.
 * HIPAA Compliance: Codes expire after 5 minutes and are deleted after verification.
 */
@Table({
    freezeTableName: true,
    tableName: 'MfaTokens',
    indexes: [
        {
            unique: true,
            fields: ['mfaToken'],
            name: 'mfa_token_unique_idx'
        }
    ]
})
export default class MfaToken extends Entity {
    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare userId: string;

    @BelongsTo(() => User, 'userId')
    declare user: User;

    @Column({
        type: DataType.STRING(6),
        allowNull: false,
        comment: '6-digit OTP code',
    })
    declare code: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        comment: 'Temporary token used to identify the MFA session',
    })
    declare mfaToken: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        comment: 'When the OTP code expires (5 minutes from creation)',
    })
    declare expiresAt: Date;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether the code has been verified',
    })
    declare verified: boolean;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Number of resend attempts (max 3)',
    })
    declare resendCount: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Number of failed verification attempts (rate limiting)',
    })
    declare failedAttempts: number;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        comment: 'Email address where code was sent',
    })
    declare email: string;

    /**
     * Check if the OTP code has expired
     */
    isExpired(): boolean {
        return new Date() > this.expiresAt;
    }

    /**
     * Check if rate limited (too many failed attempts)
     */
    isRateLimited(): boolean {
        return this.failedAttempts >= 5;
    }

    /**
     * Check if can resend (max 3 resends)
     */
    canResend(): boolean {
        return this.resendCount < 3;
    }

    /**
     * Generate a new 6-digit OTP code
     */
    static generateCode(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    /**
     * Generate a secure MFA session token
     */
    static generateMfaToken(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 64; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * Get expiration time (5 minutes from now)
     */
    static getExpirationTime(): Date {
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 5);
        return expiresAt;
    }
}

