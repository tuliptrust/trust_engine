import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm'

@Entity()
export class Snapshot {
  @PrimaryGeneratedColumn()
  id!: number

  @Column('text')
  submitter!: string

  @Column('text', { nullable: true })
  label!: string | null

  @Column('text', { nullable: true })
  gitRef!: string | null

  @Column('text')
  commitHash!: string

  @CreateDateColumn()
  createdAt!: Date

  @Column('text')
  folder!: string
}