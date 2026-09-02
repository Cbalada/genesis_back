import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Property } from './property.entity';

@Entity('property_images')
@Index(['propertyId'])
export class PropertyImage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'property_id', type: 'uuid' })
  propertyId!: string;

  @ManyToOne(() => Property, (property) => property.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'property_id' })
  property!: Property;

  @Column({ name: 'image_url', length: 500 })
  imageUrl!: string;

  @Column({ name: 'is_cover', default: false })
  isCover!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
