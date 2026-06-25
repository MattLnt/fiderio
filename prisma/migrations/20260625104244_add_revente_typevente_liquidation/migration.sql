-- AlterEnum
ALTER TYPE "TypeDeal" ADD VALUE 'LIQUIDATION';

-- AlterTable
ALTER TABLE "Opportunite" ADD COLUMN     "montantRevente" TEXT,
ADD COLUMN     "typeVente" TEXT;
