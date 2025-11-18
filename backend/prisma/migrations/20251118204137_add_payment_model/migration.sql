-- CreateTable
CREATE TABLE "Payment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "method" TEXT NOT NULL,
    "totalAmount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentData" TEXT NOT NULL,
    "pixCode" TEXT,
    "ticketDetails" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Hall" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "cinemaId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    "isAccessible" BOOLEAN NOT NULL DEFAULT true,
    "hasLoveseats" BOOLEAN NOT NULL DEFAULT false,
    "capacity" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "description" TEXT,
    "features" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Hall_cinemaId_fkey" FOREIGN KEY ("cinemaId") REFERENCES "Cinema" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Hall_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "HallTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Hall" ("capacity", "cinemaId", "createdAt", "description", "features", "hasLoveseats", "id", "isAccessible", "name", "status", "templateId", "updatedAt") SELECT "capacity", "cinemaId", "createdAt", "description", "features", "hasLoveseats", "id", "isAccessible", "name", "status", "templateId", "updatedAt" FROM "Hall";
DROP TABLE "Hall";
ALTER TABLE "new_Hall" RENAME TO "Hall";
CREATE TABLE "new_HallTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "layout" TEXT NOT NULL,
    "rowCount" INTEGER NOT NULL,
    "seatsPerRow" INTEGER NOT NULL,
    "features" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_HallTemplate" ("createdAt", "features", "id", "layout", "name", "rowCount", "seatsPerRow", "type", "updatedAt") SELECT "createdAt", "features", "id", "layout", "name", "rowCount", "seatsPerRow", "type", "updatedAt" FROM "HallTemplate";
DROP TABLE "HallTemplate";
ALTER TABLE "new_HallTemplate" RENAME TO "HallTemplate";
CREATE TABLE "new_Movie" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tmdbId" INTEGER,
    "title" TEXT NOT NULL,
    "synopsis" TEXT,
    "duration" INTEGER NOT NULL,
    "rating" TEXT,
    "imageUrl" TEXT,
    "posterPath" TEXT,
    "backdropPath" TEXT,
    "trailerUrl" TEXT,
    "releaseDate" DATETIME,
    "genres" TEXT,
    "voteAverage" REAL,
    "voteCount" INTEGER,
    "originalLanguage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Movie" ("backdropPath", "createdAt", "duration", "genres", "id", "imageUrl", "originalLanguage", "posterPath", "rating", "releaseDate", "synopsis", "title", "tmdbId", "trailerUrl", "updatedAt", "voteAverage", "voteCount") SELECT "backdropPath", "createdAt", "duration", "genres", "id", "imageUrl", "originalLanguage", "posterPath", "rating", "releaseDate", "synopsis", "title", "tmdbId", "trailerUrl", "updatedAt", "voteAverage", "voteCount" FROM "Movie";
DROP TABLE "Movie";
ALTER TABLE "new_Movie" RENAME TO "Movie";
CREATE UNIQUE INDEX "Movie_tmdbId_key" ON "Movie"("tmdbId");
CREATE TABLE "new_Seat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hallId" INTEGER NOT NULL,
    "row" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'STANDARD',
    "position" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "isLeft" BOOLEAN,
    "isRight" BOOLEAN,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Seat_hallId_fkey" FOREIGN KEY ("hallId") REFERENCES "Hall" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Seat" ("createdAt", "hallId", "id", "isLeft", "isRight", "number", "position", "row", "status", "type", "updatedAt") SELECT "createdAt", "hallId", "id", "isLeft", "isRight", "number", "position", "row", "status", "type", "updatedAt" FROM "Seat";
DROP TABLE "Seat";
ALTER TABLE "new_Seat" RENAME TO "Seat";
CREATE UNIQUE INDEX "Seat_hallId_row_number_key" ON "Seat"("hallId", "row", "number");
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL DEFAULT 'Usuário',
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "password", "updatedAt") SELECT "createdAt", "email", "id", "name", "password", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
