/*
  Warnings:

  - Added the required column `updatedAt` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "symplaId" TEXT,
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
INSERT INTO "new_Event" ("address", "bannerUrl", "capacity", "category", "city", "date", "description", "endDate", "features", "id", "imageUrl", "latitude", "location", "longitude", "price", "state", "title", "createdAt", "updatedAt") SELECT "address", "bannerUrl", "capacity", "category", "city", "date", "description", "endDate", "features", "id", "imageUrl", "latitude", "location", "longitude", "price", "state", "title", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE UNIQUE INDEX "Event_symplaId_key" ON "Event"("symplaId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
