import { Table, Column, DataType, HasMany, BeforeValidate } from 'sequelize-typescript';
import Entity from './Entity';
import PharmacyProduct from './PharmacyProduct';
import PharmacyCoverage from './PharmacyCoverage';

export enum USState {
    AL = 'AL', AK = 'AK', AZ = 'AZ', AR = 'AR', CA = 'CA',
    CO = 'CO', CT = 'CT', DE = 'DE', FL = 'FL', GA = 'GA',
    HI = 'HI', ID = 'ID', IL = 'IL', IN = 'IN', IA = 'IA',
    KS = 'KS', KY = 'KY', LA = 'LA', ME = 'ME', MD = 'MD',
    MA = 'MA', MI = 'MI', MN = 'MN', MS = 'MS', MO = 'MO',
    MT = 'MT', NE = 'NE', NV = 'NV', NH = 'NH', NJ = 'NJ',
    NM = 'NM', NY = 'NY', NC = 'NC', ND = 'ND', OH = 'OH',
    OK = 'OK', OR = 'OR', PA = 'PA', RI = 'RI', SC = 'SC',
    SD = 'SD', TN = 'TN', TX = 'TX', UT = 'UT', VT = 'VT',
    VA = 'VA', WA = 'WA', WV = 'WV', WI = 'WI', WY = 'WY',
    DC = 'DC'
}

@Table({
    freezeTableName: true,
    tableName: 'Pharmacy'
})
export default class Pharmacy extends Entity {
    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    declare name: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    declare slug: string;

    @Column({
        type: DataType.ARRAY(DataType.STRING),
        allowNull: false,
        defaultValue: [],
    })
    declare supportedStates: string[]; // Array of US state codes

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare apiBaseUrl?: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    declare description?: string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    })
    declare isActive: boolean;

    @HasMany(() => PharmacyProduct)
    declare pharmacyProducts: PharmacyProduct[];

    @HasMany(() => PharmacyCoverage)
    declare pharmacyCoverages: PharmacyCoverage[];

    // Auto-generate slug from name if not provided
    @BeforeValidate
    static ensureSlug(instance: Pharmacy) {
        if (!instance.slug && instance.name) {
            instance.slug = instance.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
        }
    }
}

