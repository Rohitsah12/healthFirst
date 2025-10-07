-- AlterTable
ALTER TABLE "Visit" ADD COLUMN     "checkInTime" TIMESTAMP(3),
ADD COLUMN     "completeTime" TIMESTAMP(3),
ADD COLUMN     "withDoctorTime" TIMESTAMP(3);
