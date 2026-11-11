/*==============================================================================
  Deploy.sql : SQLCMD-mode master script. Run from this folder, e.g.
    sqlcmd -S <server> -E -I -b -i Deploy.sql -v DatabaseName=MbruAdmission
  -I (QUOTED_IDENTIFIER ON) is required for filtered indexes; -v DatabaseName is required.
==============================================================================*/
:on error exit
:r .\00_Database.sql
:r .\01_Schemas.sql
:r .\02_Reference.sql
:r .\03_Identity.sql
:r .\04_Operations.sql
:r .\05_Application.sql
:r .\06_Documents.sql
:r .\07_Payments.sql
:r .\08_Verification.sql
:r .\09_Portfolio.sql
:r .\10_Screening.sql
:r .\11_Views.sql
:r .\90_Seed_Reference.sql
