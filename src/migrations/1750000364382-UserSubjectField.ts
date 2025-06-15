import { MigrationInterface, QueryRunner } from "typeorm";

export class UserSubjectField1750000364382 implements MigrationInterface {
    name = 'UserSubjectField1750000364382'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "subject" character varying(100)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "subject"`);
    }

}
