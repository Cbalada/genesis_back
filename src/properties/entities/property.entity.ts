import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PropertyStatus, PropertyType } from '../../common/enums';
import { User } from '../../users/entities/user.entity';
import { PropertyImage } from './property-image.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Favorite } from '../../favorites/entities/favorite.entity';

@Entity('properties')
@Index(['city'])
@Index(['country'])
@Index(['propertyType'])
@Index(['status'])
@Index(['hostId'])
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'host_id', type: 'uuid' })
  hostId!: string;

  @ManyToOne(() => User, (user) => user.properties, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'host_id' })
  host!: User;

  @Column({ length: 200 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ name: 'property_type', type: 'enum', enum: PropertyType })
  propertyType!: PropertyType;

  @Column({ length: 100 })
  city!: string;

  @Column({ length: 100 })
  country!: string;

  @Column({ length: 300 })
  address!: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude!: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude!: number | null;

  @Column({
    name: 'price_per_night',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  pricePerNight!: number;

  @Column({ name: 'max_guests', type: 'int' })
  maxGuests!: number;

  @Column({ type: 'int', default: 0 })
  bedrooms!: number;

  @Column({ type: 'int', default: 0 })
  bathrooms!: number;

  @Column({ type: 'enum', enum: PropertyStatus, default: PropertyStatus.ACTIVE })
  status!: PropertyStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => PropertyImage, (image) => image.property)
  images!: PropertyImage[];

  @OneToMany(() => Booking, (booking) => booking.property)
  bookings!: Booking[];

  @OneToMany(() => Review, (review) => review.property)
  reviews!: Review[];

  @OneToMany(() => Favorite, (favorite) => favorite.property)
  favorites!: Favorite[];
}
