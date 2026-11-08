-- CreateTable
CREATE TABLE "IncomingPayment" (
    "id" TEXT NOT NULL,
    "transId" TEXT NOT NULL,
    "transTime" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "billRef" TEXT,
    "msisdn" TEXT,
    "payerName" TEXT,
    "businessShortCode" TEXT,
    "status" TEXT NOT NULL DEFAULT 'UNAPPLIED',
    "appliedInvoiceId" TEXT,
    "appliedAt" TIMESTAMP(3),
    "raw" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IncomingPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IncomingPayment_transId_key" ON "IncomingPayment"("transId");

-- CreateIndex
CREATE INDEX "IncomingPayment_status_createdAt_idx" ON "IncomingPayment"("status", "createdAt");
