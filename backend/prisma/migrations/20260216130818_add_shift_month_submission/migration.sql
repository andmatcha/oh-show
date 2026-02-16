-- CreateTable
CREATE TABLE "shift_month_submissions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "shift_month_id" TEXT NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shift_month_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shift_month_submissions_user_id_shift_month_id_key" ON "shift_month_submissions"("user_id", "shift_month_id");

-- AddForeignKey
ALTER TABLE "shift_month_submissions" ADD CONSTRAINT "shift_month_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_month_submissions" ADD CONSTRAINT "shift_month_submissions_shift_month_id_fkey" FOREIGN KEY ("shift_month_id") REFERENCES "shift_months"("id") ON DELETE CASCADE ON UPDATE CASCADE;
