-- CreateEnum
CREATE TYPE "StoryType" AS ENUM ('monster_battle', 'space_adventure');

-- CreateEnum
CREATE TYPE "StylePreset" AS ENUM ('storybook_illustration', 'colorful_cartoon', 'comic_book');

-- CreateEnum
CREATE TYPE "MovieStatus" AS ENUM ('draft', 'planning', 'filming', 'assembling', 'complete', 'failed');

-- CreateEnum
CREATE TYPE "ShotStatus" AS ENUM ('draft', 'preview_generated', 'filming', 'complete', 'failed');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "cognitoId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movie" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "storyType" "StoryType" NOT NULL,
    "stylePreset" "StylePreset" NOT NULL,
    "storyAnswers" JSONB NOT NULL,
    "screenplay" JSONB,
    "narrationEnabled" BOOLEAN NOT NULL DEFAULT false,
    "narrationScript" TEXT,
    "narrationAudioUrl" TEXT,
    "backgroundMusicUrl" TEXT,
    "creditsSongUrl" TEXT,
    "creditsSongLyrics" TEXT,
    "status" "MovieStatus" NOT NULL DEFAULT 'draft',
    "totalDurationSeconds" INTEGER,
    "finalVideoUrl" TEXT,
    "generationCostTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Movie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rawImageUrl" TEXT,
    "referenceImageUrl" TEXT,
    "styleDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shot" (
    "id" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "sequenceNumber" INTEGER NOT NULL,
    "kidDescription" TEXT NOT NULL,
    "technicalPrompt" TEXT,
    "durationSeconds" DOUBLE PRECISION NOT NULL DEFAULT 6,
    "previewImageUrl" TEXT,
    "videoUrl" TEXT,
    "status" "ShotStatus" NOT NULL DEFAULT 'draft',
    "reshootsRemaining" INTEGER NOT NULL DEFAULT 3,
    "generationCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShotCharacter" (
    "shotId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,

    CONSTRAINT "ShotCharacter_pkey" PRIMARY KEY ("shotId","characterId")
);

-- CreateTable
CREATE TABLE "TitleCard" (
    "id" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "durationSeconds" DOUBLE PRECISION NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TitleCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_cognitoId_key" ON "User"("cognitoId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Shot_movieId_sequenceNumber_key" ON "Shot"("movieId", "sequenceNumber");

-- AddForeignKey
ALTER TABLE "Movie" ADD CONSTRAINT "Movie_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shot" ADD CONSTRAINT "Shot_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShotCharacter" ADD CONSTRAINT "ShotCharacter_shotId_fkey" FOREIGN KEY ("shotId") REFERENCES "Shot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShotCharacter" ADD CONSTRAINT "ShotCharacter_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TitleCard" ADD CONSTRAINT "TitleCard_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
