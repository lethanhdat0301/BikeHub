-- CreateTable
CREATE TABLE "Dealer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "telegram" TEXT,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "total_revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "platform_fee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "current_debt" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "last_payment_date" TIMESTAMP(3),
    "vehicle_count" INTEGER NOT NULL DEFAULT 0,
    "image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dealer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Referrer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "total_earnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "referral_count" INTEGER NOT NULL DEFAULT 0,
    "last_referral_date" TIMESTAMP(3),
    "image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Referrer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Dealer_email_key" ON "Dealer"("email");
