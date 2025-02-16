-- CreateTable
CREATE TABLE "Wana" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "userName" TEXT,
    "password" TEXT,
    "role" TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wana_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeseretawiDirijet" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "userName" TEXT,
    "password" TEXT,
    "role" TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeseretawiDirijet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hiwas" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "userName" TEXT,
    "password" TEXT,
    "role" TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "mdId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hiwas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wereda" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "userName" TEXT,
    "password" TEXT,
    "role" TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wereda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schedule" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "createdByRole" TEXT NOT NULL,
    "createdById" INTEGER NOT NULL,
    "createdByHiwasId" INTEGER,
    "createdByMDId" INTEGER,
    "createdByWeredaId" INTEGER,
    "createdByWanaId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "reportedBy" TEXT NOT NULL,
    "reportedByHiwasId" INTEGER,
    "month" TEXT,
    "presentEmployees" TEXT,
    "absentEmployees" TEXT,
    "reportedByMDId" INTEGER,
    "reportedByWeredaId" INTEGER,
    "scheduleId" INTEGER NOT NULL,
    "reportVideo" TEXT,
    "audio" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportImage" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "reportId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportPdf" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "reportId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportPdf_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "recipientId" INTEGER,
    "recipientType" TEXT NOT NULL,
    "scheduleId" INTEGER,
    "reportId" INTEGER,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "hiwasId" INTEGER,
    "meseretawiDirijetId" INTEGER,
    "weredaId" INTEGER,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Wana_email_key" ON "Wana"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Wana_phone_key" ON "Wana"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Wana_userName_key" ON "Wana"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "MeseretawiDirijet_email_key" ON "MeseretawiDirijet"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MeseretawiDirijet_phone_key" ON "MeseretawiDirijet"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "MeseretawiDirijet_userName_key" ON "MeseretawiDirijet"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "Hiwas_email_key" ON "Hiwas"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Hiwas_phone_key" ON "Hiwas"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Hiwas_userName_key" ON "Hiwas"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "Wereda_email_key" ON "Wereda"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Wereda_phone_key" ON "Wereda"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Wereda_userName_key" ON "Wereda"("userName");

-- AddForeignKey
ALTER TABLE "Hiwas" ADD CONSTRAINT "Hiwas_mdId_fkey" FOREIGN KEY ("mdId") REFERENCES "MeseretawiDirijet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_createdByHiwasId_fkey" FOREIGN KEY ("createdByHiwasId") REFERENCES "Hiwas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_createdByMDId_fkey" FOREIGN KEY ("createdByMDId") REFERENCES "MeseretawiDirijet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_createdByWeredaId_fkey" FOREIGN KEY ("createdByWeredaId") REFERENCES "Wereda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_createdByWanaId_fkey" FOREIGN KEY ("createdByWanaId") REFERENCES "Wana"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reportedByHiwasId_fkey" FOREIGN KEY ("reportedByHiwasId") REFERENCES "Hiwas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reportedByMDId_fkey" FOREIGN KEY ("reportedByMDId") REFERENCES "MeseretawiDirijet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reportedByWeredaId_fkey" FOREIGN KEY ("reportedByWeredaId") REFERENCES "Wereda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportImage" ADD CONSTRAINT "ReportImage_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportPdf" ADD CONSTRAINT "ReportPdf_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_hiwasId_fkey" FOREIGN KEY ("hiwasId") REFERENCES "Hiwas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_meseretawiDirijetId_fkey" FOREIGN KEY ("meseretawiDirijetId") REFERENCES "MeseretawiDirijet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_weredaId_fkey" FOREIGN KEY ("weredaId") REFERENCES "Wereda"("id") ON DELETE CASCADE ON UPDATE CASCADE;
