-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'TEACHER', 'LIBRARIAN', 'ADMINISTRATOR');

-- CreateEnum
CREATE TYPE "LendingType" AS ENUM ('IN_LIBRARY', 'HOME');

-- CreateEnum
CREATE TYPE "LendingStatus" AS ENUM ('IN_PROGRESS', 'RETURNED_LATE', 'LOST');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'REFUNDED', 'LOST_DUE_TO_SANCTION');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELED');

-- CreateEnum
CREATE TYPE "FineStatus" AS ENUM ('PENDING', 'PAID', 'ANNULLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('BANKING_APP', 'CASH');

-- CreateEnum
CREATE TYPE "PenaltyType" AS ENUM ('MILD', 'SEVERE', 'VERY_SEVERE');

-- CreateEnum
CREATE TYPE "PenaltyStatus" AS ENUM ('ACTIVE', 'FULFILLED', 'CANCELED');

-- CreateEnum
CREATE TYPE "CopyStatus" AS ENUM ('AVAILABLE', 'BORROWED', 'LOST');

-- CreateEnum
CREATE TYPE "BlockType" AS ENUM ('TEMPORARY', 'PERMANENT');

-- CreateTable
CREATE TABLE "UserData" (
    "userDataId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "paternalLastName" TEXT NOT NULL,
    "maternalLastName" TEXT NOT NULL,
    "documentType" TEXT NOT NULL DEFAULT 'DNI',
    "documentNumber" TEXT NOT NULL,
    "maritalStatus" TEXT,
    "gender" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "birthDate" TIMESTAMP(3),
    "mobilePhone" TEXT,
    "landlinePhone" TEXT,
    "email" TEXT,
    "addressId" TEXT,
    "districtId" TEXT,

    CONSTRAINT "UserData_pkey" PRIMARY KEY ("userDataId")
);

-- CreateTable
CREATE TABLE "User" (
    "userId" TEXT NOT NULL,
    "userDataId" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "code" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "confirmToken" TEXT,
    "confirmTokenExpires" TIMESTAMP(3),
    "isConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "resetPasswordToken" TEXT,
    "resetPasswordTokenExpires" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Student" (
    "userId" TEXT NOT NULL,
    "cycle" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "onTimeDeliveriesCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Teacher" (
    "userId" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "department" TEXT,
    "specialization" TEXT,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Librarian" (
    "userId" TEXT NOT NULL,
    "shift" TEXT NOT NULL,

    CONSTRAINT "Librarian_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Administrator" (
    "userId" TEXT NOT NULL,
    "dateAssignment" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Administrator_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Address" (
    "addressId" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("addressId")
);

-- CreateTable
CREATE TABLE "District" (
    "districtId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "provinceId" TEXT NOT NULL,

    CONSTRAINT "District_pkey" PRIMARY KEY ("districtId")
);

-- CreateTable
CREATE TABLE "Province" (
    "provinceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "Province_pkey" PRIMARY KEY ("provinceId")
);

-- CreateTable
CREATE TABLE "School" (
    "schoolId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,

    CONSTRAINT "School_pkey" PRIMARY KEY ("schoolId")
);

-- CreateTable
CREATE TABLE "Faculty" (
    "facultyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "Faculty_pkey" PRIMARY KEY ("facultyId")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "reservationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "reservationDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "ReservationStatus" NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("reservationId")
);

-- CreateTable
CREATE TABLE "UserType" (
    "userTypeId" TEXT NOT NULL,
    "name" "UserRole" NOT NULL,

    CONSTRAINT "UserType_pkey" PRIMARY KEY ("userTypeId")
);

-- CreateTable
CREATE TABLE "LendingPolicy" (
    "lendingPolicyId" TEXT NOT NULL,
    "userTypeId" TEXT NOT NULL,
    "type" "LendingType" NOT NULL,
    "maxDays" INTEGER NOT NULL,
    "maxItems" INTEGER NOT NULL,

    CONSTRAINT "LendingPolicy_pkey" PRIMARY KEY ("lendingPolicyId")
);

-- CreateTable
CREATE TABLE "Lending" (
    "lendingId" TEXT NOT NULL,
    "copyId" TEXT NOT NULL,
    "librarianUserId" TEXT NOT NULL,
    "borrowerUserId" TEXT NOT NULL,
    "lendingPolicyId" TEXT NOT NULL,
    "status" "LendingStatus" NOT NULL,
    "lendingDate" TIMESTAMP(3) NOT NULL,
    "expectedReturnDate" TIMESTAMP(3) NOT NULL,
    "actualReturnDate" TIMESTAMP(3),
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "depositAmount" DECIMAL(65,30),
    "refundStatus" "RefundStatus",
    "qrToken" TEXT,

    CONSTRAINT "Lending_pkey" PRIMARY KEY ("lendingId")
);

-- CreateTable
CREATE TABLE "Fine" (
    "fineId" TEXT NOT NULL,
    "initialAmount" DECIMAL(65,30) NOT NULL,
    "accumulatedAmount" DECIMAL(65,30) NOT NULL,
    "isTemporary" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "lendingId" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "paymentDate" TIMESTAMP(3),
    "status" "FineStatus" NOT NULL,
    "paymentMethod" "PaymentMethod",

    CONSTRAINT "Fine_pkey" PRIMARY KEY ("fineId")
);

-- CreateTable
CREATE TABLE "Penalty" (
    "penaltyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "PenaltyType" NOT NULL,
    "daysBlock" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "applicationDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "PenaltyStatus" NOT NULL,

    CONSTRAINT "Penalty_pkey" PRIMARY KEY ("penaltyId")
);

-- CreateTable
CREATE TABLE "UserBlock" (
    "blockId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "blockType" "BlockType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "reason" TEXT,

    CONSTRAINT "UserBlock_pkey" PRIMARY KEY ("blockId")
);

-- CreateTable
CREATE TABLE "Copy" (
    "copyId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "status" "CopyStatus" NOT NULL,
    "location" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,

    CONSTRAINT "Copy_pkey" PRIMARY KEY ("copyId")
);

-- CreateTable
CREATE TABLE "Book" (
    "bookId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isbn" TEXT NOT NULL,
    "publicationYear" INTEGER NOT NULL,
    "edition" TEXT,
    "language" TEXT,
    "pageCount" INTEGER,
    "publisherId" TEXT NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("bookId")
);

-- CreateTable
CREATE TABLE "Publisher" (
    "publisherId" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "Publisher_pkey" PRIMARY KEY ("publisherId")
);

-- CreateTable
CREATE TABLE "Author" (
    "authorId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "nationality" TEXT,

    CONSTRAINT "Author_pkey" PRIMARY KEY ("authorId")
);

-- CreateTable
CREATE TABLE "Category" (
    "categoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("categoryId")
);

-- CreateTable
CREATE TABLE "Genre" (
    "genreId" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("genreId")
);

-- CreateTable
CREATE TABLE "BookAuthor" (
    "authorId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,

    CONSTRAINT "BookAuthor_pkey" PRIMARY KEY ("authorId","bookId")
);

-- CreateTable
CREATE TABLE "BookCategory" (
    "categoryId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,

    CONSTRAINT "BookCategory_pkey" PRIMARY KEY ("categoryId","bookId")
);

-- CreateTable
CREATE TABLE "BookGenre" (
    "genreId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,

    CONSTRAINT "BookGenre_pkey" PRIMARY KEY ("genreId","bookId")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserData_documentNumber_key" ON "UserData"("documentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "UserData_email_key" ON "UserData"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_userDataId_key" ON "User"("userDataId");

-- CreateIndex
CREATE UNIQUE INDEX "User_code_key" ON "User"("code");

-- CreateIndex
CREATE INDEX "Reservation_userId_idx" ON "Reservation"("userId");

-- CreateIndex
CREATE INDEX "Reservation_bookId_idx" ON "Reservation"("bookId");

-- CreateIndex
CREATE UNIQUE INDEX "UserType_name_key" ON "UserType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Lending_qrToken_key" ON "Lending"("qrToken");

-- CreateIndex
CREATE INDEX "Lending_copyId_idx" ON "Lending"("copyId");

-- CreateIndex
CREATE INDEX "Lending_librarianUserId_idx" ON "Lending"("librarianUserId");

-- CreateIndex
CREATE INDEX "Lending_borrowerUserId_idx" ON "Lending"("borrowerUserId");

-- CreateIndex
CREATE INDEX "Lending_lendingPolicyId_idx" ON "Lending"("lendingPolicyId");

-- CreateIndex
CREATE UNIQUE INDEX "Fine_lendingId_key" ON "Fine"("lendingId");

-- CreateIndex
CREATE INDEX "Fine_userId_idx" ON "Fine"("userId");

-- CreateIndex
CREATE INDEX "Penalty_userId_idx" ON "Penalty"("userId");

-- CreateIndex
CREATE INDEX "UserBlock_userId_idx" ON "UserBlock"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Copy_barcode_key" ON "Copy"("barcode");

-- CreateIndex
CREATE INDEX "Copy_bookId_idx" ON "Copy"("bookId");

-- CreateIndex
CREATE UNIQUE INDEX "Book_isbn_key" ON "Book"("isbn");

-- CreateIndex
CREATE INDEX "Book_publisherId_idx" ON "Book"("publisherId");

-- CreateIndex
CREATE INDEX "BookAuthor_bookId_idx" ON "BookAuthor"("bookId");

-- CreateIndex
CREATE INDEX "BookCategory_bookId_idx" ON "BookCategory"("bookId");

-- CreateIndex
CREATE INDEX "BookGenre_bookId_idx" ON "BookGenre"("bookId");

-- AddForeignKey
ALTER TABLE "UserData" ADD CONSTRAINT "UserData_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("addressId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserData" ADD CONSTRAINT "UserData_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("districtId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_userDataId_fkey" FOREIGN KEY ("userDataId") REFERENCES "UserData"("userDataId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("schoolId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("facultyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Librarian" ADD CONSTRAINT "Librarian_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Administrator" ADD CONSTRAINT "Administrator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "District" ADD CONSTRAINT "District_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province"("provinceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "School" ADD CONSTRAINT "School_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("facultyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("bookId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LendingPolicy" ADD CONSTRAINT "LendingPolicy_userTypeId_fkey" FOREIGN KEY ("userTypeId") REFERENCES "UserType"("userTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lending" ADD CONSTRAINT "Lending_copyId_fkey" FOREIGN KEY ("copyId") REFERENCES "Copy"("copyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lending" ADD CONSTRAINT "Lending_librarianUserId_fkey" FOREIGN KEY ("librarianUserId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lending" ADD CONSTRAINT "Lending_borrowerUserId_fkey" FOREIGN KEY ("borrowerUserId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lending" ADD CONSTRAINT "Lending_lendingPolicyId_fkey" FOREIGN KEY ("lendingPolicyId") REFERENCES "LendingPolicy"("lendingPolicyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fine" ADD CONSTRAINT "Fine_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fine" ADD CONSTRAINT "Fine_lendingId_fkey" FOREIGN KEY ("lendingId") REFERENCES "Lending"("lendingId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Penalty" ADD CONSTRAINT "Penalty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBlock" ADD CONSTRAINT "UserBlock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Copy" ADD CONSTRAINT "Copy_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("bookId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_publisherId_fkey" FOREIGN KEY ("publisherId") REFERENCES "Publisher"("publisherId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookAuthor" ADD CONSTRAINT "BookAuthor_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("authorId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookAuthor" ADD CONSTRAINT "BookAuthor_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("bookId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookCategory" ADD CONSTRAINT "BookCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("categoryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookCategory" ADD CONSTRAINT "BookCategory_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("bookId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookGenre" ADD CONSTRAINT "BookGenre_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("genreId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookGenre" ADD CONSTRAINT "BookGenre_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("bookId") ON DELETE RESTRICT ON UPDATE CASCADE;
