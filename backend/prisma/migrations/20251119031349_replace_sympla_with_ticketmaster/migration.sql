/*
  Warnings:

  - You are about to drop the column `symplaId` on the `Event` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ticketmasterId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "endDate" DATETIME,
    "imageUrl" TEXT,
    "bannerUrl" TEXT,
    "price" REAL NOT NULL,
    "location" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "features" TEXT NOT NULL,
    "latitude" REAL,
    "longitude" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Event" ("address", "bannerUrl", "capacity", "category", "city", "createdAt", "date", "description", "endDate", "features", "id", "imageUrl", "latitude", "location", "longitude", "price", "state", "title", "updatedAt") SELECT "address", "bannerUrl", "capacity", "category", "city", "createdAt", "date", "description", "endDate", "features", "id", "imageUrl", "latitude", "location", "longitude", "price", "state", "title", "updatedAt" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE UNIQUE INDEX "Event_ticketmasterId_key" ON "Event"("ticketmasterId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
