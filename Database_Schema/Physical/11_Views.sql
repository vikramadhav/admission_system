/*==============================================================================
  11_Views.sql : privacy-preserving read models
==============================================================================*/
:on error exit
USE [$(DatabaseName)];
GO

-- Finance (US-1.3.13 note 3): the payment list columns only - Application ID, English full name, registered e-mail,
-- program, fee type, bill status, bill amount (AED) and payment date - plus the admission cycle used by the cycle
-- filter. Nothing else of the application is exposed. Grant finance roles on this view only, not on the base tables.
CREATE VIEW pay.vw_FinancePayment AS
SELECT ap.ApplicationNumber,
       CONCAT_WS(N' ', pp.EnglishFirstName, pp.EnglishMiddleName, pp.EnglishLastName) AS EnglishFullName,
       c.Email,
       pr.ProgramName,
       fs.FeeType,
       ps.StatusCode AS BillStatus,
       ps.Amount AS BillAmount,
       ps.PaidAt AS PaymentDate,
       ac.CycleCode
FROM pay.PaymentSession ps
JOIN pay.FeeSchedule fs ON fs.FeeScheduleId = ps.FeeScheduleId
JOIN app.Application ap ON ap.ApplicationId = ps.ApplicationId
JOIN idn.Candidate c ON c.CandidateId = ap.CandidateId
LEFT JOIN idn.CandidatePersonalProfile pp ON pp.CandidateId = c.CandidateId
JOIN cfg.ProgramCycle pc ON pc.ProgramCycleId = ap.ProgramCycleId
JOIN cfg.Program pr ON pr.ProgramId = pc.ProgramId
JOIN cfg.AdmissionCycle ac ON ac.CycleId = pc.CycleId;
GO

-- Referee: portfolio content keyed by an opaque id; no identity columns.
CREATE VIEW pfo.vw_RefereePortfolio AS
SELECT p.PublicId AS PortfolioPublicId, ra.RefereeStaffUserId, r.RoundCode, r.StatusCode AS RoundStatus,
       q.QuestionCode, q.QuestionText, a.Answer, a.DetailsJson
FROM pfo.RoundAssignment ra
JOIN pfo.PortfolioRound r ON r.PortfolioRoundId = ra.PortfolioRoundId AND ra.IsCurrent = 1
JOIN pfo.Portfolio p ON p.PortfolioId = r.PortfolioId
JOIN pfo.PortfolioAnswer a ON a.PortfolioId = p.PortfolioId
JOIN pfo.PortfolioQuestion q ON q.PortfolioQuestionId = a.PortfolioQuestionId;
GO

-- Candidate: only announced scores.
CREATE VIEW scr.vw_CandidateAnnouncedScore AS
SELECT ap.PublicId AS ApplicationId, ap.CandidateId, sa.AnnouncementType, sa.AnnouncedAt,
       i.PublishedScore, i.PublishedComponentsJson, sa.AppealWindowEndsAt
FROM scr.ScoreAnnouncementItem i
JOIN scr.ScoreAnnouncement sa ON sa.ScoreAnnouncementId = i.ScoreAnnouncementId
JOIN app.Application ap ON ap.ApplicationId = i.ApplicationId;
GO
