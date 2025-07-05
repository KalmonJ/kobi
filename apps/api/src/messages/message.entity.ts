import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

export enum FunnelStatus {
  NEW_LEAD = "NEW_LEAD",
  QUALIFIED = "QUALIFIED",
  CONTACTED = "CONTACTED",
  OPPORTUNITY = "OPPORTUNITY",
  PROPOSAL_SENT = "PROPOSAL_SENT",
  NEGOTIATION = "NEGOTIATION",
  CLOSED_WON = "CLOSED_WON",
  CLOSED_LOST = "CLOSED_LOST",
}

export type FunnelStage = `${FunnelStatus}`;

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @Column({
    type: "enum",
    enum: FunnelStatus,
    default: FunnelStatus.NEW_LEAD,
  })
  status: FunnelStatus;
}
