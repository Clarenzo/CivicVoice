-- DropForeignKey
ALTER TABLE "complaint_status_history" DROP CONSTRAINT "complaint_status_history_changed_by_id_fkey";

-- AlterTable
ALTER TABLE "complaint_status_history" ALTER COLUMN "changed_by_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "complaint_status_history" ADD CONSTRAINT "complaint_status_history_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
