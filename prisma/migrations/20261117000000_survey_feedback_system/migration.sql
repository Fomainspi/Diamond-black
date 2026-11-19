CREATE TYPE "SurveyStatus" AS ENUM ('DRAFT','PUBLISHED','CLOSED','ARCHIVED');
CREATE TYPE "SurveyQuestionType" AS ENUM ('SHORT_TEXT','LONG_TEXT','SINGLE_CHOICE','MULTIPLE_CHOICE','DROPDOWN','RATING','STAR_RATING','LINEAR_SCALE','YES_NO','EMAIL','NUMBER','DATE');
CREATE TABLE "Survey" (
 "id" TEXT NOT NULL, "title" TEXT NOT NULL, "slug" TEXT NOT NULL, "subtitle" TEXT,
 "description" TEXT NOT NULL, "eventName" TEXT NOT NULL, "coverImage" TEXT,
 "startsAt" TIMESTAMP(3), "endsAt" TIMESTAMP(3), "status" "SurveyStatus" NOT NULL DEFAULT 'DRAFT',
 "thankYou" TEXT NOT NULL, "privacyNotice" TEXT, "currentVersion" INTEGER NOT NULL DEFAULT 0,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "Survey_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Survey_slug_key" ON "Survey"("slug");
CREATE INDEX "Survey_status_startsAt_idx" ON "Survey"("status","startsAt");
CREATE INDEX "Survey_createdAt_idx" ON "Survey"("createdAt");
CREATE TABLE "SurveySection" (
 "id" TEXT NOT NULL, "surveyId" TEXT NOT NULL, "title" TEXT NOT NULL, "description" TEXT,
 "sortOrder" INTEGER NOT NULL DEFAULT 0, "enabled" BOOLEAN NOT NULL DEFAULT true,
 CONSTRAINT "SurveySection_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "SurveySection_surveyId_sortOrder_idx" ON "SurveySection"("surveyId","sortOrder");
ALTER TABLE "SurveySection" ADD CONSTRAINT "SurveySection_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE TABLE "SurveyQuestion" (
 "id" TEXT NOT NULL, "sectionId" TEXT NOT NULL, "title" TEXT NOT NULL, "description" TEXT,
 "type" "SurveyQuestionType" NOT NULL, "required" BOOLEAN NOT NULL DEFAULT false,
 "enabled" BOOLEAN NOT NULL DEFAULT true, "sortOrder" INTEGER NOT NULL DEFAULT 0,
 "minValue" INTEGER, "maxValue" INTEGER, CONSTRAINT "SurveyQuestion_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "SurveyQuestion_sectionId_sortOrder_idx" ON "SurveyQuestion"("sectionId","sortOrder");
ALTER TABLE "SurveyQuestion" ADD CONSTRAINT "SurveyQuestion_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "SurveySection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE TABLE "SurveyQuestionOption" (
 "id" TEXT NOT NULL, "questionId" TEXT NOT NULL, "label" TEXT NOT NULL, "value" TEXT NOT NULL,
 "sortOrder" INTEGER NOT NULL DEFAULT 0, CONSTRAINT "SurveyQuestionOption_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "SurveyQuestionOption_questionId_sortOrder_idx" ON "SurveyQuestionOption"("questionId","sortOrder");
ALTER TABLE "SurveyQuestionOption" ADD CONSTRAINT "SurveyQuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "SurveyQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE TABLE "SurveyVersion" (
 "id" TEXT NOT NULL, "surveyId" TEXT NOT NULL, "version" INTEGER NOT NULL, "snapshot" JSONB NOT NULL,
 "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "SurveyVersion_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SurveyVersion_surveyId_version_key" ON "SurveyVersion"("surveyId","version");
CREATE INDEX "SurveyVersion_surveyId_publishedAt_idx" ON "SurveyVersion"("surveyId","publishedAt");
ALTER TABLE "SurveyVersion" ADD CONSTRAINT "SurveyVersion_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE TABLE "SurveyResponse" (
 "id" TEXT NOT NULL, "surveyId" TEXT NOT NULL, "versionId" TEXT NOT NULL,
 "marketingOptIn" BOOLEAN NOT NULL DEFAULT false, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "SurveyResponse_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "SurveyResponse_surveyId_createdAt_idx" ON "SurveyResponse"("surveyId","createdAt");
CREATE INDEX "SurveyResponse_versionId_idx" ON "SurveyResponse"("versionId");
ALTER TABLE "SurveyResponse" ADD CONSTRAINT "SurveyResponse_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SurveyResponse" ADD CONSTRAINT "SurveyResponse_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "SurveyVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE TABLE "SurveyAnswer" (
 "id" TEXT NOT NULL, "responseId" TEXT NOT NULL, "questionId" TEXT NOT NULL,
 "questionText" TEXT NOT NULL, "answer" JSONB NOT NULL, CONSTRAINT "SurveyAnswer_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "SurveyAnswer_responseId_idx" ON "SurveyAnswer"("responseId");
CREATE INDEX "SurveyAnswer_questionId_idx" ON "SurveyAnswer"("questionId");
ALTER TABLE "SurveyAnswer" ADD CONSTRAINT "SurveyAnswer_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "SurveyResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE TABLE "SurveyMarketingConsent" (
 "id" TEXT NOT NULL, "responseId" TEXT NOT NULL, "email" TEXT NOT NULL,
 "consentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "source" TEXT NOT NULL DEFAULT 'SURVEY',
 CONSTRAINT "SurveyMarketingConsent_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SurveyMarketingConsent_responseId_key" ON "SurveyMarketingConsent"("responseId");
CREATE INDEX "SurveyMarketingConsent_email_idx" ON "SurveyMarketingConsent"("email");
CREATE INDEX "SurveyMarketingConsent_consentAt_idx" ON "SurveyMarketingConsent"("consentAt");
ALTER TABLE "SurveyMarketingConsent" ADD CONSTRAINT "SurveyMarketingConsent_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "SurveyResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
