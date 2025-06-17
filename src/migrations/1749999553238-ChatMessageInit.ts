import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChatMessageInit1749999553238 implements MigrationInterface {
  name = 'ChatMessageInit1749999553238';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."chat_messages_type_enum" AS ENUM('GUILD', 'FRIEND')`,
    );
    await queryRunner.query(
      `CREATE TABLE "chat_messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."chat_messages_type_enum" NOT NULL, "guildId" character varying, "friendId" character varying, "senderId" character varying NOT NULL, "content" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_40c55ee0e571e268b0d3cd37d10" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "chat_messages"`);
    await queryRunner.query(`DROP TYPE "public"."chat_messages_type_enum"`);
  }
}
