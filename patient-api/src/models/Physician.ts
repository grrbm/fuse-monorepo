import { Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Entity from './Entity';

export interface PhysicianLicense {
    state: string;
    number: string;
    type: string;
    expires_on: string;
}

@Table({
    freezeTableName: true,
})
export default class Physician extends Entity {
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare firstName: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare middleName: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare lastName: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare phoneNumber: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    declare email: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare street: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare street2: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare city: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare state: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare zip: string;

    @Column({
        type: DataType.JSONB,
        allowNull: false,
        defaultValue: [],
    })
    declare licenses: PhysicianLicense[];

    @Column({
        type: DataType.STRING,
        allowNull: true,
        unique: true,
    })
    declare pharmacyPhysicianId: string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    })
    declare active: boolean;

    @Column({
        type: DataType.STRING,
        allowNull: true,
      })
      declare mdPhysicianId?: string;

    // Helper method to get full name
    get fullName(): string {
        const middle = this.middleName ? ` ${this.middleName}` : '';
        return `${this.firstName}${middle} ${this.lastName}`;
    }

    // Helper method to get formatted name for pharmacy API
    get firstAndLastName(): string {
        return `${this.firstName} ${this.lastName}`;
    }

    // Helper method to get first letter of last name
    get firstLetterOfLastName(): string {
        return this.lastName.charAt(0).toUpperCase();
    }

    // Method to convert to pharmacy API format
    toPharmacyFormat() {
        return {
            first_name: this.firstName,
            middle_name: this.middleName || undefined,
            last_name: this.lastName,
            phone_number: this.phoneNumber.replace(/[^0-9]/g, ''), // Remove formatting
            email: this.email,
            street: this.street,
            street_2: this.street2 || undefined,
            city: this.city,
            state: this.state,
            zip: this.zip,
            licenses: this.licenses
        };
    }

    // Method to check if licenses are valid/not expired
    hasValidLicenses(): boolean {
        if (!this.licenses || this.licenses.length === 0) {
            return false;
        }

        const now = new Date();
        return this.licenses.some(license => {
            const expiresOn = new Date(license.expires_on);
            return expiresOn > now;
        });
    }
}