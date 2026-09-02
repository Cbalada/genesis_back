import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BookingStatus } from '../../common/enums';
import { User } from '../../users/entities/user.entity';
import { Property } from '../../properties/entities/property.entity';
import { Review } from '../../reviews/entities/review.entity';

@Entity('bookings')
@Index(['propertyId'])
@Index(['guestId'])
@Index(['checkIn', 'checkOut'])
@Index(['status'])
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'property_id', type: 'uuid' })
  propertyId!: string;

  @ManyToOne(() => Property, (property) => property.bookings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'property_id' })
  property!: Property;

  @Column({ name: 'guest_id', type: 'uuid' })
  guestId!: string;

  @ManyToOne(() => User, (user) => user.bookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guest_id' })
  guest!: User;

  @Column({ name: 'check_in', type: 'date' })
  checkIn!: string;

  @Column({ name: 'check_out', type: 'date' })
  checkOut!: string;

  @Column({ type: 'int' })
  guests!: number;

  @Column({ name: 'total_price', type: 'decimal', precision: 10, scale: 2 })
  totalPrice!: number;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.CONFIRMED })
  status!: BookingStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToOne(() => Review, (review) => review.booking)
  review!: Review;
}
