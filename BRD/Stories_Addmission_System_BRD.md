

# ***Business Roles***

|  |  |  |
| --- | --- | --- |
| ***Business Role ID*** | ***Actor*** | ***Definition*** |
| *BRO-01* | *Candidate* | *The candidate applying to a GME program (Internship, Residency, or Fellowship). Creates the account via Dubai Health IDAM, prepares and submits the application, tracks status, and may withdraw, reinstate, edit preferences, correct returned items, or appeal a portfolio score.* |
| *BRO-02* | *Admission Officer* | *Front-line back-office reviewer in the admission team, assigned to one or more programs + first-preference specialty pools. Retrieves applications from the pool, verifies candidates' data and attachments (portfolio excluded), flags items and adds notes, returns applications for correction, completes verification, recommends screen out, escalates unclear cases, announces results, and handles post-appeal promotions.* |
| *BRO-03* | *Admission Supervisor* | *Manager of the admission team. Oversees officers' and referees� workload, reassigns, decides on escalated applications and recommended screen-outs, processes reinstatement requests raised by candidates, and reviews ranked lists, cuts shortlist by capacity* |
| *BRO-04* | *Referee (First and Second)* | *Specialist assigned to a program + first-preference specialty for portfolio evaluation. Retrieves portfolios, scores each question and its sub-questions (Yes/No), and submits the scoring for Round 1 or Round 2 (Never served as round 1 and round 2 for the same portfolio). May return a portfolio for Conflict of Interest.* |
| *BRO-05* | *Third Referee* | *Specialist assigned to score portfolios routed after a discrepancy between Round 1 and Round 2. Never served as Round 1 or Round 2 of the same portfolios. The Third Referee's score is the final call and replaces the Round 1 and Round 2 scores.* |
| *BRO-06* | *2nd Evaluation Referee* | *Specialist assigned to rescore appealed questions only after a candidate appeal. Never served as Rou1nd 1, Round 2, or Round 3 of the same portfolios. The 2nd Evaluation score replaces the previous final Portfolio Score.* |
| *BRO-07* | *Senior Referee* | *Oversight role over the portfolio scoring process and the referees' workload. Views all portfolios, all rounds, all referees, and audit-level details. Can reassign portfolios to different referees, return portfolios to the applicable pool, or override a round score in exceptional cases with a mandatory justification.* |
| *BRO-08* | *Finance Officer* | *User with read-only access to application payment records. Searches and filters payment transactions by admission cycle, program, application ID, and payment date range, and exports the resulting payment records to Excel for reconciliation and reporting. The Finance Officer cannot open or access application details and does not participate in application verification, portfolio scoring, ranking, shortlisting, or other admission-processing activities.* |
| *BRO-09* | *Central Monitor* | *Read-only monitoring role with access to the Central Monitoring Dashboard. Views application volumes and verification progress across all training sites, programs, and specialties. Monitors overall application counts, training-site interest by specialty, applications per site and verification category, and applications per program. Can drill down from dashboard insights and charts to a read-only application list and open application details in read-only mode.* |


# ***Application Status***



|  |  |  |  |
| --- | --- | --- | --- |
| *Status* | *Description* | *Entered When* | *Possible Next Status / Outcome* |
| *Draft\** | *The application has been created and may be edited by the candidate but has not yet been successfully submitted.* | *The candidate starts a new application or saves an incomplete application.* | *Submitted when payment and submission succeed. Archived if the applicable grace period passes before submission.* |
| *Archived\** | *The application is no longer active and can�t proceed through the admission workflow. It remains available for read-only viewing.* | *The candidate discards the draft, or an unsubmitted draft/correction required passes the applicable grace period deadline.* | *Terminal status. No further processing is performed.* |
| *Submitted\** | *The application has been successfully paid for and officially submitted. It is available for retrieval by the admission verification and portfolio-scoring workstreams.* | *Successful payment is confirmed and the application is submitted.* | *Under Review when the application is retrieved for processing. The submission also initializes Verification Status and Portfolio Status as Pending.* |
| *Under Review\** | *The application is actively progressing through application verification or portfolio scoring.* | *An admission officer retrieves the application or referee retrieves portfolio, parallel processing.* | *Correction Required if the application is returned to the candidate. Screened Out if the final review outcome is screen out. Review Completed when verification and portfolio scoring are complete.* |
| *Correction Required\** | *The application has been returned to the candidate because one or more fields, attachments, sections, or subsections require correction.* | *The admission officer confirms Return for Correction after flagging at least one item.* | *Correction Submitted when the candidate completes and resubmits the required corrections. Archived if the indicated correction grace period passes without correction.* |
| *Correction Submitted\** | *The candidate has resubmitted the corrected application for continued review.* | *The candidate successfully validates and resubmits the flagged items.* | *Returns to the review outcome assessment. It may lead to Review Completed, Screened Out, or another correction cycle, depending on the review result.* |
| *Screened Out\** | *The application has received a final screen-out outcome and will not continue through the normal admission journey.* | *The applicable verification or admission decision results in screen out.* | *Terminal status. For verification-based screening, supervisor endorsement is required before the verification screen-out becomes final.*  *Reinstating the application by supervisor: (returns to previous status).* |
| *Review Completed\** | *Verification and portfolio scoring have both reached their required completed outcomes.* | *Verification has passed and portfolio scoring has been completed.* | *If an eligible appeal is submitted, it will be Appeal Under Review. Otherwise, the application journey ends. In exception scenarios, a candidate might be Screened Out later due to capacity concerns or not attending CASPER.* |
| *Appeal Under Review\** | *An appeal has been submitted and the applicable portfolio questions are undergoing second evaluation.* | *The candidate submits an eligible portfolio-scoring appeal during the configured appeal window.* | *Review Completed when the second evaluation is completed and the final portfolio score is updated.* |
| *Withdrawn\** | *The candidate voluntarily withdraws the application from the admission cycle and no further processing activities are performed unless reinstatement is approved.* | *Candidate confirms withdrawal through the withdrawal process.* | *Reinstated (returns to previous status), End.* |

*Status marked with (\*) indicates the status that should be visible to the candidate on their portal. If a status should not be visible, the previous one is retained until the next visible status.*

# ***Verification Status***

![](data:image/x-emf;base64...)



|  |  |  |  |
| --- | --- | --- | --- |
| *Status* | *Description* | *Entered When* | *Possible Next Status / Outcome* |
| *Pending\** | *The application has been submitted and is waiting in the applicable verification pool for retrieval by an admission officer.* | *The application is successfully submitted.* | *In Progress when an admission officer retrieves the application.* |
| *In**Progress\** | *The application is assigned to an admission officer and is actively being reviewed.* | *The officer retrieves the application.* | *Correction Required, Pending Clarification, Screen Out Pending Approval, or Complete based on the officer�s action. It may return to Pending if the active assignment becomes overdue under the applicable rule.* |
| *Correction**Required\** | *Verification is waiting for the candidate to correct one or more flagged items.* | *The admission officer returns the application for correction.* | *Correction Submitted if the candidate corrects and resubmits the application. The verification path ends if the correction grace period passes without resubmission.* |
| *Correction**Submitted\** | *The candidate has submitted the requested corrections and the application is ready for further officer review.* | *The candidate successfully resubmits the corrected items.* | *Returns to the decision flow assigned to the same officer. The officer may complete verification, escalate the application, recommend screen out, or request further correction.* |
| *Pending**Clarification* | *The admission officer has escalated an unclear application to the admission supervisor for guidance.* | *The officer submits an escalation with a mandatory note.* | *Clarification Submitted when the supervisor provides guidance and returns the application.* |
| *Clarification**Submitted* | *The supervisor has provided guidance and returned the escalated application for officer action.* | *The supervisor records the required guidance and returns the application to the officer.* | *Returns to the officer�s decision point, where the application may become Complete or Screen Out Pending Approval, or continue through another permitted verification action.* |
| *Screen**Out**Pending**Approval* | *The officer has recommended screening out, but the final decision is waiting for the admission supervisor's approval.* | *The officer selects a screen-out reason, enters the mandatory note, and submits the recommendation.* | *Screened Out if the supervisor endorses the recommendation. Re-evaluating if the supervisor rejects it.* |
| *Re-evaluating* | *The supervisor has rejected the screen-out recommendation and the application requires another officer review.* | *The supervisor rejects the recommended screen out and records a mandatory note.* | *Returns to the standard verification actions. The officer may return the application for correction, complete verification, recommend screen out again, or escalate for clarification.* |
| *Complete\** | *The application has successfully passed the verification workstream.* | *The admission officer confirms Complete Verification.* | *Terminal verification status. The application can proceed only when the portfolio-scoring workstream is also complete.* |
| *Screened**Out\** | *The application has received an endorsed verification screen-out decision.* | *The admission supervisor endorses the officer�s screen-out recommendation.* | *Terminal verification status. The application is excluded and candidate is notified. No appeal is allowed for this.*  *Reinstating the application by supervisor: (returns to previous status).* |
| *On Hold\** | *Verification is no longer temporarily required due to withdrawal, or permanently required due to archiving.* | *The application is archived or withdrawn by the candidate.* | *The status will revert to its previous state if it was not Complete.* |

*Status marked with (\*) indicates the status that should be visible to the candidate on their portal. If a status should not be visible, the previous one is retained until the next visible status.*

# ***Portfolio Status***


|  |  |  |  |
| --- | --- | --- | --- |
| *Status* | *Description* | *Entered When* | *Possible Next Status / Outcome* |
| *Pending\** | *The portfolio is available in the applicable program and first-preference-specialty pool and is waiting for referee retrieval.* | *The application is successfully submitted and the Portfolio Score Status is initialized.* | *In Progress when an eligible referee retrieves the portfolio.* |
| *In Progress\** | *The standard first and second portfolio-scoring rounds are underway.* | *At least one of the referees retrieve the portfolio for a required standard round.* | *Remains In Progress until the required standard rounds are finished. If both referee assignments become overdue, the portfolio is returned to Pending. When both rounds finish, the platform assesses whether the results match.* |
| *Third Referee Required* | *The first two scoring rounds contain a discrepancy and an independent third score is required.* | *Round 1 and Round 2 totals differ, or at least one sub-question answer differs.* | *Third Round In Progress when an eligible Third Referee retrieves the portfolio.* |
| *Third Round In Progress* | *The Third Referee is independently scoring a disputed portfolio.* | *A Third Referee retrieves a portfolio with Third Referee Required status.* | *Complete when the Third Referee submits the score. Or Third Referee Required if overdue or unfinished, the portfolio returns to the third-referee pool automatically for retrieval by another eligible referee.* |
| *Complete\** | *All currently required portfolio scoring has been completed and a final portfolio score is available.* | *Round 1 and Round 2 match, or the Third Referee submits the deciding score. It is also restored after completing an appeal evaluation.* | *2nd Evaluation Required if the candidate submits an eligible appeal. Otherwise, the portfolio process ends.* |
| *2nd Evaluation Required* | *An eligible candidate appeal has been submitted and the appealed portfolio questions are waiting for assignment to a 2nd Evaluation Referee.* | *The candidate submits a portfolio-scoring appeal within the configured appeal window.* | *2nd Evaluation In Progress when an eligible 2nd Evaluation Referee retrieves the portfolio.* |
| *2nd Evaluation In Progress\** | *The appealed questions are being independently rescored by the 2nd Evaluation Referee.* | *The 2nd Evaluation Referee retrieves a portfolio in 2nd Evaluation Required status.* | *Complete when the fourth scoring round or 2nd evaluation is submitted. Or to 2nd Evaluation Required if the assignment becomes overdue because the portfolio returns to the second-evaluation workflow for reassignment or retrieval by another eligible referee.* |
| *On Hold\** | *Portfolio scoring is no longer temporarily required due to withdrawal, or permanently required due to archiving or being screened out.* | *The application is screened out, archived, or withdrawn by the candidate.* | *The status will revert to its previous state if it was not Complete.* |

*Status marked with (\*) indicates the status that should be visible to the candidate on their portal. If a status should not be visible, the previous one is retained until the next visible status.*

# ***Portfolio Round Status***


|  |  |  |  |
| --- | --- | --- | --- |
| *Status* | *Description* | *Entered When* | *Possible Next Status / Outcome* |
| *Pending* | *The individual scoring round is required but has not yet been retrieved by an eligible referee.* | *The platform creates or activates the applicable scoring round.* | *In Progress when an eligible referee retrieves the portfolio for that round.* |
| *In**Progress* | *The portfolio has been retrieved and the assigned referee is reviewing and scoring the applicable portfolio questions.* | *The referee retrieves the portfolio from the applicable round pool.* | *Complete when scoring is submitted and no conflict prevents the referee from proceeding. Returns to Pending if the portfolio becomes overdue or is returned for Conflict of Interest.* |
| *Complete* | *The referee has successfully submitted all required scoring responses for the individual round.* | *All required questions are answered and the referee confirms submission.* | *Terminal status for that individual round. The portfolio-level workflow determines whether another round is required or whether the overall Portfolio Status becomes Complete.* |
| *On Hold* | *Scoring round is no longer temporarily required due to withdrawal, or permanently required due to archiving or being screened out.* | *The application is screened out, archived, or withdrawn by the candidate.* | *The status will revert to the one it had before it was put on hold if it was not Complete.* |

# ***Announcement Status***



|  |  |  |  |
| --- | --- | --- | --- |
| *Status* | *Description* | *Entered When* | *Possible Next Status / Outcome* |
| *Pending* | *The application is in the Screening Dashboard but one or more required score components are missing, or no screening action has been completed.* | *Application enters the Screening Dashboard.* | *Ready for Initial Announcement.* |
| *Ready for Initial Announcement* | *All required score components are available and the Shortlisting Score has been computed.* | *Readiness validation passes.* | *Initially Announced.* |
| *Announced* | *The initial Final Portfolio Score and Shortlisting Score have been published to the candidate.* | *Supervisor completes Initial Announcement.* | *Appeal Under Review or remains Initially Announced.* |
| *Appeal Under Review* | *The candidate submitted an eligible portfolio appeal and second evaluation is in progress.* | *Eligible appeal is submitted.* | *Ready for Reannouncement.* |
| *Ready for Reannouncement* | *The second evaluation is complete and the final scores have been recomputed.* | *Portfolio Status returns to Complete after second evaluation.* | *Reannounced.* |
| *Reannounced* | *The updated final scores have been published and no further portfolio appeal is available.* | *Supervisor completes Reannouncement.* | *Remains Reannounced until the next admission phase.* |

# ***User Stories Backlog (Release 5)***

|  |  |
| --- | --- |
| ***ID*** | ***User Story*** |
| *US-1.1.1* | *Candidate Registers for a New Account* |
| *US-1.1.2* | *Candidate Logins to the Platform* |
| *US-1.2.1* | *Candidate Views the Dashboard* |
| *US-1.2.2* | *Candidate Views Application Details* |
| *US-1.2.3* | *Candidate Manages a Drafted Application* |
| *US-1.2.4* | *Candidate Withdraws an Application* |
| *US-1.2.5* | *Candidate Reinstates Application* |
| *US-1.2.6* | *Candidate Edits Preferences* |
| *US-1.2.7* | *Candidate Appeals a Decision* |
| *US-1.2.8* | *Candidate Exclude Training Site* |
| *US-1.3.1* | *Candidate Selects Program, Specialty, and Sites* |
| *US-1.3.2* | *Candidate Completes Application Information* |
| *US-1.3.3* | *Candidate Completes Personal Information* |
| *US-1.3.4* | *Candidate Completes University Grades* |
| *US-1.3.5* | *Candidate Completes English Proficiency Exam Information* |
| *US-1.3.6* | *Candidate Completes Internship Information* |
| *US-1.3.7* | *Candidate Completes Residency Information* |
| *US-1.3.8* | *Candidate Completes Board and License Information* |
| *US-1.3.9* | *Candidate Completes Residency Entrance Exam Information* |
| *US-1.3.10* | *Candidate Completes Portfolio Information* |
| *US-1.3.11* | *Candidate Saves Draft* |
| *US-1.3.12* | *Candidate Pays Fees and Submits Application* |
| *US-1.3.13* | *Finance Team Views Application Payments* |
| *US-2.1.4* | *Central Monitor Views the Site Monitoring Dashboard* |
| *US-2.1.1* | *Admission Officer Logins to the Platform* |
| *US-2.1.2* | *Admission Officer Views the Admission Dashboard* |
| *US-2.1.3* | *Admission Supervisor Views the Supervisor Dashboard* |
| *US-2.2.1* | *Admission Officer Retrieves Applications from Pool* |
| *US-2.2.2* | *Admission Supervisor Monitors Officer Workload and Progress* |
| *US-2.2.3* | *Admission Supervisor Reassigns Applications* |
| *US-2.3.1* | *Admission Officer Views Application Details* |
| *US-2.3.2* | *Admission Officer Flags and Adds Notes on Application* |
| *US-2.3.3* | *Admission Officer Returns Application for Correction* |
| *US-2.3.4* | *Candidate Corrects Returned Application* |
| *US-2.3.5* | *Admission Officer Completes Verification* |
| *US-2.3.6* | *Admission Officer Re-uploads an Application Attachment* |
| *US-2.4.1* | *Admission Officer Recommends Screen Out* |
| *US-2.4.2* | *Admission Officer Escalates Application for Clarification* |
| *US-2.4.3* | *Admission Supervisor Decides on Recommended Screen Out* |
| *US-2.4.4* | *Admission Supervisor Decides on Escalated Application* |
| *US-2.4.5* | *Admission Officer Handles Supervisor Rejection Feedback* |
| *US-2.5.1* | *Admission Supervisor Views Reinstatement Requests* |
| *US-2.5.2* | *Admission Supervisor Decides on Reinstatement Request* |
| *US-2.5.3* | *Admission Supervisor Refreshes ICP Candidate Information* |
| *US-3.1.1* | *Referee Logins to the Platform* |
| *US-3.1.2* | *Referee Views the Referee Dashboard* |
| *US-3.1.3* | *Senior Referee Views the Senior Referee Dashboard* |
| *US-3.2.1* | *Referee Retrieves Portfolios from Pool* |
| *US-3.2.2* | *Senior Referee Reassigns or Overrides Portfolios* |
| *US-3.2.3* | *Senior Referee Re-uploads Portfolio Evidence* |
| *US-3.3.1* | *Referee Views Portfolio Details* |
| *US-3.3.2* | *Referee Returns Portfolio for Conflict of Interest* |
| *US-3.3.3* | *Referee Scores Portfolio Questions* |
| *US-3.3.4* | *Referee Submits Portfolio Scoring* |
| *US-4.1.1* | *Admission Supervisor Views the Screening Dashboard* |
| *US-4.2.1* | *Admission Supervisor Uploads and Processes CASPER Results* |
| *US-4.3.1* | *Admission Supervisor Announces Initial Scores* |
| *US-4.3.2* | *Candidate Views Review Completion and Scores* |
| *US-4.4.1* | *Admission Supervisor Screens Out Applications in Bulk* |
| *US-4.5.1* | *Admission Supervisor Reannounces Scores After Portfolio Appeal* |

# ***Application Submission Epic [EPIC-01]***

# ***Create Account and Login [STP-1.1]***

*The candidate gains access to the GME platform by registering on Dubai Health IDAM and logging in. All identity, registration, and authentication are delegated to Dubai Health IDAM, with UAE Pass available as an option for candidates inside the UAE who hold a valid EID. The platform does not maintain local user accounts or implement its own registration or login behavior, but each user or candidate is provisioned with a platform-specific role and profile upon their first login.*

*Business Rules:*

1. *The platform does not store or manage local user accounts; IDAM is the only source of identity.*
2. *All registration and login behavior follows the existing Dubai Health IDAM rules and policies.*
3. *A candidate must complete IDAM registration before they can login to the platform and submit applications.*
4. *The GME platform is a unified entry point for internship, residency, and fellowship programs across all Dubai healthcare facilities.*
5. *The same IDAM account is used to apply to any GME program across cycles.*
6. *Candidates shouldn�t have duplicate accounts or submit multiple applications simultaneously under any circumstances.*
7. *All candidate applications for this cycle or previous ones should be linked to the candidate account.*

***Candidate Registers for a New Account [US-1.1.1]***

|  |  |
| --- | --- |
| ***User Story*** | *As a candidate, I want to register for a new account through Dubai Health IDAM so that I can access the GME admission platform.* |
| ***Acceptance Criteria*** | 1. *Given the candidate has no account, when they choose to register, the platform redirects to IDAM.* 2. *Given UAE Pass is chosen, when they select it, then the platform delegates to UAE Pass through IDAM.* 3. *Given IDAM confirms a new account, when the candidate returns to the platform, then platform do another check.* 4. *Given mobile number, EID or passport, when received from IDAM, then platform checks if duplicate accounts exist.* 5. *Given a duplicate account identified, when confirmed, then platform notifies candidate to use the original account.* 6. *Given a duplicate account identified, when confirmed, then platform records this pair in a report for supervisor.* 7. *Given a unique account identified, when confirmed, then platform create unique candidate ID.* |
| ***Notes*** | 1. *Registration is fully delegated to IDAM; all screens, fields, validations, and rules are owned by IDAM.* 2. *Candidates shouldn�t have duplicate accounts or submit multiple applications.* 3. *Candidates should be notified once their account is created. Following Dubai Health IDAM standards.* 4. *Refer to Dubai Health IDAM documentation for the registration field set and behavior.* 5. *An additional duplication check is required on the platform side.* 6. *Each candidate should have a unique Candidate ID linked to their applications across cycles in both GME and MBRU.* |

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Candidate ID* | *Numeric* | *System* | *N/A* | *N/A* | *N/A* | *9 Digits.* |

***Candidate Logins to the Platform [US-1.1.2]***

|  |  |
| --- | --- |
| ***User Story*** | *As a candidate, I want to login using my Dubai Health IDAM credentials or UAE Pass so that I can access the GME admission platform.* |
| ***Acceptance Criteria*** | 1. *Given an authenticated IDAM user, when they access the platform, then the platform grants access.* 2. *Given an authenticated UAE Pass user, when they access the platform, then the platform grants access.* 3. *Given a session timeout, when candidate returns, then platform redirects to IDAM for re-authentication.* 4. *Given a successful login, when the session starts, then the platform routes the candidate to Dashboard.* |
| ***Notes*** | 1. *Login is fully delegated to IDAM; all screens, fields, validations, and rules are owned by IDAM.* 2. *Forgot password, remember me, account lockout, and similar capabilities are handled by IDAM.* |

# ***Access and View Dashboard [STP-1.2]***

*After logging in, the candidate lands on a dashboard that summarizes their interaction with the GME platform. The dashboard provides the entry point for starting a new application and lists any active, submitted, or historical application in an inbox. From the dashboard, the candidate can also withdraw an application or from a specific site, request reinstatement, edit preferences, and appeal a scoring decision when the application status permits.*

*Business Rules:*

1. *The candidate can�t start new application if an existing one is still active in the same cycle.*
2. *A candidate can view a submitted application in read-only mode regardless of its current status.*
3. *Preference edits are allowed only until the submission window officially closes (grace period�s deadline date).*
4. *The candidate may withdraw at any point within the same cycle.*
5. *The candidate may withdraw the whole application or withdraw from a specific training site if multiple ones were selected before.*
6. *Withdrawal requires OTP confirmation sent to the candidate's registered email and mobile number.*
7. *Reinstating applications should not be allowed if the same candidate has another active application in the same cycle.*
8. *Reinstatement of a withdrawn application requires approval from the admission supervisor and depends on the cycle timeline.*
9. *Appeals are allowed only once after portfolio scoring is published and only within configurable appeal window (default 48 hours).*

***Candidate Views the Dashboard [US-1.2.1]***

|  |  |
| --- | --- |
| ***User Story*** | *As a candidate, I want to view my dashboard so that I can see my current and historical applications or start a new one.* |
| ***Acceptance Criteria*** | 1. *Given a successful login, when candidate lands, then dashboard is displayed with a welcoming message.* 2. *Given no application exists, when it loads, then the empty state and "Start New Application" show.* 3. *Given an application exists, when it loads, then the application appears in the inbox with its key details.* 4. *Given application status blocks new submission, when it loads, then "Start New Application" is disabled.* 5. *Given no program is available for current cycle, when it loads, then "Start New Application" is disabled.* 6. *Given no program is available, when it loads, then a message about the cycle opening dates appears.* 7. *Given the dashboard is open, when the candidate chooses logout, then the session ends.* |
| ***Notes*** | 1. *The key information shown per application in the inbox is listed in the data dictionary.* 2. *Action shortcuts (Withdraw, Reinstate, Edit Preferences, etc.) appear as actions list for each application.* 3. *Candidate should have a note indicating the inactivity time-out period to ensure they are aware of it.* |

***<u>Candidate Dashboard Data Dictionary:</u>*** *If an application exists in the account, the information below should appear in inbox style or in accordance with UX standards.*

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Start New Application* | *Button* | *User* | *N/A* | *N/A* | *Disabled for any status other than �Withdrawn� and �Archived� while a submission window is still open.* | *More statuses will be considered later.*  *The submission window runs from the opening date to the deadline configured on the program level.* |
| *Application ID* | *Label* | *System* | *As per the application* | *N/A* | *N/A* | *Read-only.* |
| *Application Creation Date* | *Label* | *System* | *As per the application* | *N/A* | *N/A* | *Read-only.* |
| *Application Submission Date* | *Label* | *System* | *As per the application* | *N/A* | *N/A* | *Read-only. Empty if not yet submitted.* |
| *Submission Deadline* | *Label* | *System* | *As per the program deadline date* | *N/A* | *N/A* | *Opening and deadline dates are configurable.* |
| *Announcement Date* | *Date/Time* | *System* | *Empty* | *N/A* | *Show after announcement* | *Displays initial announcement or latest reannouncement date, as applicable.*  *Will be explained later in this document.* |
| *Program* | *Label* | *System* | *As per the application* | *N/A* | *N/A* | *Read-only.* |
| *Training Site(s)* | *Label* | *System* | *As per the application* | *N/A* | *N/A* | *Read-only.* |
| *Preference(s)* | *Label* | *System* | *As per the application* | *N/A* | *N/A* | *Read-only.* |
| *Application Status* | *Label* | *System* | *As per the application* | *N/A* | *N/A* | *Read-only.* |
| *Portfolio Final Score* | *Label* | *System* | *As per the score when it�s announced* | *N/A* | *N/A* | *Read-only.* |
| *GPA Score* | *Label* | *System* | *As per the application* | *N/A* | *N/A* | *Read-only. For applicable programs.* |
| *Entrance Exam Score* | *Label* | *System* | *As per the application* | *N/A* | *N/A* | *Read-only. For applicable programs.* |
| *Shortlisting Score* | *Label* | *System* | *As per the composite shortlisting score once released* | *N/A* | *N/A* | *Read-only.* |
| *Resume* | *Button* | *System* | *N/A* | *N/A* | *Show and enable only if the application is in "Draft� status.* | *N/A* |
| *Discard* | *Button* | *System* | *N/A* | *N/A* | *Show and enable only if the application is in "Draft� status.* | *N/A* |
| *Withdraw Application* | *Button* | *User* | *N/A* | *N/A* | *Show and enable for any status other than �Withdrawn�, �Draft� and �Archived�.* | *More statuses might be considered in later stages.* |
| *Reinstate Application* | *Button* | *User* | *N/A* | *N/A* | *Show and enable only if the application status is �Withdrawn�.* | *A configurable reinstatement cut-off can be defined per cycle in a later stage; for now, the only condition is the status.* |
| *Edit Preferences* | *Button* | *User* | *N/A* | *N/A* | *Show and enable for any status other than �Withdrawn,� �Draft,� and �Archived,� and the grace period date has not been reached.* | *Only for residency and fellowship programs.* |
| *Exclude Training Site* | *Button* | *User* | *N/A* | *N/A* | *Show and enable for any status other than �Withdrawn�, �Draft� and �Archived,� && Edit preference is no longer enabled && there are multiple sites for any specialty.* | *While editing preferences is still possible, the user can modify and reorder specialties and sites. Once disabled, the user can only exclude a previously selected site.* |
| *Appeal* | *Button* | *User* | *N/A* | *N/A* | *Show and enable only when portfolio scores are published and within the 48-hour appeal window if the user didn�t appeal before.* | *Appeal is allowed only one time. Will be explained further in an upcoming user story.* |
| *Appeal Deadline* | *Date/Time* | *System* | *Empty* | *N/A* | *Show during appeal window* | *Calculated from the initial announcement timestamp and configured appeal duration.* |

***Candidate Views Application Details [US-1.2.2]***

|  |  |
| --- | --- |
| ***User Story*** | *As a candidate, I want to view the details of an existing application so that I can review what I have prepared or submitted.* |
| ***Acceptance Criteria*** | 1. *Given an existing application, when candidate opens it, then the platform displays it in read-only mode.* 2. *Given the read-only view, when the candidate navigates the tabs, then all fields are visible but disabled.* 3. *Given the read-only view, when the candidate attempts to edit, then the platform prevents the change.* 4. *Given any action is applicable, when the candidate opens it, then the platform displays it as a shortcut.* |
| ***Notes*** | 1. *The read-only view is the same form used for completion and edit rendered with all inputs disabled.* 2. *The list of actions in the dashboard view is also reflected in the application details view, if relevant.* 3. *The view mode applies to any status.* |

***Candidate Manages a Drafted Application [US-1.2.3]***

|  |  |
| --- | --- |
| ***User Story*** | *As a candidate, I want to resume or discard a drafted application so that I can complete or remove it as needed.* |
| ***Acceptance Criteria*** | 1. *Given a saved draft, when the candidate resumes it, then the platform restores the draft for editing.* 2. *Given a completed draft, when the candidate finishes it, then the platform allows to pay and submit.* 3. *Given a saved draft, when the candidate chooses to discard, then the platform prompts for confirmation.* 4. *Given a discard is confirmed, when the action completes, then the platform removes the draft.* 5. *Given a discard is confirmed, when the action completes, then the platform updates status to Archived.* 6. *Given the candidate cancels the discard prompt, when the action closes, then the draft remains intact.* 7. *Given a draft is discarded, when the dashboard reloads, then "Start New Application" becomes enabled.* |
| ***Notes*** | 1. *The "save as draft" action itself and it rules are covered under the Prepare and Submit step.* 2. *Archived applications are blocked, and no actions can be performed on them but still visible in view mode.* 3. *All actions or updates on application data or status part of this user story and subsequent ones must be logged in the audit log with all the information required, including the user and the time and date.* |

***Candidate Withdraws an Application [US-1.2.4]***

|  |  |
| --- | --- |
| ***User Story*** | *As a candidate, I want to withdraw my application so that I can exit the cycle when I no longer wish to proceed.* |
| ***Acceptance Criteria*** | 1. *Given application in any withdrawable status, when candidate views actions, then Withdraw is available.* 2. *Given application in withdrawable status, when candidate Withdraw, then platform prompts for reason.* 3. *Given candidate confirms, when triggered, then platform sends OTP to the registered email and number.* 4. *Given a valid OTP entered, when submitted, then the platform sets the application status to Withdrawn.* 5. *Given OTP is invalid or expired, when submitted, then it rejects the withdrawal and shows a clear reason.* 6. *Given candidate clicks "Resend Code", when the cooldown has passed, then platform issues a new OTP.* 7. *Given withdrawal is completed, when status is updated, then email notification is sent to candidate.* 8. *Given withdrawal is completed, when status is updated, then email notification is sent to admission team.* |
| ***Notes*** | 1. *Admission team notification specifies both the officer who handled the application and their supervisor.* 2. *Refer to the data dictionary in the US-1.2.1 user story for the withdrawable statuses.* 3. *OTP behavior mirrors the current Dubai Health OTP flow.* 4. *Application fee is non-refundable if withdrawn. This info should be included in the confirmation message.* |

***<u>Withdrawal pop-up Data Dictionary:</u>*** *When a candidate decides to withdraw an application, the reason must be recorded, and a confirmation message should be displayed following UX standards.*

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Withdrawal Reason* | *List* | *User* | *N/A* | *Yes* | *Show and enable if the withdrawing action is permitted.* | *List: Not Meeting Eligibility Criteria,*  *Joining Another Training Program,*  *Personal Reasons,*  *Financial Reasons,*  *Scholarship Opportunity, and*  *Others.* |
| *Other Reason* | *Text* | *User* | *N/A* | *Yes, if Other is selected* | *Show and enable if Other is selected* | *Don�t allow less than 3-letter entry or specific words like �Reason� or �NA.* |

***Candidate Reinstates Application [US-1.2.5]***

|  |  |
| --- | --- |
| ***User Story*** | *As a candidate, I want to reinstate a withdrawn application so that I can return to the cycle if I change my mind.* |
| ***Acceptance Criteria*** | 1. *Given application status isn�t withdrawn, when candidate views actions, then Reinstate action is hidden.* 2. *Given application status is withdrawn, when candidate views actions, then Reinstate action is available.* 3. *Given candidate clicks Reinstate, when confirmed, then platform prompts for a mandatory justification.* 4. *Given a justification is entered, when submitted, then it routes the request to the Supervisor for review.* 5. *Given the reinstate is submitted, when status is updated, then email notification is sent to Supervisor.* 6. *Given candidate has another active application, when reinstated, then it blocks the action and displays a message.* |
| ***Notes*** | 1. *Reinstatement is allowed for applications in �Withdrawn� status as long as we are still in same cycle.* 2. *A configurable reinstatement cut-off can be defined per cycle in later stage (can be date or status).* 3. *The supervisor approval and rejection flow is covered under the Application Verification epic.* |

***<u>Reinstate pop-up Data Dictionary:</u>*** *When a candidate decides to reinstate an application, the reason must be recorded, and a confirmation message should be displayed following UX standards.*

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Reinstatement Justification* | *Text* | *User* | *N/A* | *Yes* | *Show and enable if the reinstating action is permitted.* | *Don�t allow less than 3-letter entry or specific words like �Reason� or NA.* |

***Candidate Edits Preferences [US-1.2.6]***

|  |  |
| --- | --- |
| ***User Story*** | *As a candidate, I want to update my specialty preferences so that I can change my choices before the submission window and grace period officially closes.* |
| ***Acceptance Criteria*** | 1. *Given Edit Preferences isn�t allowed, when candidate views actions, then Edit Preferences is hidden.* 2. *Given Edit Preferences is allowed, when candidate views actions, then Edit Preferences is available.* 3. *Given Edit Preferences is clicked, when the panel opens, then the platform displays current preferences.* 4. *Given panel is opened, when preferences displayed, then the platform displays current sites as well.* 5. *Given panel is opened, when preferences displayed, then platform allows reorder/remove/replace.* 6. *Given panel is opened, when sites displayed for each preference, then it allows reorder/remove/replace.* 7. *Given a change is made, when the candidate saves, then the platform validates the new selection.* 8. *Given the new selection is valid, when saved, then the platform updates the preferences.* |
| ***Notes*** | 1. *Edit is permitted while the application is in any status other than �Withdrawn,� �Draft,� and �Archived,� provided the submission grace period has not passed, and the program has multiple specialty preferences.* 2. *Preference rules per program are explained under the Prepare and Submit step.* 3. *This action does not change the application status.* 4. *The candidate can select the same training site, but only for different specialties.* |

***Candidate Appeals a Decision [US-1.2.7]***

|  |  |
| --- | --- |
| ***User Story*** | *As a candidate, I want to appeal a portfolio scoring decision so that my scoring can be reviewed within the configured 48-hour window.* |
| ***Acceptance Criteria*** | 1. *Given appeal window is open, when candidate views the result, then platform displays Appeal action and deadline.* 2. *Given appeal is not allowed, when candidate views actions, then the Appeal action is hidden.* 3. *Given appeal is allowed, when candidate views actions, then the Appeal action is available.* 4. *Given Appeal is clicked, when panel opens, then platform displays the portfolio section in read-only mode.* 5. *Given panel is opened, when candidate views, then questions, answers, scores, comments are displayed.* 6. *Given comments are reviewed, when candidate flags one, then platform requests mandatory response.* 7. *Given all responses are entered, when candidate submit, then platform displays confirmation message.* 8. *Given candidate confirms, when validation passes, then platform records the appeal and updates status.* 9. *Given appeal is submitted, when completed, then it routes appealed questions to 2nd Evaluation Referee.* |
| ***Notes*** | 1. *Only the final-round score should be visible to the candidate; internal round scores should not be visible.* 2. *Only questions answered �Yes� and not receiving a full score should be eligible for flagging.* 3. *No new attachments are permitted during the appeal process.* 4. *Appeals allowed within 48 hours after scores are published, provided no previous appeal has been made.* 5. *The appeal review and rescore by 2nd Evaluation Referee is explained later under a separate epic.* |

***<u>Appeal Screen Data Dictionary:</u>*** *When a candidate decides to appeal a score, they must be able to view all questions, answers, comments, and have a flag and response option for each comment, in line with UX standards.*

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Appeal Description (Response)* | *Text* | *User* | *N/A* | *Yes, if a question is flagged.* | *Show and enable if a question is flagged.* | *The maximum length for the text is 200 characters.* |

***Candidate Exclude Training Site [US-1.2.8]***

|  |  |
| --- | --- |
| ***User Story*** | *As a candidate, I want to exclude a previously selected training site so that I can withdraw from a specific training site while remaining in the admission cycle.* |
| ***Acceptance Criteria*** | 1. *Given this is allowed, when candidate views actions, then the Exclude Training Site action is available.* 2. *Given candidate clicks it, when panel opens, then platform displays selected sites grouped by specialty.* 3. *Given panel is opened, when available sites appear, then it allows selection of one/more sites for exclusion* 4. *Given a selected site is the only remaining site under its specialty, when candidates attempt to exclude it, then the platform prevents the action and displays a message.* 5. *Given they attempt to add new site, when panel displayed, then it doesn�t provide any option to add.* 6. *Given they attempt to modify, replace, or reorder specialties or preferences, when panel displayed, then the platform does not provide such options.* 7. *Given at least one valid site remains under each specialty, when they confirm, then platform removes the selected training site(s).* 8. *Given exclusion completed successfully, when platform updates, then status remains unchanged.* 9. *Given exclusion completed successfully, when the platform updates, then it notifies the admission team.* 10. *Given exclusion completed successfully, when return to dashboard, then updated list of sites is displayed.* |
| ***Notes*** | 1. *This action is only available when Edit Preferences is disabled, status isn't draft, archived, or withdrawn.* 2. *The action permits exclusion of previously selected training sites only.* 3. *Specialties and preferences cannot be added, removed, replaced, or reordered through this action.* 4. *At least one training site must remain assigned to each specialty at all times.* 5. *Exclusion is permitted at any point before the start date of the academic year.-* |

***<u>Excluding Site pop-up Data Dictionary:</u>*** *When a candidate decides to exclude a site from the application, the reason for the whole action must be recorded, and a confirmation message should be displayed in line with UX standards.*

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Excluding Reason* | *Text* | *User* | *N/A* | *Yes, if there are excluded sites.* | *Show and enable, if there are excluded sites.* | *N/A* |

# ***Prepare and Submit Application [STP-1.3]***

*The candidate prepares the application by selecting the program and preferences, accepting the terms and conditions, and completing the required sections, including personal, academic, professional, portfolio, and preference-related or medical information. The form is multi-step; tabs, sections, fields, and validations depend on the selected program, nationality, the country of the qualifying institution, and similar attributes. When the candidate logins via UAE Pass, the applicable identity fields are pre-filled from ICP and displayed as disabled, unless the expected values could not be retrieved or in other exception cases, which will be described later in this document. The candidate can save a draft at any time, pay the application fee, and submit the application. Once submitted, most tabs become read-only and the application enters the admission workflow.*

*Business Rules:*

1. *Field visibility and mandatory rules depend on the program, residency status, nationality, and similar attributes.*
2. *Where the candidate signed up via UAE Pass, applicable identity fields are pre-populated from ICP when available.*
3. *Only one active application per cycle is supported.*
4. *Terms and Conditions must be accepted before the candidate can proceed with filling out the form and submitting.*
5. *The Portfolio section is a one-time, non-editable submission; once submitted, the candidate can�t return to modify it.*
6. *Internship Information applies to Residency (except Pharmacy) and Fellowship applications only; its not applicable to Internship applications.*
7. *The Residency Information section applies to Fellowship applications only.*
8. *The Board and License information applies to Fellowship applications only.*
9. *The Residency Entrance Exam section applies to Residency applications only.*
10. *For Medical Residency, the accepted entrance exams are EMREE or SMLE.*
11. *For Dental Residency, the accepted entrance exams are EDREE or SDLE.*
12. *For Pharmacy Residency, the accepted entrance exams are EPREE.*
13. *Education Credential Evaluators (ECE) GPA on a 4.0 scale is mandatory when the qualifying institution is outside the UAE.*
14. *For UAE-based institutions, GPA is accepted as a percentage or on a 4.0 scale.*
15. *Entrance Exam and GPA are auto-converted, and the score is displayed to candidate based on the program's criteria and weight.*
16. *The list of documents required is filtered by the applied-for program and by relevant candidate�s data.*
17. *Reminders are sent automatically every configurable N of days while application remains in Draft.*
18. *3 days before the grace period, an automatic reminder should be sent for the candidate while application remains in Draft.*
19. *A final reminder is sent automatically one day before the grace period deadline while application remains in Draft.*
20. *Unsubmitted applications are auto-archived after the grace period deadline; the candidate is notified when their draft is archived.*
21. *Payment of the application fee is mandatory for submission.*
22. *Once submitted, all tabs are read-only.*
23. *Candidates should be able to navigate between tabs without forcing them to complete one to move on.*

***Candidate Selects Program, Specialty, and Sites [US-1.3.1]***

|  |  |
| --- | --- |
| ***User Story*** | *As a candidate, I want to select the GME program, specialty preferences, and training sites so that I can apply to the most relevant specialties and training locations available in the admission cycle.* |
| ***Acceptance Criteria*** | 1. *Given the dashboard, when candidate starts new application, then platform prompts program category.* 2. *Given a program has no active specialties, when the list loads, then the platform omits it.* 3. *Given a program is selected, when displayed, then platform prompts for applicable number of specialties.* 4. *Given a program is selected, when displayed, the platform lists the specialties of that program.* 5. *Given a specialty has no active sites, when the list loads, then the platform omits it.* 6. *Given a specialty is selected, when processed, then platform displays training sites available for specialty.* 7. *Given a specialty is selected, when displayed, then platform requires selection of one/more sites.* 8. *Given more than one site is selected, when done, then the candidate can order these sites per specialty.* 9. *Given a site is selected, when proceeds, then platform associates site(s) with specialty preference.* 10. *Given site is selected more than once for same specialty, when proceeds, then it prevents with message.* 11. *Given both specialty preferences are the same, when candidate proceeds, then it prevents with message.* 12. *Given selections are complete, when candidate proceeds, then the platform creates application record.* 13. *Given selections are complete, when candidate proceeds, then the platform opens the correct form.* 14. *Given mandatory fields are incomplete or invalid, when proceeds, then the platform highlights it.* 15. *Given a field needs guidance, when the candidate hovers on info icon, then the platform shows a tooltip.* |
| ***Notes*** | 1. *Any application with Certificate (Medical Laboratory) will follow the same logic, rules, validations and weights as the Internship (Dental) in all upcoming user stories.* 2. *The program list, specialties and sites are configured and mapped. See appendix.* 3. *Internship and pharmacy residency programs and have one specialty (preference),* 4. *Medical and Dental residency and fellowship programs can have two.* 5. *The first specialty (preference) always serves as reference, while the second one, if present, is optional.* 6. *Preferences may be reordered later on the Preferences tab (US-1.3.11).* 7. *The requirement for tooltips, completion, and any validation highlighting applies across all screens and sections in the upcoming user stories.* |

***<u>Program Selection Data Dictionary:</u>***

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Program* | *DDL* | *User* | *Empty* | *Yes* | *Enabled* | *List: Certificate, Internship, Medical Residency, Dental Residency, Pharmacy Residency, and lastly Fellowship.* |
| *Preference 1* | *DDL* | *User* | *Empty* | *Yes* | *Enabled* | *List of specialties for the selected program. See the appendix for the specialty-per-program matrix.* |
| *Preference 1 Training Sites* | *DDL* | *User* | *Empty* | *At least one selection* | *Show and enable if the specialty is selected* | *List to be provided in the appendix and mapped to the programs and specialties.* |
| *Preference 2* | *DDL* | *User* | *Empty* | *No* | *Show and enable if the program has two preferences* | *Different from Preference 1. Recorder is available on the Preferences tab.* |
| *Preference 2 Training Sites* | *DDL* | *User* | *Empty* | *At least one selection* | *Show and enable if the specialty is selected* | *List to be provided in the appendix and mapped to the programs and specialties.* |

***Candidate Completes Application Information [US-1.3.2]***

|  |  |
| --- | --- |
| ***User Story*** | *As a candidate, I want to complete the application information section so that the platform captures the key details about my application before I proceed.* |
| ***Acceptance Criteria*** | 1. *Given a new application, when opened, then the platform displays Application Information section.* 2. *Given a new application, when opened, the candidate can display all sections of the applications.* 3. *Given section is opened, when displayed, then the platform pre-populate some identifiers.* 4. *Given program and specialty selected, when processed, then platform updates Candidate Status values.* 5. *Given status is an internal candidate or employee, when selected, then ID number become mandatory.* 6. *Given the status is external candidate, when selected, then no ID information is required.* 7. *Given Sponsorship question answered "Yes", when selected, then Sponsor info becomes required.* 8. *Given program and specialty selected, when processed, then platform shows a specific question list.* 9. *Given some questions answered Yes, when selected, related attachment becomes required.* 10. *Given the terms are displayed, when read, then the platform shows the mandatory acceptance checkbox.* 11. *Given that section opens, when displayed, the attachments sub-section appears.* 12. *Given a conditional document, when scenario indicates it is required, then platform marks it mandatory.* 13. *Given a conditional document, when scenario indicates it optional, then platform marks it as optional.* 14. *Given a conditional document, when the scenario indicates it�s not required, then platform hides it.* 15. *Given file exceeds configured size limit 2 MB, when uploaded, then platform rejects it and shows message.* 16. *Given a file not matching configured format, when uploaded, then platform rejects it and shows message.* 17. *Given the candidate clicks Preview, when triggered, the platform opens the uploaded file in a viewer.* 18. *Given the candidate clicks Delete on uploaded file, when confirmed, then the platform removes the file.* 19. *Given required attachments are missing, when candidate proceeds, then the platform highlights it.* 20. *Given data exists, when program or specialty changed, then platform warns that data may be lost.* |
| ***Notes*** | 1. *Not all questions require attachment as evidence; if answered yes, refer to the data dictionary.* 2. *The full terms and conditions wording is provided in the appendix.* 3. *The first specialty (preference) always serves as reference, while the second one, if present, is optional.* 4. *This section's fields pertain specifically to application details, not candidate's academic or personal info.* 5. *The requirement and behavior of attaching documents applies across all screens and sections in the upcoming user stories.* 6. *Personal statements are required per specialty per training site: the platform generates one upload slot for each specialty�site combination selected in US-1.3.1 and adjusts the slots when preferences or sites change.* |

***<u>Application Information Data Dictionary:</u>***

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Application ID* | *Text* | *System* | *Unique ID assigned when the form is opened* | *Yes* | *Disabled* | *Format: Candidate ID-G(Admission Cycle)  Example 123456789-G27* |
| *Application Creation Date* | *Date* | *System* | *The date the form was opened* | *Yes* | *Disabled* | *DD/MM/YYYY.* |
| *Application Submission Date* | *Date* | *System* | *The date the application is submitted successfully* | *Yes* | *Disabled* | *DD/MM/YYYY. Empty until submission.* |
| *Admission Cycle* | *DDL* | *System* | *The active cycle for the selected program* | *Yes* | *Disabled* | *YYYY/YYYY.* |
| *Program* | *DDL* | *System* | *As per the previous selection* | *Yes* | *Enabled* | *Values from US-1.3.1.* |
| *Preference 1* | *DDL* | *User* | *As per the previous selection* | *Yes* | *Enabled* | *List of specialties for the selected program. See the appendix for the specialty-per-program matrix.* |
| *Preference 1 Training Sites* | *DDL* | *User* | *Empty* | *At least one selection* | *Show and enable if the specialty is selected* | *List to be provided in the appendix and mapped to the programs and specialties.* |
| *Preference 2* | *DDL* | *User* | *As per the previous selection* | *No* | *Show and enable if the program requires two preferences* | *Different from Preference 1. Recorder is available on the Preferences tab.* |
| *Preference 2 Training Sites* | *DDL* | *User* | *Empty* | *At least one selection* | *Show and enable if the specialty is selected* | *List to be provided in the appendix and mapped to the programs and specialties.* |
| *Candidate Status* | *DDL* | *User* | *Empty* | *Yes* | *Enabled* | *The list is populated based on the program and specialty. See appendix.* |
| *ID Number* | *Text* | *User* | *Empty* | *Yes, for any Candidate Status other than External Candidate.* | *Show and enable for any Candidate Status other than External Candidate.* | *According to the business team, this field will capture all necessary ID numbers, regardless of status type. Please refer to the appendix for details.* |
| *Will an external entity or your employer sponsor your training?* | *Radio* | *User* | *Empty* | *Yes* | *Enabled* | *List: Yes, No.* |
| *Sponsor Type* | *DDL* | *User* | *Empty* | *Yes, if Sponsorship is Yes* | *Show and enable if Sponsorship is Yes* | *List: Governmental, Non-Governmental.* |
| *Sponsor Name* | *Text* | *User* | *Empty* | *Yes, if Sponsorship is Yes* | *Show and enable if Sponsorship is Yes* | *N/A* |
| *Q1: Are you currently employed?* | *Radio* | *User* | *Empty* | *Yes* | *Enabled* | *List: Yes, No. Available for residency and fellowship only.* |
| *Employment Letter* | *File* | *User* | *Empty* | *Yes, if the previous question's answer is Yes.* | *Show and enable if the previous question's answer is Yes.* | *PDF.* |
| *Q2: Are you currently registered in MBRU Residency Program?* | *Radio* | *User* | *Empty* | *Yes* | *Enabled* | *List: Yes, No. Available for residency and fellowship only.* |
| *No Objection Letter* | *File* | *User* | *Empty* | *Yes, if the previous question's answer is Yes.* | *Show and enable if the previous question's answer is Yes.* | *PDF.* |
| *Have you ever been denied a medical license or had your license revoked, limited, restricted, or suspended?* | *Radio* | *User* | *No* | *Yes* | *Enabled* | *List: Yes, No. Available for all programs and specialties.* |
| *Have you ever been placed on academic probation in a training program?* | *Radio* | *User* | *No* | *Yes* | *Enabled* | *List: Yes, No. Available for all programs and specialties.* |
| *Have you ever been dismissed from an appointment to residency, fellowship or professional employment?* | *Radio* | *User* | *No* | *Yes* | *Enabled* | *List: Yes, No. Available for all programs and specialties.* |
| *Do you have any pending or previous professional misconducts?* | *Radio* | *User* | *No* | *Yes* | *Enabled* | *List: Yes, No. Available for all programs and specialties.* |
| *Terms and Conditions Text* | *Label* | *System* | *As per the appendix* | *N/A* | *N/A* | *Full text is provided in the appendix.* |
| *Acceptance Statement* | *Label* | *System* | *"I, <Candidate Full Name>, hereby confirm that I have read and accept the above terms."* | *N/A* | *N/A* | *Candidate Full Name is auto-populated.* |
| *Acceptance Checkbox* | *Checkbox* | *User* | *Unchecked* | *Yes* | *Enabled* | *Must be checked to proceed.* |

*Application Attachments*

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Personal Statement � 1st Preference (one per selected training site)* | *File* | *User* | *Empty* | *Yes, one per training site selected under Preference 1* | *Enabled* | *Show on Application Information section* |
| *Personal Statement � 2nd Preference (one per selected training site)* | *File* | *User* | *Empty* | *Yes, when there is a second preference: one per training site selected under Preference 2* | *Show and enable when we have two preferences* | *Show on Application Information section* |
| *CV* | *File* | *User* | *Empty* | *Yes* | *Enabled* | *Show on Application Information section* |
| *Recommendation Letter � 1st Preference* | *File* | *User* | *Empty* | *Yes, for Residency and Fellowship* | *Show and enable for Residency and Fellowship* | *Show on Application Information section* |
| *Recommendation Letter � 2nd Preference* | *File* | *User* | *Empty* | *Yes, when we have two preferences* | *Show and enable when we have two preferences* | *Show on Application Information section* |

***Candidate Completes Personal Information [US-1.3.3]***

|  |  |
| --- | --- |
| ***User Story*** | *As a candidate, I want to complete my personal information so that the platform captures my identity, contact details, and next-of-kin details.* |
| ***Acceptance Criteria*** | 1. *Given the section opens, when displayed, then the platform shows sub-sections to group the information.* 2. *Given the section opens, when displayed, then identity info sub-section appears first.* 3. *Given EID is expired, when section opens, then ICP fields become editable.* 4. *Given valid EID and UAE Pass login, when section opens, then ICP fields are pre-populated and disabled.* 5. *Given ICP fields, when section opens, then these fields are highlighted to indicate auto-retrieval.* 6. *Given ICP fields fails for any exception, when section opens, then these fields should be editable.* 7. *Given UAE nationality, when section loads, then UAE national-related fields appear and become required.* 8. *Given residents of the UAE, when section loads, then visa-related fields appear and become required.* 9. *Given mother of UAE Nationals, when section loads, then attachments for verification become required.* 10. *Given the section opens, when displayed, then contact info sub-section appears with option to modify it.* 11. *Given contact email and mobile appears, when updated, then OTP is required to ensure they�re correct.* 12. *Given the section opens, when displayed, then the Next of Kin sub-section appears to capture its details.* 13. *Given that section opens, when displayed, the attachments sub-section appears.* |
| ***Notes*** | 1. *Sub-sections are a visual grouping; the section is one continuous form. Applicable as per UX standards.* 2. *ICP pre-population applies only to those who signed up and logged in via UAE Pass.* 3. *The exception scenarios to handle in ICP-sourced fields retrieval:*  * *Candidates who previously lived in the UAE but later left the country may have an expired Emirates ID. In cases where the Emirates ID is expired, no data should be retrieved from ICP, and the candidate should proceed with manual data entry.* * *If passport information retrieved from ICP is expired, those fields should remain editable to allow the candidate to provide updated details.* * *If duplicate ICP profiles are detected, no data should be fetched automatically.* * *If certain fields in ICP are blank or incomplete, those specific fields should remain editable in the application.* * *If the ICP API is unavailable for any reason, the candidate must still be able to proceed with the application by manually entering their information. The system should not block submission due to integration failure.* |

***<u>Personal Information Data Dictionary:</u>***

*Identity:*

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| *Name* | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *English First Name* | *Text* | *User/ICP* | *ICP: As per what was retrieved*  *Non ICP: Empty* | *Yes* | *ICP: Disabled*  *Non ICP: Show and enable.* | *Language validation. Note for users: Please write full name as per passport.*  *Capitalize the first letter of each part of a name, regardless of how it was originally typed or retrieved.* |
| *English Middle Name* | *Text* | *User/ICP* | *ICP: As per what was retrieved*  *Non ICP: Empty* | *No* | *ICP: Disabled*  *Non ICP: Show and enable.* | *If populated from ICP, the second, third, and fourth names appear in this field, separated by spaces. Language validation.*  *Capitalization.* |
| *English Last Name* | *Text* | *User/ICP* | *ICP: As per what was retrieved*  *Non ICP: Empty* | *Yes* | *ICP: Disabled*  *Non ICP: Show and enable.* | *Language validation. Capitalization.*  *Allow symbols in the Last Name.* |
| *Arabic First Name* | *Text* | *User/ICP* | *ICP: As per what was retrieved*  *Non ICP: Empty* | *No* | *Enabled* | *Language validation. Note for users: Please write full name as per passport.* |
| *Arabic Middle Name* | *Text* | *User/ICP* | *ICP: As per what was retrieved*  *Non ICP: Empty* | *No* | *Enabled* | *If populated from ICP, the second, third, and fourth names appear in this field, separated by spaces. Language validation.* |
| *Arabic Last Name* | *Text* | *User/ICP* | *ICP: As per what was retrieved*  *Non ICP: Empty* | *No* | *Enabled* | *Language validation.* |
| *Date of Birth* | *Date* | *User/ICP* | *ICP: As per what was retrieved*  *Non ICP: Empty* | *Yes* | *ICP: Disabled*  *Non ICP: Show and enable.* | *DD/MM/YYYY. Must be in the past.* |
| *Gender* | *Radio* | *User/ICP* | *ICP: As per what was retrieved*  *Non ICP: Empty* | *Yes* | *ICP: Disabled*  *Non ICP: Show and enable.* | *List: Male, Female.* |
| *Marital Status* | *DDL* | *User/ICP* | *ICP: As per what was retrieved*  *Non ICP: Empty* | *Yes* | *Enabled* | *List: Single, Married, Divorced, Widowed.* |
| *Nationality* | *DDL* | *User/ICP* | *ICP: As per what was retrieved*  *Non ICP: Empty* | *Yes* | *ICP: Disabled*  *Non ICP: Show and enable.* | *List to be extracted from the current system. Must map to ICP standard list.* |
| *Are you a child of a UAE National mother who holds a Family Book?* | *Radio* | *User* | *Empty* | *Yes, if the nationality is anything other than UAE* | *Show and enable for any nationality other than UAE* | *List: Yes or No.*  *Note: If yes, then the Birth Certificate and Mother Family Book attachments become required.* |
| *Do you have Marsoom?* | *Radio* | *User* | *No* | *Yes, if nationality is not UAE.* | *Show and enable if nationality is not UAE.* | *List: Yes, No.* |
| *Country of Residence* | *DDL* | *User/ICP* | *ICP: UAE*  *Non ICP: Empty* | *Yes* | *ICP: Disabled*  *Non ICP: Show and enable.* | *List to be extracted from the current system.* |
| *UAE City of Residence* | *DDL* | *User* | *Empty* | *Yes, if Country of Residence is UAE.* | *Show and enable if Country of Residence is UAE.* | *If Country of Residence is UAE, city is DDL of emirates.* |
| *Do you have an Emirates ID?* | *Radio* | *User/ICP* | *ICP: Yes*  *Non ICP: Empty* | *Yes* | *ICP: Disabled*  *Non ICP: Show and enable if the country of Residence is UAE.* | *List: Yes, No.* |
| *Emirates ID Number* | *EID* | *User/ICP* | *ICP: As per what was retrieved*  *Non ICP: Empty* | *Yes, if Do you have an Emirates ID is Yes* | *ICP: Disabled*  *Non ICP: Show and enable if Do you have an Emirates ID is Yes* | *EID format* |
| *Emirates ID Date of Expiry* | *Date* | *User/ICP* | *ICP: As per what was retrieved*  *Non ICP: Empty* | *Yes, if Do you have an Emirates ID is Yes* | *ICP: Disabled*  *Non ICP: Show and enable if Do you have an Emirates ID is Yes* | *DD/MM/YYYY.* |
| *Visa Unified Number* | *Number* | *User/ICP* | *ICP: As per what was retrieved*  *Non ICP: Empty* | *Yes, if Do you have an Emirates ID is Yes && Nationality is not UAE or GCC.* | *ICP: Disabled*  *Non ICP: Show and enable if Do you have an Emirates ID is Yes && Nationality is not UAE or GCC.* | *N/A* |
| *Visa File Number* | *Text* | *User/ICP* | *ICP: As per what was retrieved*  *Non ICP: Empty* | *Yes, if Country of Residence is UAE* | *ICP: Disabled*  *Non ICP: Show and enable if Do you have an Emirates ID is Yes && Nationality is not UAE or GCC.* | *N/A* |
| *Visa Place of Issue* | *DDL* | *User/ICP* | *ICP: As per what was retrieved*  *Non ICP: Empty* | *Yes, if Country of Residence is UAE* | *ICP: Disabled*  *Non ICP: Show and enable if Do you have an Emirates ID is Yes && Nationality is not UAE or GCC.* | *List of values as per the possible integration values.* |
| *Visa Expiry Date* | *Date* | *User/ICP* | *ICP: As per what was retrieved*  *Non ICP: Empty* | *Yes, if Country of Residence is UAE* | *ICP: Disabled*  *Non ICP: Show and enable if Do you have an Emirates ID is Yes && Nationality is not UAE or GCC.* | *DD/MM/YYYY.* |
| *Passport Number* | *Text* | *User/ICP* | *ICP: As per what was retrieved*  *Non ICP: Empty* | *Yes* | *Enabled* | *N/A* |
| *Passport Country of Issue* | *DDL* | *User/ICP* | *ICP: As per what was retrieved*  *Non ICP: Empty* | *Yes* | *Enabled* | *List to be extracted from the current system. Must map to ICP standard list.* |
| *UAE Passport City of Issue* | *DDL* | *User/ICP* | *ICP: As per what was retrieved*  *Non ICP: Empty* | *Yes, if Passport Country of Issue is UAE.* | *ICP: Disabled*  *Non ICP: Show and enable if Passport Country of Issue is UAE* | *If Passport Country of Issue is UAE, city is DDL of emirates.* |
| *Other Passport City of Issue* | *Text* | *User* | *Empty* | *Yes, Passport Country of Issue is not UAE.* | *Show and enable when Passport Country of Issue is not UAE.* | *N/A* |
| *Passport Date of Issue* | *Date* | *User/ICP* | *ICP: As per what was retrieved*  *Non ICP: Empty* | *Yes* | *Enabled* | *DD/MM/YYYY.* |
| *Passport Date of Expiry* | *Date* | *User/ICP* | *ICP: As per what was retrieved*  *Non ICP: Empty* | *Yes* | *Enabled* | *DD/MM/YYYY. Must be later than today.* |
| *Family Book City Number* | *Number* | *User* | *Empty* | *Yes, if Nationality is UAE* | *Show and enable if Nationality is UAE* | *N/A* |
| *Family ID* | *Number* | *User/ICP* | *ICP: As per what was retrieved*  *Non ICP: Empty* | *Yes, if Nationality is UAE* | *ICP: Disabled*  *Non ICP: Show and enable if Nationality is UAE* | *ICP related field: khulasitQaidNo* |
| *Passport Unified Number* | *Number* | *User/ICP* | *ICP: As per what was retrieved*  *Non ICP: Empty* | *Yes, if Nationality is UAE* | *ICP: Disabled*  *Non ICP: Show and enable if Nationality is UAE* | *ICP related field: UN for UAE Nationals (TBC)* |
| *Country of Birth* | *DDL* | *User/ICP* | *ICP: As per what was retrieved*  *Non ICP: Empty* | *Yes* | *ICP: Disabled*  *Non ICP: Show and enable* | *List to be extracted from the current system. Must map to ICP standard list.* |

*Contact Information:*

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Registered Email* | *Email* | *IDAM* | *Retrieved from IDAM* | *Yes* | *Disabled* | *Email format.* |
| *Registered Mobile Number* | *Phone* | *IDAM* | *Retrieved from IDAM* | *Yes* | *Disabled* | *Country code with flag precedes the phone.* |
| *Contact Email* | *Email* | *IDAM* | *Copied from Registered Email* | *Yes* | *Enabled, OTP is required if the email is updated.* | *Email format.* |
| *Contact Mobile Number* | *Phone* | *IDAM* | *Copied from Contact Mobile Number* | *Yes* | *Enabled, OTP is required if the mobile is updated.* | *Country code with flag precedes the phone.* |

*Next of Kin Information:*

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *First Name* | *Text* | *User* | *Empty* | *Yes* | *Enabled* | *N/A* |
| *Middle Name(s)* | *Text* | *User* | *Empty* | *No* | *Enabled* | *N/A* |
| *Surname* | *Text* | *User* | *Empty* | *Yes* | *Enabled* | *N/A* |
| *Relationship to Candidate* | *DDL* | *User* | *Empty* | *Yes* | *Enabled* | *List to be extracted from the current system.* |
| *Primary Telephone Contact* | *Phone* | *User* | *Empty* | *Yes* | *Enabled* | *Selectable country code with flag precedes the phone.* |
| *Primary Email* | *Email* | *User* | *Empty* | *Yes* | *Enabled* | *Email format.* |
| *Confirm Primary Email* | *Email* | *User* | *Empty* | *Yes* | *Enabled* | *Must match Primary Email.* |
| *Area of Residence* | *Text* | *User* | *Empty* | *Yes* | *Enabled* | *N/A* |

*Identification Attachments:*

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Personal Photo* | *File* | *User* | *Empty* | *Yes* | *Yes* | *Show on the Personal Information section* |
| *Colored Copy of the Passport* | *File* | *User* | *Empty* | *Yes* | *Yes* | *Show on the Personal Information section* |
| *Colored copy of Family Book* | *File* | *User* | *Empty* | *Yes, if nationality is UAE* | *Show and enable if nationality is UAE* | *Show on the Personal Information section* |
| *Colored copy of the Emirates ID (Both Sides)* | *File* | *User* | *Empty* | *Yes, if Do you have an Emirates ID is Yes* | *Show and enable if Do you have an Emirates ID is Yes* | *Show on the Personal Information section* |
| *Colored copy of a Marsoom* | *File* | *User* | *Empty* | *Yes, if Do you have Marsoom is Yes.* | *Show and enable if Do you have Marsoom is Yes.* | *Show on the Personal Information section* |
| *Mother Family Book* | *File* | *User* | *Empty* | *Yes, if Are you a child of a UAE National mother who holds a Family Book is Yes.* | *Show and enable if Are you a child of a UAE National mother who holds a Family Book Yes.* | *Show on the Personal Information section* |
| *Birth Certificate* | *File* | *User* | *Empty* | *Yes, if Are you a child of a UAE National mother who holds a Family Book is Yes.* | *Show and enable if Are you a child of a UAE National mother who holds a Family Book Yes.* | *Show on the Personal Information section* |
| *Colored Residency Visa* | *File* | *User* | *Empty* | *Yes, if Do you have an Emirates ID is Yes && Nationality is not UAE or GCC.* | *Show and enable if if Do you have an Emirates ID is Yes && Nationality is not UAE or GCC.* | *Show on the Personal Information section* |

***Candidate Completes University Grades [US-1.3.4]***

|  |  |
| --- | --- |
| ***User Story*** | *As a candidate, I want to enter my university academic details and GPA so that the platform can compute my GPA Shortlisting Score for the applied-for program.* |
| ***Acceptance Criteria*** | 1. *Given the section opens, when displayed, then the platform shows sub-sections to group the information.* 2. *Given sub-section opens, when displayed, then platform prompts for Country of the qualifying university.* 3. *Given candidate selects a University, when list loads, then values are filtered by the selected country.* 4. *Given candidate selects a Degree, when list loads, then values are filtered by the applied-for program.* 5. *Given country is UAE, when selected, then platform shows a GPA Type toggle Percentage or Scale of 4.* 6. *Given country is not UAE, when selected, then platform requires ECE GPA Scale of 4 and original GPA.* 7. *Given any Scale of 4 GPA entered, when done, then platform converts GPA to percentage using a rubric.* 8. *Given GPA is computed, when done, then platform displays GPA Shortlisting Score based on the weight.* 9. *Given GPA value outside expected range of selected Type, when entered, then platform shows warning.* 10. *Given that section opens, when displayed, the attachments sub-section appears.* |
| ***Notes*** | 1. *GPA conversion rules and per-program GPA weight in the shortlisting score explained in the appendix.* 2. *The GPA Result and GPA Shortlisting Score are shown as read-only; the candidate can�t edit them.* 3. *The candidate is expected to include their qualifying degree per the applied-for GME program.* |

***<u>Academic Information Data Dictionary:</u>***

*University Grades Information:*

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Country* | *DDL* | *User* | *Empty* | *Yes* | *Enabled* | *List to be extracted from the current system.* |
| *University* | *DDL* | *User* | *Empty* | *Yes* | *Enabled* | *List filtered by Country. Includes "Other".* |
| *Other University* | *Text* | *User* | *Empty* | *Yes, if University is Other* | *Show and enable if University is Other* | *N/A* |
| *Degree* | *DDL* | *User* | *Empty* | *Yes* | *Enabled* | *List filtered by applied-for program. To be extracted from current system.* |
| *Graduation Year* | *DDL* | *User* | *Empty* | *Yes* | *Enabled* | *YYYY. The maximum value is the current year.* |
| *Graduation Month* | *DDL* | *User* | *Empty* | *Yes* | *Enabled* | *1..12.* |
| *GPA Type* | *Radio* | *User* | *Percentage* | *Yes, if University in UAE* | *Show and enable if University in UAE* | *List: Percentage, Scale of 4. Shown when Country is UAE.* |
| *UAE University GPA Scale of 4* | *Numeric* | *User* | *Empty* | *Yes, if GPA Type is Scale of 4* | *Show and enable if GPA Type is Scale of 4* | *Decimal 0.00 to 4.00.* |
| *UAE University GPA Percentage* | *Numeric* | *User* | *Empty* | *Yes, if GPA Type is percentage* | *Show and enable if GPA Type is percentage* | *0..100* |
| *ECE GPA* | *Number* | *User* | *Empty* | *Yes, if Country is not UAE* | *Show and enable if Country is not UAE* | *Decimal 0.00 to 4.00.* |
| *Original GPA* | *Text* | *User* | *Empty* | *Yes, if Country is not UAE* | *Show and enable if Country is not UAE* | *Any format (Scale of 4.0, Percentage or Pass/Fail).* |
| *GPA Result* | *Label* | *System* | *Auto-calculated* | *N/A* | *Disabled* | *Percentage (e.g., 97.50%). Refer to the rubric in the appendix.* |
| *GPA Shortlisting Score* | *Label* | *System* | *Auto-calculated (using UAE GPA or ECE GPA based on country)* | *N/A* | *Disabled* | *Format: X.XX / Y (e.g., 34.13 / 35). Y is the program's GPA weight. Refer to the appendix for each program's weights.* |

*University Attachments:*

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Colored Copy of Graduation Certificate or Letter of Completion* | *File* | *User* | *Empty* | *Yes* | *Enabled* | *Show on Academic Information section* |
| *Colored Copy of Official Academic Transcript (all pages)* | *File* | *User* | *Empty* | *Yes* | *Enabled* | *Show on Academic Information section* |
| *Colored copy of Educational Credential Evaluators (ECE) � General with Grade Average* | *File* | *User* | *Empty* | *Yes, if Country is not UAE* | *Show and enable if Country is not UAE* | *Show on Academic Information section* |

***Candidate Completes English Proficiency Exam Information [US-1.3.5]***

|  |  |
| --- | --- |
| ***User Story*** | *As a candidate, I want to enter my English proficiency exam details so that the platform captures my language readiness for GME.* |
| ***Acceptance Criteria*** | 1. *Given sub-section opens, when displayed, then platform lists accepted exams applicable to programs.* 2. *Given a candidate selects an exam, when confirmed, then platform requires Date Taken and Result fields.* |
| ***Notes*** | 1. *Accepted exams for GME: Academic IELTS, TOEFL iBT, EmSAT-English, and OET.* 2. *English proficiency results are required for all programs, except for fellowships its available but optional.* 3. *English proficiency results are also optional if the nationality or university country is one of these (USA, UK, Canada, Australia, New Zealand, Ireland).* |

***<u>Academic Information Data Dictionary:</u>***

*English Proficiency Information:*

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Title of Exam* | *DDL* | *User* | *Empty* | *Yes, for any program other than a fellowship* | *Enabled* | *List: Academic IELTS, TOEFL iBT, OET, EmSAT-English.* |
| *Date Taken* | *Date* | *User* | *Empty* | *Yes, for any program other than fellowship* | *Enabled* | *DD/MM/YYYY.* |
| *Result* | *Numeric* | *User* | *Empty* | *Yes, for any program other than fellowship* | *Enabled* | *Academic IELTS: ?6.0 until 9.0*  *TOEFL iBT: ?80 until 120*  *EmSAT: ?1252*  *OET: minimum grade C+ (numeric score 300 or above) in each of Reading, Writing, Listening and Speaking* |
| *OET Reading Result* | *Numeric* | *User* | *Empty* | *Yes, if selected exam is OET* | *Show and enable if selected exam is OET* | *Minimum grade C+ (numeric score 300* |
| *OET Writing Result* | *Numeric* | *User* | *Empty* | *Yes, if selected exam is OET* | *Show and enable if selected exam is OET* | *Minimum grade C+ (numeric score 300* |
| *OET Listening Result* | *Numeric* | *User* | *Empty* | *Yes, if selected exam is OET* | *Show and enable if selected exam is OET* | *Minimum grade C+ (numeric score 300* |
| *OET Speaking Result* | *Numeric* | *User* | *Empty* | *Yes, if selected exam is OET* | *Show and enable if selected exam is OET* | *Minimum grade C+ (numeric score 300* |

*English Proficiency Attachment*

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Colored copy of English Proficiency Exam Certificate (IELTS/TOEFL/EmSAT)* | *File* | *User* | *Empty* | *Yes, if the entry was required as per the validations.* | *Enabled* | *Show on Academic Information section* |

***Candidate Completes Internship Information [US-1.3.6]***

|  |  |
| --- | --- |
| ***User Story*** | *As an candidate applying to a Residency or Fellowship program, I want to enter my internship experience details so that the platform captures the prior training required for eligibility.* |
| ***Acceptance Criteria*** | 1. *Given program is Internship, when section loads, then the platform hides this sub-section and skips it.* 2. *Given program is Residency (except Pharmacy) or Fellowship, when sub-section loads, then platform displays and requires it.* 3. *Given the candidate selects an Organization, when list loads, then platform shows qualified organizations.* 4. *Given Organization is MBRU, DHA, EHS, or DoH, when selected, then Location is set to UAE as read-only.* 5. *Given Organization is Other, when selected, then platform requires the country and the name.* |
| ***Notes*** | 1. *Internship info is only required for residency (except pharmacy) and fellowship programs.* |

***<u>Professional Experience Information Data Dictionary:</u>***

*Internship Information:*

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Organization Name* | *DDL* | *User* | *Empty* | *Yes* | *Enabled* | *List: MBRU, Dubai Health Authority, Emirates Health Services, Department of Health AD, Gulf Medical University, Ajman University, and others.* |
| *Other Organization Name* | *Text* | *User* | *Empty* | *Yes, if Organization Name is Other* | *Show and enable if Organization Name is Other* | *N/A* |
| *Location* | *DDL* | *System/User* | *United Arab Emirates if the organization is MBRU, DHA, EHS or DoH* | *Yes* | *Disabled if Organization is MBRU, DHA, EHS, Ajman, or GMU or DoH; Enabled if Other* | *List of countries when Other. Extracted from current system.* |
| *From Date* | *Date* | *User* | *Empty* | *Yes* | *Enabled* | *DD/MM/YYYY. Must be in the past.* |
| *To Date* | *Date* | *User* | *Empty* | *Yes* | *Enabled* | *DD/MM/YYYY. Later than From Date. Maybe in the future if ongoing.* |

*Internship Attachments:*

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Copy of Internship Certificate or Enrollment Letter (if current intern)* | *File* | *User* | *Empty* | *Yes, for Residency and Fellowship* | *Show and enable for Residency and Fellowship* | *Show on Professional Experience Information section* |

***Candidate Completes Residency Information [US-1.3.7]***

|  |  |
| --- | --- |
| ***User Story*** | *As a Fellowship candidate, I want to enter my residency training details so that the platform captures the completed residency required for fellowship eligibility.* |
| ***Acceptance Criteria*** | 1. *Given program is Internship or Residency, when sub-section loads, then platform hides this and skips it.* 2. *Given program is Fellowship, when sub-section loads, then the platform displays and requires it.* 3. *Given candidate selects a Specialty, when list loads, then platform views all applicable options.* |
| ***Notes*** | 1. *Fellowship's specialties are mapped to specific residency specialty groups. Refer to appendix.* |

***<u>Professional Experience Information Data Dictionary:</u>***

*Residency Information:*

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Specialty* | *DDL* | *User* | *Empty* | *Yes* | *Enabled* | *Refer to appendix.* |
| *Training Hospital* | *DDL* | *User* | *Empty* | *Yes* | *Enabled* | *Refer to the appendix for the list of UAE-accepted hospitals per entity + option to add Other for international hospitals.* |
| *Other Training Hospital* | *Text* | *User* | *Empty* | *Yes* | *Show and enable if the Training Hospital is Other* | *N/A* |
| *Training Country* | *DDL* | *User* | *United Arab Emirates if the hospital falling under MBRU, DHA, GMU EHS or DoH* | *Yes* | *Disabled if the hospital is falling under MBRU, DHA, EHS, or GMU or DoH; Enabled if Other* | *List to be extracted from the current system.* |
| *Completion Date* | *Date* | *User* | *Empty* | *Yes* | *Enabled* | *DD/MM/YYYY.* |

***Candidate Completes Board and License Information [US-1.3.8]***

|  |  |
| --- | --- |
| ***User Story*** | *As a Fellowship candidate, I want to enter my board certification and license details so that the platform captures the credentials required for fellowship eligibility.* |
| ***Acceptance Criteria*** | 1. *Given program is Internship or Residency, when sub-section loads, then the platform hides these.* 2. *Given program is Fellowship, when sub-section loads, then platform requires at least 1 board certificate.* 3. *Given program is Fellowship, when sub-section loads, then it allows to add multiple board certificates.* 4. *Given entry is displayed, when candidate completes it, then platform requires selection of applicable Tier.* 5. *Given candidate wants to select Board, when the list loads, then the platform shows the accepted boards.* 6. *Given Board name is selected, when done, then platform requires the exam details (pass/fail), attempts and dates.* 7. *Given program is Fellowship, when sub-section loads, then platform displays license info as optional.* 8. *Given candidate selects Authority, when the list loads, then the platform shows the accepted authorities.* 9. *Given Authority is selected, when done, then platform requires the license number and job title.* |
| ***Notes*** | 1. *Board certification is required at Tier 1 or Tier 2 level to qualify for fellowship admission per DHA.* 2. *Details of written exams and OSCEs, including results, dates taken, resit dates, are required for any entry.* 3. *License information (authority, license number, and job title) is optional.* |

***<u>Professional Experience Information Data Dictionary:</u>***

*Board Information - Same fields set for each entry:*

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Board Name* | *DDL* | *User* | *Empty* | *Yes* | *Enabled* | *List to be extracted from current system.* |
| *Did you sit the final written exam?* | *Radio* | *User* | *Empty* | *Yes* | *Enabled* | *List: Yes, No.* |
| *Scheduled Exam Date* | *Date* | *User* | *Empty* | *Yes, if Did you sit the final written exam is No* | *Show and enable if Did you sit the final written exam is No* | *DD/MM/YYYY. Must be in the future.* |
| *Exam Date* | *Date* | *User* | *Empty* | *Yes, if Did you sit the final written exam is Yes* | *Show and enable if Did you sit the final written exam is Yes* | *DD/MM/YYYY.* |
| *Exam Result* | *Radio* | *User* | *Empty* | *Yes, if Did you sit the final written exam is Yes* | *Show and enable if Did you sit the final written exam is Yes* | *List: Pass, Fail.* |
| *Written Exam Attempt Number* | *DDL* | *User* | *Empty* | *Yes, if Did you sit the final written exam is Yes* | *Show and enable if Did you sit the final written exam is Yes* | *List: 1, 2, 3, 4 (maximum four attempts).* |
| *OSCE Exam Date* | *Date* | *User* | *Empty* | *Yes, if Did you sit the final written exam is Yes* | *Show and enable if Did you sit the final written exam is Yes* | *DD/MM/YYYY.* |
| *OSCE Exam Attempt Number* | *DDL* | *User* | *Empty* | *Yes, if Did you sit the final written exam is Yes* | *Show and enable if Did you sit the final written exam is Yes* | *List: 1, 2, 3, 4 (maximum four attempts).* |
| *Resit Date* | *Date* | *User* | *Empty* | *Yes, if Exam Result is Fail* | *Show and enable if Exam Result is Fail* | *DD/MM/YYYY. Must be in the future.* |

*License Information:*

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Authority* | *DDL* | *User* | *Empty* | *No* | *Enabled* | *List: Dubai Health Authority, Emirates Health Services, Department of Health, Other.* |
| *Other Authority* | *Text* | *User* | *Empty* | *No* | *Show and enable if Authority is Other* | *N/A* |
| *License Number* | *Text* | *User* | *Empty* | *No* | *Enabled* | *N/A* |
| *Job Title* | *DDL* | *User* | *Empty* | *No* | *Enabled* | *List: Resident, Specialist, Consultant, Other.* |
| *Other Job Title* | *Text* | *User* | *Empty* | *No* | *Show and enable if Job Title is Other* | *N/A* |

*Board and License Attachments*

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Board Certificate / Letter of Completion / Enrollment Letter mentioning expected completion date* | *File* | *User* | *Empty* | *Yes, for Fellowship* | *Show and enable for Fellowship* | *Show on Professional Experience Information section* |
| *Second written exam passing letter from PD or DIO (confirming Part 2 and OSCE exam status)* | *File* | *User* | *Empty* | *Yes, for Fellowship and exam is passed* | *Show and enable for Fellowship* | *Show on Professional Experience Information section* |
| *Transcript from the training center or Program Director* | *File* | *User* | *Empty* | *No* | *Show and enable for Fellowship* | *Show on Professional Experience Information section* |
| *Valid Specialist/Consultant License* | *File* | *User* | *Empty* | *No* | *Show and enable for Fellowship* | *Show on Professional Experience Information section* |

***Candidate Completes Residency Entrance Exam Information [US-1.3.9]***

|  |  |
| --- | --- |
| ***User Story*** | *As a Residency candidate, I want to enter my entrance exam details so that the platform captures and converts my exam score into the Exam Shortlisting Score.* |
| ***Acceptance Criteria*** | 1. *Given program is Internship or Fellowship, when sub-section loads, then the platform hides it.* 2. *Given program is Residency, when sub-section loads, then the platform displays and requires it.* 3. *Given the specialty is medical, when the section loads, then the Type list: EMREE and SMLE.* 4. *Given the specialty is dental, when the section loads, then the Type list: EDREE and SDLE.* 5. *Given the specialty is pharmacy, when the section loads, then the Type list: EPREE.* 6. *Given Type is EPREE, EMREE or EDREE, when selected, then it requires Attempt, Exam Date, Percentile.* 7. *Given Type is SMLE or SDLE, when selected, then it requires Exam Date and Score.* 8. *Given any value outside expected range of selected Type, when entered, then platform shows warning* 9. *Given result computed, when done, then platform displays Exam Shortlisting Score based on the weight.* |
| ***Notes*** | 1. *All specialties should be categorized as medical or dental or pharmacy. Refer to appendix.* 2. *Conversion formulas per exam type are documented in the appendix.* 3. *The Exam Shortlisting Score is shown as a read-only label.* 4. *The candidate is expected to select the right exam as per the applied-for program and specialty.* |

***<u>Professional Experience Information Data Dictionary:</u>***

*Residency Entrance Exam Data Dictionary:*

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Type* | *DDL* | *User* | *Empty* | *Yes* | *Enabled* | *List: For Medical � EMREE, SMLE. For Dental � EDREE, SDLE. For Pharmacy � EPREE* |
| *Attempt* | *DDL* | *User* | *Empty* | *Yes, if Type is EMREE, EPREE or EDREE* | *Show, if Type is EMREE, EPREE or EDREE* | *List: First, Second, Third and Beyond.* |
| *Examination Date* | *Date* | *User* | *Empty* | *Yes* | *Enabled* | *DD/MM/YYYY. Must be in the past.* |
| *Percentile Rank* | *Number* | *User* | *Empty* | *Yes, if Type is EMREE, EPREE or EDREE* | *Show if Type is EMREE, EPREE or EDREE* | *0-100.* |
| *Score* | *Number* | *User* | *Empty* | *Yes* | *Enabled* | *EMREE: 60-100*  *EPREE: 55-100*  *EDREE: 65-100*  *SDLE: 560-800*  *SMLE: 560-800* |
| *Entrance Exam Shortlisting Score* | *Label* | *System* | *Auto-calculated* | *N/A* | *Disabled* | *Format: X.XX / Y (e.g., 27.30 / 35). Y is the program's Exam weight.*  *Formulas in the appendix.* |

*Residency Entrance Exam Attachments*

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Exam Statement of Result* | *File* | *User* | *Empty* | *Yes, for Residency* | *Show and enable for Residency* | *Show on Professional Experience Information section* |

***Candidate Completes Portfolio Information [US-1.3.10]***

|  |  |
| --- | --- |
| ***User Story*** | *As a candidate, I want to complete the portfolio section by answering the program-specific questions and attaching the supporting evidence so that referees can score my portfolio.* |
| ***Acceptance Criteria*** | 1. *Given section opens, when displayed, then platform shows a one-time submission warning.* 2. *Given section opens, when displayed, then platform shows program�s portfolio question set and points.* 3. *Given a question is displayed, when candidate answers Yes, then platform requires details and evidence.* 4. *Given a question is displayed, when candidate answers No, then platform doesn�t require any details.* 5. *Given candidate proceeds from section, when triggered, then platform shows a confirmation pop-up.* |
| ***Notes*** | 1. *The full portfolio question sets; the exact wording, and points mentioned below.* 2. *Each question evidences (fields or attachments) mentioned below.* 3. *Portfolio is a one-time submission; can�t modify it later, even if application is sent back for correction.* 4. *Points here are indicative only; the composite portfolio score is calculated at back-office referee scoring process.* 5. *Portfolio section review is referees' responsibility not the admission team. To be explained in next epics.* 6. *Confirmation pop-up should list each question number, answer, and whether attachments are provided.* |

***<u>Portfolio Information Data Dictionary:</u>***

*Fellowship Portfolio*

|  |  |  |
| --- | --- | --- |
| ***Question Title*** | ***Scoring Platform Questions*** | ***Candidate Comment*** |
| *Q1) Were you able to publish a research article in a peer reviewed journal?*  *Fellowship Score: 5 Points* | *Research Link (single link); Name of the Journal; Article Title; Date of Publication* | *Manuscript Document.* |
| *Q2) Were you able to publish an additional peer-reviewed research article in the subspecialty program you are applying to?*  *Fellowship Score: 5 Points* | *Research Link; Name of Journal; Article Title; Date of Publication.*  *Different entry from Q1.* | *Manuscript Document.* |
| *Q3) Have you participated in teaching activities? (e.g. Training of Trainers courses, teaching junior residents or medical interns/students, leading teaching programs or contributing to curriculum development.)*  *Fellowship Score: 5 Points* | *Activity Name; Role; From Date; To Date.* | *Certificate.*  *Note to add: Certificate must include Date, Stamp, Signature, Candidate's Name & Role. Only one certificate.* |
| *Q4) Have you participated in leadership activities? (e.g. Serving on departmental or institutional committees related to clinical governance, quality, or patient safety, chief resident role, or being an executive member of a council, or coordinating health-related educational or community events)*  *Fellowship Score: 5 Points* | *Activity Name; Role; From Date; To Date.* | *Certificate.*  *Note to add: Certificate must include Date, Stamp, Signature, Candidate's Name & Role. Only one certificate.* |
| *Q5) Have you participated in any system-based practices? (e.g. patient safety initiative, quality improvement project, or audit)*  *Fellowship Score: 5 Points* | *Activity Provider Name; Activity Name; Role; Date.* | *Certificate.*  *Note to add: Certificate must include Date, Stamp, Signature, Candidate's Name & Role. Only one certificate.* |
| *Q6) Do you hold additional academic qualifications, diplomas, or professional certifications beyond core medical training?*  *Fellowship Score: 5 Points* | *None* | *Certificate.* |

*Internship and Residency Portfolio Details*

|  |  |  |
| --- | --- | --- |
| ***Question Title*** | ***Required fields if answered Yes*** | ***Required attachments if answered Yes*** |
| *Q1) Were you able to publish a research article in a peer reviewed journal?*  *Medical Internship Score: 7 Points*  *Dental Internship Score: 4 Points*  *Residency Score: 6 Points* | *Research Link (single link); Name of the Journal (Text); Article Title (Text); Date of Publication (Date); Role (DDL: Writing a Proposal, Collecting Data, Analyzing Data, Writing a Manuscript or Other 'a pop-up box appears for the candidate to manually enter the role')* | *Manuscript Document.* |
| *Q2) Have you participated in research activity (writing proposal, collecting data, analyzing data and writing a manuscript) whether published or not?*  *Medical Internship Score: 4 Points*  *Dental Internship Score: 2 Points*  *Residency Score: 4 Points* | *Role (DDL: Writing a Proposal, Collecting Data, Analyzing Data, Writing a Manuscript or Other 'a pop-up box appears for the candidate to manually enter the role')* | *Ethical Approval; Proposal; Letter of Supervisor.* |
| *Q3) Have you presented in a scientific event (conference/symposium/workshop)?*  *Medical Internship Score: 4 Points if Oral Presentation is selected, 3 Points if Poster Presentation or Workshop Conduction or Other is selected.*  *Dental Internship Score: 4 Points if Oral Presentation is selected, 3 Points if Poster Presentation or Workshop Conduction or Other is selected.*  *Residency Score: 4 Points if Oral Presentation is selected, 3 Points if Poster Presentation or Workshop Conduction or Other is selected.* | *Presentation Type (DD: Oral Presentation, Poster Presentation or Workshop Conduction, or Other 'a pop-up box appears for the candidate to manually enter the role')* | *Certificate.* |
| *Q4) Did you actively participate in any health related voluntary/community activities since entry to medical/dental school? (e.g. Breast cancer campaign, smoking cessation program, disease awareness day, health education media programs, humanitarian missions, etc.)*  *Medical Internship Score: 4 Points*  *Dental Internship Score: 2 Points*  *Residency Score: 2 Points* | *Campaign Provider Name; Campaign Name; Campaign Date. Note for user: Certificate must include date, stamp, signature, health campaign provider.* | *Certificate.* |
| *Q5) Did you actively participate in another health related voluntary/community activities since entry to medical/dental school? (e.g. Breast cancer campaign, smoking cessation program, disease awareness day, health education media programs, humanitarian missions, etc.)*  *Medical Internship Score: 4 Points*  *Dental Internship Score: 2 Points*  *Residency Score: 2 Points* | *Campaign Provider Name; Campaign Name; Campaign Date. Different from Q4.* | *Certificate.* |
| *Q6) Did you attend skill enhancement courses (such as Advanced life support, Point-of-Care Ultrasound Certificate (POCUS), Leadership, Quality etc) since entry to medical/dental school?*  *Medical Internship Score: 4 Points*  *Dental Internship Score: 2 Points*  *Residency Score: 2 Points* | *None* | *Certificate.* |
| *Q7) Did you attend another skill enhancement courses (such as Advanced life support, Point-of-Care Ultrasound Certificate (POCUS), Leadership, Quality etc) since entry to medical/dental school?*  *Medical Internship Score: 4 Points*  *Dental Internship Score: 2 Points*  *Residency Score: 2 Points* | *Different from Q6* | *Certificate.* |
| *Q8) Have you received any awards or honors for academic achievements since entry to medical/dental school. (e.g. Dean list, Best paper, Best research, Best presentation etc)*  *Medical Internship Score: 6 Points if Dean�s List or Graduation Honors like Merit, Honors, Distinction, 4 Points for others.*  *Dental Internship Score: 6 Points if Dean�s List or Graduation Honors like Merit, Honors, Distinction, 4 Points for others.*  *Residency Score: 5 Points if Dean�s List or Graduation Honors like Merit, Honors, Distinction 4 Points for others.* | *Award Type (DDL: Dean�s List, Graduation Honors like Merit, Honors, Distinction, Competitive Prize/Top 5 rank for, Research, Paper Award, Oral or Poster Presentation Award).* | *Certificate.* |
| *Q9) Have you participated in any extracurricular activities since entering medical or dental school? (e.g. clinical attachments, summer placements, teaching, serving as a council member, or other related experiences)*  *Medical Internship Score: Don�t show the question, Not Applicable.*  *Dental Internship Score: Don�t show the question, Not Applicable.*  *Residency Score: 2 Points* | *None* | *Certificate.* |
| *Q10) Have you participated in another extracurricular activities since entering medical or dental school? (e.g. clinical attachments, summer placements, teaching, serving as a council member, or other related experiences)*  *Medical Internship Score: Don�t show the question, Not Applicable.*  *Dental Internship Score: Don�t show the question, Not Applicable.*  *Residency Score: 2 Points* | *None* | *Certificate.* |

***Candidate Saves Draft [US-1.3.11]***

|  |  |
| --- | --- |
| ***User Story*** | *As a candidate, I want to save my in-progress application as a draft and come back to it later so that I can complete the application at my own pace without losing my work.* |
| ***Acceptance Criteria*** | 1. *Given candidate on any tab, when click Save, then platform saves data as a draft without validations.* 2. *Given a save is successful, when it completes, then the platform shows a confirmation message.* 3. *Given filling in progress, when auto-save interval reaches, then platform silently save data in background.* 4. *Given a draft has remained inactive for N days, when reminder job runs, then platform sends an email.* 5. *Given grace period deadline is 3 day away, when reminder job runs, then platform sends warning reminder.* 6. *Given grace period deadline is one day away, when reminder job runs, then platform sends final reminder.* 7. *Given grace period deadline has passed, when the archive job runs, then platform archives all drafts.* 8. *Given draft has been auto-archived, when the job completes, then platform notifies candidate by email.* 9. *Given candidate wants to discard draft, when confirmed, then platform removes it as defined in US-1.2.3.* |
| ***Notes*** | 1. *Save Draft is available from every tab and never blocks the candidate on missing or invalid data.* 2. *Auto-save runs silently in the background at a configurable interval (e.g., every 3 minutes).* 3. *Reminder cadence is every N days after the last activity, plus warning 3 days before the deadline and final reminder one day before the deadline.* 4. *Reminders are configurable on program level.* 5. *Auto-archive runs after grace period and archives all unsubmitted drafts, then notifies candidates.* 6. *Only one active draft per program per cycle is supported.* 7. *Reminders content and any other notification content will be captured in the appendix.* |

***Candidate Pays Fees and Submits Application [US-1.3.12]***

|  |  |
| --- | --- |
| ***User Story*** | *As a candidate, I want to pay the application fee and submit the application so that my payment is recorded and my application is officially received by GME.* |
| ***Acceptance Criteria*** | 1. *Given candidate reaches Submit Application, when it loads, then platform displays Application Summary.* 2. *Given candidate reaches Submit Application, when it loads, then platform displays Payment details.* 3. *Given any missing info, when candidate clicks Pay & Submit, then the platform blocks the action.* 4. *Given any missing info, when candidate clicks Pay & Submit, then platform highlights the tab and field.* 5. *Given all validations pass, when candidate clicks Pay & Submit, then platform show confirmation prompt.* 6. *Given the candidate confirms, when triggered, then the platform routes to the payment gateway.* 7. *Given payment is successful, when confirmed by gateway, then platform show receipt information.* 8. *Given receipt is received, when confirmed, then platform submit the application.* 9. *Given receipt is received when confirmed, then platform update application status to Submitted.* 10. *Given status is Submitted, when confirmed, then platform send notification to candidate.* 11. *Given status is Submitted, when confirmed, then platform show count of new applications on dashboard.* 12. *Given status is Submitted, when confirmed, then the platform stores all attachments in FileNet.* 13. *Given status is Submitted, when confirmed, then platform updates Verification Status to Pending.* 14. *Given status is Submitted, when confirmed, then platform updates Portfolio Score Status to Pending.* 15. *Given application is submitted, when the candidate returns to the form, then all tabs are read-only.* 16. *Given payment fails, when returned from gateway, then platform keeps application as draft.* 17. *Given payment fails, when returned from gateway, then platform shows clear message with Retry option.* |
| ***Notes*** | 1. *Payment is mandatory for GME submission; the candidate can�t submit without a successful payment.* 2. *The admission team and referees will have in dashboard an indicator to display the number of new applications submitted that entered the pool. This number will be updated daily.* 3. *Internship application fees are 230 AED, while residency and fellowship fees are 650 AED.* 4. *Only one scenario involve seat reservation fees, which will be detailed in the next release: dental interns must pay 5,000 AED. The other programs under GME do not charge fees for the programs; instead, candidates receive payment.* 5. *The current payment experience is preserved as is.* 6. *Payment status is tracked independently of application status.* 7. *Application Submission Date is generated on Submit.* 8. *The process of migrating attachments to FileNet will remain unchanged; the only addition is enforcing proper naming conventions to easily identify the documents.* |

***<u>Application Summary and Payment Information:</u>***

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Application Number* | *Label* | *System* | *As per the application* | *N/A* | *Disabled* | *E.g., 20260000014.* |
| *Create Date* | *Label* | *System* | *As per the application* | *N/A* | *Disabled* | *DD/MM/YYYY* |
| *Submit Date* | *Label* | *System* | *Auto-set on successful payment* | *N/A* | *Disabled* | *DD/MM/YYYY* |
| *Status* | *Label* | *System* | *Auto-set on successful payment* | *N/A* | *Disabled* | *Full status list in the appendix.* |
| *Bill Amount* | *Label* | *System* | *As per program fee configuration* | *N/A* | *Disabled* | *Currency: AED.* |
| *Bill Status* | *Label* | *System* | *As per the current system* | *N/A* | *Disabled* | *List: N/A, Pending and Paid* |
| *Payment Date* | *Label* | *System* | *Auto-set on successful payment* | *N/A* | *Disabled* | *DD/MM/YYYY* |

***Finance Team Views Application Payments [US-1.3.13]***

|  |  |
| --- | --- |
| ***User Story*** | *As a finance officer, I want to view and search payment transactions so that I can monitor application fees, reconcile payments, and export payment records for reporting purposes.* |
| ***Acceptance Criteria*** | 1. *Given finance officer logs into the platform, when payment screen loads, then platform displays list view.* 2. *Given list is displayed, when loaded, then it shows filters for Cycle, Program, ID, From Date, and To Date.* 3. *Given finance officer selects one/more filters, when Search, then platform displays only matching results.* 4. *Given an Application ID is entered, when Search, then platform returns matching record if found.* 5. *Given a payment date is provided, when Search, then platform returns records within the specified range.* 6. *Given search results returned, when displayed, then the platform shows Application key info.* 7. *Given search results are displayed, when the finance officer reviews them, then all columns are read-only.* 8. *Given record is displayed, when officer clicks on row, then it doesn�t navigate to application details.* 9. *Given results are displayed, when officer clicks Export, then it exports the displayed results to an Excel.* 10. *Given payment status is updated by gateway, when record refreshed, then it displays the latest bill status.* |
| ***Notes*** | 1. *The login process should follow a role-based approach, similar to the Admission Officer Login user story.* 2. *Finance officer should have access solely to this view and be restricted from viewing any other screens.* 3. *Application key info: Application ID, English Full Name, Email, Program, Fee Type, Bill Status, Bill Amount, and Payment Date.* 4. *The Finance Team has read-only access to payment information.* 5. *Finance users can't open, view, edit, verify, shortlist, score, rank, or otherwise access application details.* 6. *The screen is intended for payment reconciliation and reporting purposes only.* |

***<u>Payments List View Information:</u>***

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Admission Cycle* | *DDL* | *User* | *Current admission cycle* | *No* | *Enabled* | *List of configured admission cycles.* |
| *Program* | *DDL* | *User* | *Empty* | *No* | *Enabled* | *List of GME programs available for the selected admission cycle.* |
| *Application ID* | *Text* | *User* | *Empty* | *No* | *Enabled* | *Searches by the unique application ID.* |
| *From Date* | *Date* | *User* | *Empty* | *No* | *Enabled* | *Start of the payment-date search range. DD/MM/YYYY.* |
| *To Date* | *Date* | *User* | *Empty* | *No* | *Enabled* | *End of the payment-date search range. DD/MM/YYYY. Must be equal to or later than From Date.* |
| *Export to Excel* | *Button* | *User* | *N/A* | *N/A* | *Show and enable when search results are displayed.* | *Exports only the records returned by the current search criteria.* |
| *Application ID* | *Label* | *System* | *As per the application* | *N/A* | *Disabled* | *Read-only. The value is not a link and can�t be used to open the application.* |
| *English Full Name* | *Label* | *System* | *As per the candidate�s application* | *N/A* | *Disabled* | *Read-only. Displays the candidate�s complete English name.* |
| *Email* | *Label* | *System* | *As per the candidate�s application* | *N/A* | *Disabled* | *Read-only. Displays the candidate�s registered email.* |
| *Program* | *Label* | *System* | *As per the application* | *N/A* | *Disabled* | *Read-only.* |
| *Fee Type* | *Label* | *System* | *As per the applicable fee* | *N/A* | *Disabled* | *Read-only. Application Submission Fee.* |
| *Bill Status* | *Label* | *System* | *As received from the payment gateway* | *N/A* | *Disabled* | *Read-only. Values follow the payment process.* |
| *Bill Amount* | *Label* | *System* | *As per the applicable fee configuration* | *N/A* | *Disabled* | *Read-only. Currency: AED.* |
| *Payment Date* | *Label* | *System* | *Auto-set on successful payment* | *N/A* | *Disabled* | *Read-only. DD/MM/YYYY and time.* |

# ***Application Verification Epic [EPIC-02]***

# ***Access and View Dashboards [STP-2.1]***

*The Admission officers and admission supervisors access the platform via Dubai Health IDAM and land on role-specific dashboards. Officers see the applications assigned to their queue and pool, key insights about the application counts, and the actions available on each. Supervisors see the wider view: pools overview by program and specialty, officer workload, and the queues that require their decision (escalations, screen-out recommendations, reinstatement requests).*

*Business Rules:*

1. *Access is delegated to Dubai Health IDAM and controlled by platform role (Admission Officer or Admission Supervisor).*
2. *An admission officer sees only the applications they retrieved from their assigned pool (program + first preference specialty).*
3. *The admission officers should not see the sites chosen by the candidate.*
4. *An admission supervisor sees all applications, all officers, and all pools within scope.*
5. *The candidate portfolio section is never visible for admission; it is reserved for the referee role.*
6. *The Central Monitor has read-only access and cannot retrieve, assign, reassign, return, or verify any applciation.*

***Admission Officer Logins to the Platform [US-2.1.1]***

|  |  |
| --- | --- |
| ***User Story*** | *As an admission officer, I want to login using my Dubai Health IDAM credentials so that I can access the admission workspace.* |
| ***Acceptance Criteria*** | 1. *Given authenticated IDAM user with officer role, when they access the platform, then it grants access.* 2. *Given an authenticated user without officer role, when they access the platform, then it denies access.* 3. *Given a session timeout, when user returns, then the platform redirects to IDAM for re-authentication.* 4. *Given a successful login, when session starts, then the platform routes the user to role-specific dashboard.* 5. *Given the user holds multiple roles, when session starts, then platform shows a role switcher.* |
| ***Notes*** | 1. *Login is fully delegated to IDAM; all screens, fields, validations, and rules are owned by IDAM.* 2. *Admission Officer and Admission Supervisor roles are provisioned in the platform.* 3. *Forgot password, remember me, account lockout, and similar capabilities are handled by IDAM.* |

***Admission Officer Views the Admission Dashboard [US-2.1.2]***

|  |  |
| --- | --- |
| ***User Story*** | *As an admission officer, I want to view my dashboard so that I can see the applications retrieved from my pool and take action on them.* |
| ***Acceptance Criteria*** | 1. *Given successful officer login, when dashboard loads, then platform displays their* ***Pool Insights.*** 2. *Given successful officer login, when dashboard loads, then it displays key* ***Personal Queue Insights****.* 3. *Given a successful officer login, when dashboard loads, then platform displays the officer's* ***Inbox****.* 4. *Given inbox loads, when displayed, then it displays Retrieve Application option.* 5. *Given inbox loads, when displayed, then retrieved ones are ordered by due date (oldest first).* 6. *Given inbox loads, when displayed, then key information per application is shown as per data dictionary.* 7. *Given a column header, when clicked, then the inbox sorts ascending or descending by that column.* 8. *Given a column filter, when applied, then the inbox shows only applications matching the selected values.* 9. *Given the search field, when the officer enters a term, then the inbox filters matching applications.* 10. *Given a personal insight is clicked, when inbox loads, then it shows the applications list for that category.* 11. *Given the officer chooses logout, when confirmed, then the session ends.* |
| ***Notes*** | 1. *Pool and Queue Insights provides the workload and application count hints. Refer to the data dictionary.* 2. *Admission officer responsible for a specific program and specialty only views the insights related to them.* 3. *If an officer is assigned to multiple pools, the numbers appear are the sum of all assigned pools.* 4. *The inbox includes only applications retrieved by the officer from their assigned pool(s).c* 5. *The admission officer should never see the sites chosen by the candidate under any circumstances.* 6. *Application Verification Status and Portfolio Score Status will be explained in the upcoming user stories.* |

***<u>Admission Officer Dashboard Data Dictionary:</u>***

*Pool insights for each program and specialty combination.*

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Submitted* | *Label* | *System* | *The total count of applications with verification status is Pending* | *N/A* | *N/A* | *Application still in the pool.* |
| *Under Verification* | *Label* | *System* | *The total count of all applications with verification status is In Progress, Clarification Submitted, Re-evaluating and Correction Submitted* | *N/A* | *N/A* | *The applications are currently under review by the admission team.* |
| *Pending*  *With Candidate* | *Label* | *System* | *The total count of all applications with verification status Correction Required.* | *N/A* | *N/A* | *Applications submitted for candidates to review and correct.* |
| *Screened Out* | *Label* | *System* | *The total count of all applications with verification status Pending Screen Out Approval and Screened Out* | *N/A* | *N/A* | *If an application is screened out but portfolio scoring is not completed, then it disappears from the referee pool. If the supervisor reinstates it before the deadline, it returns to its prior scoring status.* |
| *Completed* | *Label* | *System* | *The total count of all applications with verification status is Complete* | *N/A* | *N/A* | *Applications successfully passed the verification phase.* |

*Personal Queue insights: These figures indicate the number of applications currently assigned or assigned to me, not pool numbers.*

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *In Progress Application* | *Label* | *System* | *The total count of all application with verification status In Progress* | *N/A* | *N/A* | *The new fetch application count is currently awaiting action from the officer.* |
| *Pending Response* | *Label* | *System* | *The total count of all application with verification status Correction Required.* | *N/A* | *N/A* | *Waiting the candidate to do the required correction.* |
| *Pending with Supervisor* | *Label* | *System* | *The total count of all applications with verification status Pending Clarification and Pending Screen Out Approval.* | *N/A* | *N/A* | *This refers to applications that are either awaiting supervisor approval after being screened out or have been escalated.* |
| *Resubmitted By Candidate* | *Label* | *System* | *The total count of all applications with verification status Correction Submitted* | *N/A* | *N/A* | *The number of applications resubmitted by the candidate.* |
| *Resubmitted By Supervisor* | *Label* | *System* | *The total count of all applications with verification status Clarification Submitted and Re-evaluating* | *N/A* | *N/A* | *The number of applications resubmitted by the supervisor* |
| *Completed Applications* | *Label* | *System* | *The total count of all applications with verification status Complete* | *N/A* | *N/A* | *The total number of applications successfully verified and not screened out.* |
| *Screened Out Application* | *Label* | *System* | *The total count of all applications with verification status Screen Out.* | *N/A* | *N/A* | *Only the finalized applications with a final decision of screen out after supervisor endorsement.* |
| *Auto Returned To Pool* | *Label* | *System* | *The total count of all applications where the verification status was In Progress then Pending.* | *N/A* | *N/A* | *To track all the applications that have been missed the due date for that officer.* |

*Inbox:*

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Application ID* | *Label* | *System* | *As per the application* | *N/A* | *N/A* | *Read-only.* |
| *Candidate Name* | *Label* | *System* | *As per the application* | *N/A* | *N/A* | *Read-only.* |
| *Program* | *Label* | *System* | *As per the application* | *N/A* | *N/A* | *Read-only.* |
| *Submission Date* | *Label* | *System* | *As per the application* | *N/A* | *N/A* | *Read-only. DD/MM/YYYY.* |
| *Retrieval Date* | *Label* | *System* | *Auto-set on retrieval* | *N/A* | *N/A* | *Read-only. DD/MM/YYYY.* |
| *Due Date* | *Label* | *System* | *Auto-set on retrieval based on configuration* | *N/A* | *N/A* | *Read-only. DD/MM/YYYY. Default is retrieval date + 5 working days.* |
| *Application Status* | *Label* | *System* | *As per the application* | *N/A* | *N/A* | *Read-only.* |
| *GPA Shortlisting Score* | *Label* | *System* | *Auto-computed on application submission* | *N/A* | *N/A* | *Read-only.* |
| *Exam Shortlisting Score* | *Label* | *System* | *Auto-computed on application submission* | *N/A* | *Show and enable if the program is Residency.* | *Read-only.* |
| *Portfolio Status* | *Label* | *System* | *As per the application* | *N/A* | *N/A* | *N/A* |

***Admission Supervisor Views the Supervisor Dashboard [US-2.1.3]***

|  |  |
| --- | --- |
| ***User Story*** | *As an admission supervisor, I want to view my dashboard so that I can monitor the officers' workload, act on escalated and screen-out queues, and process reinstatement requests.* |
| ***Acceptance Criteria*** | 1. *Given successful supervisor login, when dashboard loads, then platform displays* ***All Pools*** *I****nsights.*** 2. *Given successful supervisor login, when dashboard loads, then it displays their* ***Personal Queue******insights.*** 3. *Given successful supervisor login, when dashboard loads, then platform displays the* ***Supervisor's Inbox.*** 4. *Given the dashboard loads, when displayed, then it shows the supervisor the* ***Officers Workload panel****.* 5. *Given the dashboard loads, when displayed, then it shows the supervisor the* ***Referees Workload panel****.* 6. *Given the dashboard loads, when all components appear, then the platform allows supervisor to filter it.* 7. *Given filters clicked, when it loads, then it allow supervisor to filter by cycle, program, and specialty.* 8. *Given the supervisor chooses logout, when confirmed, then the session ends.* |
| ***Notes*** | 1. *The login process should follow a role-based approach, similar to the Admission Officer Login user story.* 2. *Supervisor is responsible for overseeing all applications, not just for a specific program or specialty.* 3. *Supervisor views all pools insights, personal queue insights, their inbox, Officers and Referees Workloads' panels.* 4. *Referees� Workload Panel is explained later in this document.* 5. *The supervisor's inbox includes all Escalation, Screen Out, and Reinstatement requests.* 6. *The Pools Insights, Queue and Inbox behaviors are similar to the Admission Officer dashboard.* 7. *The search, filter, sort, and overall behavior of inbox follow the same principles as officer�s inbox behavior.* 8. *The Officer Workload Panel is explained in upcoming user stories.* |

***<u>Admission Supervisor Dashboard Data Dictionary:</u>*** *The pool insights view similar to the Admission Officer Dashboard but with ability to see all pools across programs and specialties. If nothing is selected, then the default is across all programs and specialties.*

*Personal Queue insights:*

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Total Complete* | *Label* | *System* | *The total count of all application where the verification status were Clarification Submitted, Re-evaluating and Screen Out* | *N/A* | *N/A* | *This counts the total applications in which the supervisor clarified something for the officer or approved or rejected a screen out decision.* |
| *Total Screened Out* | *Label* | *System* | *The total count of all application where the verification status is Screen Out* | *N/A* | *N/A* | *This counts the total applications in which the supervisor approved a screen out decision.* |
| *Pending Escalated Applications* | *Label* | *System* | *The total count of all application with verification status Pending Clarification.* | *N/A* | *N/A* | *This refers to applications where the officer lacks clarity about specific information in the application.* |
| *Pending Screened Out Applications* | *Label* | *System* | *The total count of all application with verification status Pending Screen Out Approval.* | *N/A* | *N/A* | *This refers to applications where the officer screens out candidates, but the final decision should be by supervisor.* |
| *Pending Reinstatement Applications* | *Label* | *System* | *The total count of all reinstatement requests from candidates and status is Submitted* | *N/A* | *N/A* | *This refers to the requests made by the candidate to reinstate a withdrawn application.* |
| *Total Reinstated Applications* | *Label* | *System* | *The total count of all reinstatement requests from candidates and status is Approved* | *N/A* | *N/A* | *This refers to the requests approved by the supervisor.*  *It should go back to the last status before withdrawal.* |
| *Total Re-instatement Rejected* | *Label* | *System* | *The total count of all reinstatement requests from candidates and status is Rejected* | *N/A* | *N/A* | *This refers to the requests rejected by the supervisor.* |

***Central Monitor Views the Site Monitoring Dashboard [US-2.1.4]***

|  |  |
| --- | --- |
| ***User Story*** | *As a Central Monitor, I want to view application volumes and verification progress across all training sites, so that I can monitor site interest and the distribution of applications throughout the verification process.* |
| ***Acceptance Criteria*** | 1. *Given Central Monitor role, when user accesses platform then it routes to Central Monitoring Dashboard.* 2. *Given dashboard loads, when displayed, then platform displays* ***All Pools Insights*** *regardless the site.* 3. *Given dashboard loads, when displayed, then platform shows* ***Training Site Interest by Specialty****.* 4. *Given chart is displayed, when rendered, then platform displays one bar/column per training site.* 5. *Given bar/columns is displayed when rendered, then it categorizes occurrences by specialty.* 6. *Given dashboard loads, when displayed, then platform shows* ***Site Applications by Status****.* 7. *Given dashboard loads, when displayed, then the platform shows the* ***Site Applications by Program****.* 8. *Given a pie chart is displayed, when rendered, then platform displays one segment per training site.* 9. *Given a pie chart is displayed, when rendered, then it categorizes occurrences by sites.* 10. *Given any segment in any chart, when clicked, then it displays applications included in* ***Applications List****.* 11. *Given Application List is displayed, when loaded, then platform shows the application key information.* 12. *Given application appears in list, when clicked, then it opens the application details in read-only mode.* 13. *Given dashboard loads, when all components appear, then the platform allows Central Monitor to filter it.* 14. *Given filters clicked, when it loads, then it allow Central Monitor to filter by cycle, program, and site.* 15. *Given one/more filters selected, when applied, then it refreshes all components based on selected filters.* 16. *Given no matching applications, when displayed, then it shows a zero value or appropriate empty state.* 17. *Given the Central Monitor chooses logout, when confirmed, then the session ends.* |
| ***Notes*** | 1. *Default view without filters is current cycle across all programs and sites.* 2. *The Central Monitor doesn�t have an operational inbox, personal queue, retrieval action, decision queue, or workload-management capability.* 3. *All pool insights are similar to the supervisor dashboard, same behavior and same counts, sites are not considered here.* 4. *Training Site Interest by Specialty uses occurrence counting. Each selected site-specialty combination contributes one occurrence to the chart.* 5. *Site Applications By Status uses unique application-site counting. If the same site appears under more than one specialty in one application, that application contributes only once to that site's count in the applicable status category.* 6. *Applications by Program uses unique-application counting as well. Each application contributes once to its program, regardless of the number of specialties or training sites selected.* 7. *The sums are not expected to equal the numbers in All Pool Insights because the charts count site-specialty selection occurrences.* |

***<u>Central Monitor Dashboard Data Dictionary:</u>***

*Training Site Interest by Specialty:*

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Training Site Interest by Specialty* | *2D Bar/Column Chart* | *System* | *All site-specialty selection occurrences matching the applied filters* | *N/A* | *N/A* | *X-axis: Training Site*  *Y-axis: Number of Site Selections*  *Series/stack color: Specialty* |
| *Training Site* | *Chart Category* | *System* | *As per the application's selected training sites* | *N/A* | *N/A* | *One bar or column per training site.* |
| *Specialty* | *Chart Series* | *System* | *As per the specialty associated with the selected site* | *N/A* | *N/A* | *Each specialty is represented as a separate series or category within the training-site bar or column.* |
| *Site-Specialty Selection Count* | *Numeric* | *System* | *Count of site-specialty occurrences* | *N/A* | *N/A* | *Counts each selected site-specialty combination as one occurrence.* |
| *Site-Specialty Drill-down* | *Chart Action* | *User* | *N/A* | *N/A* | *Enabled for each chart segment.* | *Opens the Application List View filtered by the selected Training Site and Specialty.* |

*Site Applications by Status:*

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Draft by Site* | *Pie Chart* | *System* | *Unique applications with Application Status = Draft, grouped by selected site* | *N/A* | *N/A* | *Each application is counted once per distinct site.* |
| *Submitted by Site* | *Pie Chart* | *System* | *Unique applications with Application Status = Submitted, grouped by selected site* | *N/A* | *N/A* | *Each application is counted once per distinct site.* |
| *Under Review by Site* | *Pie Chart* | *System* | *Unique applications with Application Status = Under Review, grouped by selected site* | *N/A* | *N/A* | *Each application is counted once per distinct site.* |
| *Correction Required by Site* | *Pie Chart* | *System* | *Unique applications with Application Status = Correction Required, grouped by selected site* | *N/A* | *N/A* | *Each application is counted once per distinct site.* |
| *Corrections Submitted by Site* | *Pie Chart* | *System* | *Unique applications with Application Status = Corrections Submitted, grouped by selected site* | *N/A* | *N/A* | *Each application is counted once per distinct site.* |
| *Complete by Site* | *Pie Chart* | *System* | *Unique applications with Application Status = Review Complete, grouped by selected site* | *N/A* | *N/A* | *Each application is counted once per distinct site.* |
| *Screened Out by Site* | *Pie Chart* | *System* | *Unique applications with Application Status = Screen Out, grouped by selected site* | *N/A* | *N/A* | *Each application is counted once per distinct site.* |
| *Training Site* | *Chart Segment* | *System* | *As per the application's distinct selected sites* | *N/A* | *N/A* | *One segment per training site.* |
| *Unique Application Count* | *Numeric* | *System* | *Count of unique Application IDs per status and site* | *N/A* | *N/A* | *The count as explained.* |
| *Site-Status Drill-down* | *Chart Action* | *User* | *N/A* | *N/A* | *Enabled for each chart segment* | *Opens the Applications List filtered by the selected Application Status and Training Site.* |

*Site Applications by Program:*

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Fellowship Applications by Site* | *Pie Chart* | *System* | *Unique Fellowship applications grouped by Training Site* | *N/A* | *N/A* | *Each segment represents a Training Site. Each application is counted once per distinct site.* |
| *Internship Applications by Site* | *Pie Chart* | *System* | *Unique Internship applications grouped by Training Site* | *N/A* | *N/A* | *Each segment represents a Training Site.* |
| *Pharmacy Residency Applications by Site* | *Pie Chart* | *System* | *Unique Pharmacy Residency applications grouped by Training Site* | *N/A* | *N/A* | *Each segment represents a Training Site.* |
| *Medical Residency Applications by Site* | *Pie Chart* | *System* | *Unique Medical Residency applications grouped by Training Site* | *N/A* | *N/A* | *Each segment represents a Training Site.* |
| *Dental Residency Applications by Site* | *Pie Chart* | *System* | *Unique Dental Residency applications grouped by Training Site* | *N/A* | *N/A* | *Each segment represents a Training Site.* |
| *Training Site* | *Chart Segment* | *System* | *As per the application's selected sites* | *N/A* | *N/A* | *One segment per Training Site within the selected Program pie chart.* |
| *Unique Application Count* | *Numeric* | *System* | *Count of unique Application IDs per Program and Site* | *N/A* | *N/A* | *The count as explained earlier.* |
| *Site Drill-down* | *Chart Action* | *User* | *N/A* | *N/A* | *Enabled for each segment* | *Opens the Applications List View filtered by the selected Program and Training Site.* |

*Applications List:*

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Application ID* | *Label/Link* | *System* | *As per the application* | *N/A* | *N/A* | *Read-only. Opens application details in read-only mode.* |
| *Candidate Name* | *Label* | *System* | *As per the application* | *N/A* | *N/A* | *Read-only.* |
| *Admission Cycle* | *Label* | *System* | *As per the application* | *N/A* | *N/A* | *Read-only.* |
| *Program* | *Label* | *System* | *As per the application* | *N/A* | *N/A* | *Read-only.* |
| *Application Status* | *Label* | *System* | *As per the application* | *N/A* | *N/A* | *Read-only.* |
| *Verification Status* | *Label* | *System* | *As per the application* | *N/A* | *N/A* | *Read-only.* |
| *Portfolio Score Status* | *Label* | *System* | *As per the application* | *N/A* | *N/A* | *Read-only.* |
| *Submission Date* | *Label* | *System* | *As per the application* | *N/A* | *N/A* | *Read-only. DD/MM/YYYY.* |

# ***Retrieve and Manage Applications from Pool [STP-2.2]***

*Each program-and-specialty combination has its own small pool. Applications are routed to the matching pool based on the candidate's program and first-preference specialty. Admission officers retrieve number (currently 10) of unique new applications from their pool at a time within a time window; they can retrieve more as long as the maximum remain 10. The admission supervisor monitors the officers' workload and progress and can reassign or return overdue applications when officers fall behind.*

*Business Rules:*

1. *Each program + first preference specialty combination has its own pool; applications are routed automatically on submission.*
2. *An admission officer can retrieve up to a configurable maximum number of applications at a time (default: up to 10).*
3. *An admission officer can fetch additional applications as long as the total number of unique new applications is capped at 10.*
4. *Each retrieved application has a configurable time-to-completion (default: 5 working days from retrieval date).*
5. *The count of applications and due dates no longer applies if officer returns the application to candidate or sends it for supervisor.*
6. *Retrieval within a pool is random from oldest to newest to prevent bias in assignment.*
7. *If the due date still not reached, the application is subject to reassignment or return to the pool by the supervisor.*
8. *If officer misses the due date, the application is returned to the pool automatically (except for scenarios where action was taken).*
9. *Any application returned to the pool should not be retrievable for the previous officer.*

***Admission Officer Retrieves Applications from Pool [US-2.2.1]***

|  |  |
| --- | --- |
| ***User Story*** | *As an admission officer, I want to retrieve applications from my assigned pool so that I can start reviewing them.* |
| ***Acceptance Criteria*** | 1. *Given pool has applications, when officer clicks Retrieve, then platform randomly fetch up to 10 from it.* 2. *Given officer has 10 In Progress applications, when they click Retrieve, then it blocks the action.* 3. *Given pool is empty, when officer clicks Retrieve, then platform shows an empty-pool message.* 4. *Given retrieval is successful, when completed, then platform records the retrieval date and sets due date.* 5. *Given retrieval is successful, when completed, then it updates application status to Under Review.* 6. *Given retrieval is successful, when completed, then it updates Verification status to In Progress.* 7. *Given retrieval is successful, when completed, then retrieved applications appear in the officer's inbox.* 8. *Given 5 working days pass, when status still In Progress, then platform sends it automatically to the pool.* 9. *Given pool has 35 unprocessed applications, when check runs, platform notifies the officers assigned to that pool.* |
| ***Notes*** | 1. *To retrieve, the application should be in the pool, which means the application status is Submitted.* 2. *Retrieval is random within officer's assigned pool in chronological order to prevent bias.* 3. *Default maximum retrieval cap is 10; configurable per pool.* 4. *Default time-to-completion is 5 working days from retrieval date; configurable per pool.* 5. *If the officer sends the application to the candidate or supervisor, the due date rule no longer applies.* 6. *Above applications goes back directly to the same officer not to the pool.* 7. *An officer's assigned pool(s) are configured.* 8. *The number of unprocessed applications required to trigger a reminder is 35 and it�s configured.* |

***<u>Application Information Data Dictionary:</u>***

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Verification Status* | *DDL* | *System* | *Pending* | *Yes* | *Disabled* | *Read-Only* |

***Admission Supervisor Monitors Officer Workload and Progress [US-2.2.2]***

|  |  |
| --- | --- |
| ***User Story*** | *As an admission supervisor, I want to monitor the officers' workload and progress so that I can identify overdue applications and take action.* |
| ***Acceptance Criteria*** | 1. *Given the dashboard loads, when displayed, then it shows the supervisor the Officers Workload panel.* 2. *Given panel expanded, when displayed, then it shows each officer's current personal queue state.* 3. *Given supervisor selects an officer, when displayed, then it lists all applications assigned to that officer.* 4. *Given list loads, when displayed, then key information per application is shown including all dates.* |
| ***Notes*** | 1. *Workload monitoring is real-time; refresh is on page load.* 2. *Workload Panel has two levels, personal queue insights, once expanded it shows officer�s inbox.* 3. *Supervisor should be able to search by officer and submission date.* 4. *Overdue rule: due date passed & verification status still In Progress.* |

***Admission Supervisor Reassigns Applications [US-2.2.3]***

|  |  |
| --- | --- |
| ***User Story*** | *As an admissions supervisor, I want to reassign or return applications that have not been acted on so they continue to be reviewed on time.* |
| ***Acceptance Criteria*** | 1. *Given the dashboard loads, when displayed, then it shows the supervisor the Officers Workload panel.* 2. *Given supervisor selects an officer, when displayed, then it lists all applications assigned to that officer.* 3. *Given list is displayed, when supervisor views actions, then Reassign is available.* 4. *Given list is displayed, when supervisor navigates, then it allows to multi select more than one application* 5. *Given supervisor Reassign, when panel opens, then it prompts for a target officer and justification.* 6. *Given reassignment confirmed, when done, then it assigns application and notifies the selected officer* |
| ***Notes*** | 1. *Only applications with statuses 'In Progress,' 'Correction Submitted,' and 'Clarification Submitted' are eligible for supervisor reassignment.* 2. *The target officer list is limited to officers assigned to the same program + first preference specialty pool.* 3. *The email template wording is provided in the appendix (Email Template).* |

***<u>Reassign / Return pop-up Data Dictionary:</u>***

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Target Officer* | *DDL* | *User* | *Empty* | *Yes, if action is Reassign.* | *Show and enable if action is Reassign.* | *List of officers assigned to the same pool.* |
| *Justification* | *Text* | *User* | *Empty* | *Yes* | *Enabled* | *The maximum length for the text is 200 characters.* |

# ***Review and Verify Application [STP-2.3]***

*The admissions officer opens the retrieved application, reviews the candidate's data and attachments, and decides on the outcome. They can flag any field, attachment, section, or sub-section with a predefined note directed to the candidate. When the candidate re-submits, the application returns to the same officer to complete the verification.*

*Business Rules:*

1. *The Portfolio section is hidden from the admission officer and reserved for the referee's role.*
2. *GPA Shortlisting Score and Exam Shortlisting Score are auto-computed by platform on submission and displayed to the officer.*
3. *The officer can flag any field, attachment, section, or sub-section and add an editable, predefined note directed to the candidate.*
4. *A returned application enables editing only on the flagged sub-sections for the candidate; all other sections remain read-only.*
5. *A re-submitted application returns to the same officer, not to the pool.*
6. *A warning reminder is sent 3 day before the grace period deadline while application remains in Correction Required*
7. *Reminders are sent automatically every configurable N of days while application remains in Correction Required.*
8. *A final reminder is sent one day before the grace period deadline while application remains in Correction Required.*
9. *Unsubmitted applications are auto-archived after the grace period deadline; the candidate is notified when their draft is archived.*
10. *The officer is only able to replace and reupload attachments; editing other application fields is not permitted.*
11. *Completing verification does not directly move the application forward; the portfolio score must also be complete.*
12. *Candidates shouldn�t view internal statuses; they only need to see when reviews begin and end and if correction is required.*
13. *An application finishes the review phase when both verification and portfolio scoring are complete. To be explained next.*

***Admission Officer Views Application Details [US-2.3.1]***

|  |  |
| --- | --- |
| ***User Story*** | *As an admission officer, I want to open and review an application in read-only mode so that I can understand the candidate's data and attachments before taking any action.* |
| ***Acceptance Criteria*** | 1. *Given application in inbox, when officer clicks it, then platform opens the application in read-only mode.* 2. *Given application is open, when officer navigates the tabs, then all fields are visible and disabled.* 3. *Given application is open, when section loads, then training sites are hidden from the officer.* 4. *Given application is open, when section loads, then ICP-sourced data should be highlighted.* 5. *Given GPA Shortlisting Score, when the section loads, then it is displayed as read-only.* 6. *Given Exam Shortlisting Score, when the section loads, then it is displayed as read-only (Residency only).* 7. *Given any Attachments sub-section is open, when displayed, then officer can view and download the files.* |
| ***Notes*** | 1. *The Portfolio section is reserved for the referee role and is never visible to the admission officer.* |

***Admission Officer Flags and Adds Notes on Application [US-2.3.2]***

|  |  |
| --- | --- |
| ***User Story*** | *As an admission officer, I want to flag fields, attachments, sections, or sub-sections and add notes so that I can communicate corrections to the candidate.* |
| ***Acceptance Criteria*** | 1. *Given officer clicks a field, when popup opens, then they can flag field and select an editable comment template.* 2. *Given officer clicks a section, when popup opens, then they can flag the section select an editable comment template.* 3. *Given officer clicks sub-section, when popup opens, then they can flag it and select an editable comment template.* 4. *Given officer clicks an attachment, when popup opens, then they can flag it and select an editable comment template.* 5. *Given a flag exists, when the field or section is displayed, then platform shows note indicator on element.* 6. *Given the officer edits or removes their own note, when saved, then the platform updates it.* |
| ***Notes*** | 1. *Notes to the candidate become visible when the application is returned for correction.* 2. *Notes to the candidate should be mentioned in the email notification triggered to the candidate.* 3. *The notes/comments templates are predefined in the system and can be edited by the admin. TBD later.* |

***<u>Notes pop-up Data Dictionary</u>***

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Flag Level* | *Label* | *System* | *Field / Sub-section / Section / Attachment* | *N/A* | *Disabled* | *Auto-derived from where the officer clicked.* |
| *Note Template* | *DDL* | *User* | *Empty* | *Yes* | *Show and enable when user flag the element* | *The comments templates to be* |
| *Notes Body* | *Text* | *User* | *Empty* | *Yes* | *Show and enable when user flag the element* | *The maximum length for the text is 500 characters.* |

***Admission Officer Returns Application for Correction [US-2.3.3]***

|  |  |
| --- | --- |
| ***User Story*** | *As an admission officer, I want to return the application to the candidate with the flagged items so that the candidate can correct them.* |
| ***Acceptance Criteria*** | 1. *Given at least one flag exists, when officer clicks Return for Correction, then it prompts for confirmation.* 2. *Given no flags to candidate exist, when application displayed, then platform hide/ disable/block the action.* 3. *Given return is confirmed, when submitted, then it updates the application status to Correction Required.* 4. *Given return is confirmed, when submitted, then it updates the verification status to Correction Required.* 5. *Given return is confirmed, when submitted, then platform sends an email notification to the candidate.* 6. *Given return is confirmed, when submitted, then platform enables editing only on flagged sub-sections.* |
| ***Notes*** | 1. *Only flagged sub-sections are editable for the candidate; all other tabs and sections remain read-only.* 2. *A returned application stays assigned to the officer and comes back to the same officer on re-submit.* |

***Candidate Corrects Returned Application [US-2.3.4]***

|  |  |
| --- | --- |
| ***User Story*** | *As a candidate, I want to correct the flagged items and re-submit the application so that it can continue in the review process.* |
| ***Acceptance Criteria*** | 1. *Given it�s returned, when candidate opens, then platform enables editing only on flagged element.* 2. *Given candidate views a flagged item, when displayed, then the officer's note is shown.* 3. *Given candidate edits, when saved, then platform validates it using same rules as the initial submission.* 4. *Given corrections are complete, when candidate clicks Re-submit, then platform validates flagged items.* 5. *Given all validations pass, when confirmed, then it updates application status to Corrections Submitted.* 6. *Given all validations pass, when confirmed, then it updates verification status to Corrections Submitted.* 7. *Given its re-submitted, when routed, then platform assigns it to same officer who requested correction.* 8. *Given a correction has requested for N days with no response, when reminder job runs, then platform sends an email.* 9. *Given grace period deadline is 3 day away, when reminder job runs, then platform sends warning reminder.* 10. *Given grace period deadline is one day away, when reminder job runs, then platform sends final reminder.* 11. *Given grace period deadline has passed, when the archive job runs, then platform archives all drafts.* 12. *Given application has been auto-archived, when the job completes, then platform notifies candidate by email.* 13. *Given candidate tries to edit a non-flagged item, when triggered, then platform prevents the change.* |
| ***Notes*** | 1. *If the assigned officer is no longer active, the supervisor reassigns the application per US-2.2.3.* |

***Admission Officer Completes Verification [US-2.3.5]***

|  |  |
| --- | --- |
| ***User Story*** | *As an admission officer, I want to mark verification as complete so that the application can move forward.* |
| ***Acceptance Criteria*** | 1. *Given application is ready, when officer clicks Complete Verification, then it prompts for confirmation.* 2. *Given verification is confirmed, when submitted, then it updates verification status to Complete.* 3. *Given verification is confirmed, when submitted, then platform removes application from officer's inbox.* |
| ***Notes*** | 1. *Verification and portfolio scoring run in parallel; whichever completes last triggers the move next stage.* 2. *No notification to candidate on verification completion; notification triggered on score announcement.* |

***Admission Officer Re-uploads an Application Attachment [US-2.3.6]***

|  |  |
| --- | --- |
| ***User Story*** | *As an admission officer, I want to replace an existing attachment so that I can correct invalid, unreadable, duplicate, or incorrectly documents without requiring the candidate to re-submit the entire application.* |
| ***Acceptance Criteria*** | 1. *Given application is open, when officer views an attachment, then platform provides Replace Attachment action.* 2. *Given officer clicks Replace, when the action is triggered, then the platform prompts for a mandatory justification.* 3. *Given a justification is entered, when officer proceeds, then the platform allows selection of a replacement file.* 4. *Given a replacement file is selected, when uploaded, then platform validates file type and size according to the rules.* 5. *Given file passes validation, when submitted, then platform uploads new file and marks it as the active attachment.* 6. *Given a replacement file is uploaded, when processing completes, then platform stores the new version in FileNet.* 7. *Given a replacement file is uploaded, when processing completes, then platform retains the previous version for audit.* 8. *Given a re-uploaded, when processing completes, then platform records officer's name, date, time and justification.* 9. *Given re-upload fails, when processing completes, then it keeps the existing file unchanged and displays a message.* |
| ***Notes*** | 1. *Re-uploading an attachment does not change the Application Status, Verification Status, or Portfolio Status.* 2. *Re-uploading an attachment is intended for administrative correction activities only.* 3. *The previous attachment version must remain available for audit and traceability purposes.* 4. *Portfolio attachments should not in any circumstances be updated by the officer.* 5. *All replacement activities must be captured in the audit log.* 6. *The replacement attachment should follow same FileNet naming convention and storage process.* 7. *The latest uploaded version is the version displayed throughout the platform.* |

***<u>Attachments Replacement Data Dictionary</u>***

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Replace* | *Button* | *User* | *N/A* | *N/A* | *Enabled* | *Uploads and replaces the attachment.* |
| *Justification* | *Text* | *User* | *Empty* | *Yes* | *Enabled* | *Mandatory reason for replacing the attachment.* |

# ***Escalate and Screen Out Application [STP-2.4]***

*When the admission officer determines that an application should be screened out (does not meet the criteria) or is unclear and needs the supervisor's opinion, they route the application to the admission supervisor with a mandatory screen-out reason only for screening out. The supervisor sees two dedicated queues: recommended screen-outs and escalations. Supervisor rejections and guidance require a mandatory note; endorsement of a screen-out does not.*

*Business Rules:*

1. *The admission officer can�t directly screen out the application; supervisor endorsement is required.*
2. *The admission officer can�t decide alone on an unclear case; supervisor guidance must be requested through escalation.*
3. *The supervisor's rejection or guidance is captured with a mandatory note; endorsement of a screen-out does not require one.*
4. *An endorsed screen-out shifts the application to a screened-out status, making related portfolio scoring unnecessary.*
5. *Screened-out candidate can�t appeal. Appeal is only available for the portfolio score.*
6. *Screened-out candidates should be notified immediately after the supervisor approves or endorses the decision..*
7. *A rejected screen-out or a returned escalation puts the application back in the same officer's queue with the supervisor's note.*

***Admission Officer Recommends Screen Out [US-2.4.1]***

|  |  |
| --- | --- |
| ***User Story*** | *As an admission officer, I want to recommend an application for screen out so that it is reviewed and decided by the supervisor.* |
| ***Acceptance Criteria*** | 1. *Given it should be screened out, when officer recommend, then platform prompts for mandatory reason.* 2. *Given it should be screened out, when officer recommend, then platform prompts for additional note.* 3. *Given reason entered, when confirmed, then it updates verification status Screen Out Pending Approval.* 4. *Given status is updated, when confirmed, then it sends application to supervisor�s Screen Out queue.* 5. *Given status is updated, when confirmed, then it sends notification to the supervisor.* 6. *Given status is updated, when confirmed, then it removes application from officer inbox until decision.* |
| ***Notes*** | 1. *Screen-out reasons are configurable; the list will be provided by GME business team.* 2. *If the supervisor rejects the recommendation, the application returns to the officer per US-2.4.5.* |

***<u>Recommend Screen Out pop-up Data Dictionary</u>***

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Screen Out Reason* | *DDL* | *User* | *Empty* | *Yes for recommending the screen out* | *Enabled* | *Refer to the appendix* |
| *Note* | *Text* | *User* | *Empty* | *No* | *Enabled* | *The maximum length for the text is 500 characters.* |

***Admission Officer Escalates Application for Clarification [US-2.4.2]***

|  |  |
| --- | --- |
| ***User Story*** | *As an admission officer, I want to escalate an unclear application to the supervisor so that I get guidance before making a decision.* |
| ***Acceptance Criteria*** | 1. *Given application is not clear, when officer Escalate for Clarification, then it prompts for mandatory note.* 2. *Given escalation is submitted, when confirmed, then it updates verification status Pending Clarification.* 3. *Given status is updated, when confirmed, then it sends application to supervisor�s Escalation queue.* 4. *Given status is updated, when confirmed, then it sends notification to the supervisor.* 5. *Given status is updated, when confirmed, then it removes application from officer inbox until response.* |
| ***Notes*** | 1. *Escalation is when officer is unable to decide (unclear attachment, ambiguous criteria, unusual scenario).* 2. *Supervisor doesn�t make final decision on escalated ones; officer completes it after receiving guidance.* 3. *If the guidance calls for screen out, the officer follows US-2.4.1 to recommend it.* 4. *All queries and responses should be logged for audit purposes.* |

***<u>Escalation pop-up Data Dictionary</u>***

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Note* | *Text* | *User* | *Empty* | *Yes for escalation* | *Enabled* | *The maximum length for the text is 500 characters.* |

***Admission Supervisor Decides on Recommended Screen Out [US-2.4.3]***

|  |  |
| --- | --- |
| ***User Story*** | *As an admission supervisor, I want to endorse or reject a recommended screen out so that only unqualified applications leave the review process before shortlisting.* |
| ***Acceptance Criteria*** | 1. *Given Screen Out queue, when supervisor opens application, then platform displays officer's reason and note.* 2. *Given supervisor approve Screen Out, when panel opens, then platform allows supervisor to edit the reason.* 3. *Given endorsement confirmed, when submitted, then it updates verification status Screened Out.* 4. *Given endorsement confirmed, when submitted, then it updates application status Screened Out.* 5. *Given status is updated, when submitted, then platform sends the notification to the candidate with the reason.* 6. *Given the supervisor Reject Screen Out, when panel opens, then it prompts for a mandatory note.* 7. *Given rejection is confirmed, when submitted, then it updates verification status to Re-evaluating.* 8. *Given rejection is confirmed, when submitted, then it returns application to the officer's queue with note.* 9. *Given status is updated, when confirmed, then it sends notification to the officer.* 10. *Given endorsement confirmed, when submitted, then Announcement Status becomes Announced.* |
| ***Notes*** | 1. *All notes and responses should be logged for audit purposes.* |

***<u>Screen Out Decision pop-up Data Dictionary</u>***

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Decision* | *Radio* | *User* | *Empty* | *Yes* | *Enabled* | *List: Endorse Screen Out, Reject Screen Out.* |
| *Note* | *Text* | *User* | *Empty* | *Yes for rejection.* | *Enabled* | *The maximum length for the text is 500 characters.* |

***Admission Supervisor Decides on Escalated Application [US-2.4.4]***

|  |  |
| --- | --- |
| ***User Story*** | *As an admission supervisor, I want to return an escalated application with guidance so that the officer can complete the review.* |
| ***Acceptance Criteria*** | 1. *Given the escalation queue, when a supervisor opens application, the platform displays the officer's note.* 2. *Given supervisor wants to respond, when panel opens, then platform prompts for mandatory note.* 3. *Given return confirmed, when submitted, then it updates verification status to Clarification Submitted.* 4. *Given return is confirmed, when submitted, then it returns application to the officer's queue with note.* 5. *Given status is updated, when confirmed, then it sends notification to the officer.* |
| ***Notes*** | 1. *As explained earlier, supervisor doesn�t make the final verification decision on an escalated application.* 2. *All notes and responses should be logged for audit purposes.* 3. *If the officer, after guidance, decides application should be screened out, they recommend it per US-2.4.1.* |

***<u>Return with Guidance Note pop-up Data Dictionary</u>***

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Note* | *Text* | *User* | *Empty* | *Yes* | *Enabled* | *The maximum length for the text is 500 characters.* |

***Admission Officer Handles Supervisor Rejection Feedback [US-2.4.5]***

|  |  |
| --- | --- |
| ***User Story*** | *As an admission officer, I want to re-evaluate an application returned by the supervisor so that I can take the appropriate next action.* |
| ***Acceptance Criteria*** | 1. *Given application returned by supervisor, when officer opens it, then platform displays supervisor's note.* 2. *Given officer reviews the note, when done, then platform re-enables standard verification actions.* 3. *Given the officer takes an action, when confirmed, then the platform proceeds per the selected action.* |
| ***Notes*** | 1. *Actions: Return for Correction, Complete Verification, Recommend Screen Out, Escalate for Clarification.* |

# ***Process Reinstatement Requests [STP-2.5]***

*Reinstatement requests raised by candidates who previously withdrew are processed by the admission supervisor in a dedicated queue, separate from the normal verification pools and queues. The supervisor reviews the withdrawal reason, the reinstatement justification, and the previous application, and decides whether to approve or reject the request based on the cycle timeline.*

*Business Rules:*

1. *The reinstatement queue is separate from the normal verification pools and queues.*
2. *Reinstatement requests are visible only to supervisors.*
3. *An approved reinstatement restores the application to its exact pre-withdrawn status.*
4. *Reinstating applications should not be allowed if the same candidate has another active application in the same cycle.*
5. *Supervisor can directly reinstate screened-out applications in exceptional cases. This action is explicitly limited to supervisors from backoffice.*
6. *After reinstatement is approved, the application and all its statuses return to the state they were in before the withdrawal or screen-out.*

***Admission Supervisor Views Reinstatement Requests [US-2.5.1]***

|  |  |
| --- | --- |
| ***User Story*** | *As a supervisor, I want to view the reinstatement requests received, so that I can review the request and decide on it.* |
| ***Acceptance Criteria*** | 1. *Given successful login, when reinstatement queue is opened, then platform displays all pending requests.* 2. *Given queue loads, when displayed, then requests are ordered by request date ascending.* 3. *Given supervisor opens one, when displayed, then it shows the withdrawn application in read-only mode.* 4. *Given request is open, when displayed, then it shows withdrawal reason and reinstatement justification.* |
| ***Notes*** | 1. *The reinstatement queue is separate from the normal verification queues.* 2. *The previous status and notes before withdrawal should be visible for the supervisor.* 3. *The supervisor should be able to see all historical requests even from past cycles.* |

***Admission Supervisor Decides on Reinstatement Request [US-2.5.2]***

|  |  |
| --- | --- |
| ***User Story*** | *As an admission supervisor, I want to approve or reject a reinstatement request so that the candidate is either brought back into the cycle or is informed of the decision.* |
| ***Acceptance Criteria*** | 1. *Given request is open, when the supervisor Approve Reinstatement, then it prompts for a note.* 2. *Given approval is confirmed, when submitted, then it updates the reinstatement request to Approved.* 3. *Given approval is confirmed, when submitted, then it restores the application to its pre-withdrawn status.* 4. *Given approval is confirmed, when submitted, then it sends an email notification to the candidate.* 5. *Given supervisor Reject Reinstatement, when panel opens, then it prompts for a reason and note.* 6. *Given rejection is confirmed, when submitted, then it updates the reinstatement request to Rejected.* 7. *Given rejection is confirmed, when submitted, then platform keeps the application status as Withdrawn.* 8. *Given rejection is confirmed, when submitted, then it sends an email to the candidate with the reason.* |
| ***Notes*** | 1. *The supervisor can directly reinstate any screened-out application with justification, like reinstating after withdrawal; the platform then restores the previous application status, verification status, and portfolio status and returns the portfolio to the applicable referee pool.* 2. *If the application was in a specific pool when withdrawn, it returns to the same pool after approval.* |

***<u>Reinstatement Decision Pop-up Data Dictionary</u>***

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Status* | *DDL* | *System* | *Submitted* | *N/A* | *Disabled* | *List; Submitted. Approved and Rejected.* |

***Admission Supervisor Refreshes ICP Candidate Information [US-2.5.3]***

|  |  |
| --- | --- |
| ***User Story*** | *As supervisor, I want to refresh and compare the latest ICP candidate information so that I can validate and update candidate data for any expiry or details-change request.* |
| ***Acceptance Criteria*** | 1. *Given application opened, when the details are displayed, then platform shows the Refresh ICP Data action.* 2. *Given application contains ICP-sourced data, when displayed, then ICP-sourced fields remain visually highlighted.* 3. *Given supervisor clicks Refresh, when action is triggered, then platform requests the latest information from ICP.* 4. *Given ICP data is successfully retrieved, when pop-up opens, then platform displays only the ICP-sourced fields.* 5. *Given pop-up is displayed, when loaded, then platform shows current data on left and latest ICP data on the right.* 6. *Given latest ICP data is displayed, when loaded, then all retrieved ICP values are displayed in read-only mode.* 7. *Given a field exists in both sources, when values differ, then the platform highlights the difference.* 8. *Given differences exist, when displayed, then the platform provides an Update All action.* 9. *Given supervisor Update All, when confirmed, then platform updates all applicable fields with latest ICP values.* 10. *Given the supervisor selects individual fields, when confirmed, then the platform updates only the selected fields.* 11. *Given updates are selected, when confirm, then platform displays a confirmation message before saving the changes.* 12. *Given confirmation is accepted, when processing completes, then it updates the application with the selected values.* 13. *Given ICP data has been applied, when processing completes, then the platform records the changes in the audit log.* 14. *Given ICP retrieval fails, when processing completes, then platform displays a clear message and no data is updated.* 15. *Given no differences found, when comparison is displayed, then the platform indicates that no updates are required.* 16. *Given supervisor closes pop-up without applying, when action completes, then application remains unchanged.* |
| ***Notes*** | 1. *This action is not limited to the reinstatement review; it is available on any application for any expiry update or details-change request.* 2. *The action is available regardless of whether the current values were originally sourced from ICP or not.* 3. *All must be recorded in the audit log, including user, date, time, original value, new value, and field name.* 4. *The rules and exception scenarios applicable to ICP data retrieval continue to apply during the refresh process.* |

***<u>Refresh ICO Data pop-up Data Dictionary</u>***

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Refresh ICP Data* | *Button* | *User* | *N/A* | *N/A* | *Enabled* | *Retrieves the latest candidate information from ICP.* |
| *Different Value Indicator* | *Icon / Highlight* | *System* | *Auto-set* | *N/A* | *Disabled* | *Different Value Indicator* |
| *Update Field* | *Checkbox* | *User* | *Unchecked* | *No* | *Enabled when a difference exists* | *Updates only the selected field from ICP.* |
| *Apply Changes* | *Button* | *User* | *N/A* | *N/A* | *Enabled* | *Applies the selected updates after confirmation.* |

# ***Portfolio Scoring Epic [EPIC-03]***

# ***Access and View Referee Dashboard [STP-3.1]***

*Referees access the platform via Dubai Health IDAM and land on role-specific dashboards. Referees see their personal queue with the workload and count hints, and their inbox with the portfolios retrieved from the applicable pool.*

*Business Rules:*

1. *Access is delegated to Dubai Health IDAM and controlled by platform role (All referees roles).*
2. *A referee sees only the portfolios they retrieved from their assigned pool (program + first preference specialty).*
3. *At least two rounds of scoring are required for each portfolio.*
4. *A Third Referee sees only portfolios routed after a discrepancy between Round 1 and Round 2.*
5. *A 2nd evaluation referee only reviews the appealed questions from portfolios that are routed after a candidate's appeal.*
6. *A Senior Referee sees all portfolios, all referees, and all pools within scope.*
7. *The candidate's identity is never displayed on any referee screen; only application key info and portfolio content are visible.*

***Referee Logins to the Platform [US-3.1.1]***

|  |  |
| --- | --- |
| ***User Story*** | *As a referee, I want to login using my Dubai Health IDAM credentials so that I can access the portfolio scoring workspace.* |
| ***Acceptance Criteria*** | 1. *Given authenticated IDAM user with referee role, when they access the platform, then it grants access.* 2. *Given an authenticated user without referee role, when they access the platform, then it denies access.* 3. *Given a session timeout, when user returns, then the platform redirects to IDAM for re-authentication.* 4. *Given a successful login, when session starts, then the platform routes the user to role-specific dashboard.* 5. *Given the user holds multiple roles, when session starts, then platform shows a role switcher.* |
| ***Notes*** | 1. *Login is fully delegated to IDAM; all screens, fields, validations, and rules are owned by IDAM.* 2. *Referee, Third Referee, 2nd Evaluation Referee, and Senior Referee roles are provisioned in the platform.* 3. *Forgot password, remember me, account lockout, and similar capabilities are handled by IDAM.* |

***Referee Views the Referee Dashboard [US-3.1.2]***

|  |  |
| --- | --- |
| ***User Story*** | *As a referee, I want to view my dashboard so that I can see the portfolios retrieved from my pool and take action on them.* |
| ***Acceptance Criteria*** | 1. *Given successful referee login, when dashboard loads, then platform displays count of portfolios in the pool.* 2. *Given successful referee login, when dashboard loads, then platform displays key personal queue insights.* 3. *Given the dashboard loads, when insights appear, then the platform allows referees to filter it by cycle.* 4. *Given a successful referee login, when dashboard loads, then platform displays the referee's inbox.* 5. *Given inbox loads, when displayed, then portfolios are ordered by due date (oldest first).* 6. *Given inbox loads, when displayed, then key information per portfolio is shown as per data dictionary.* 7. *Given empty inbox, when dashboard loads, then it displays empty state and Retrieve Portfolios option.* 8. *Given a column header, when clicked, then the inbox sorts ascending or descending by that column.* 9. *Given a column filter, when applied, then the inbox shows only portfolios matching the selected values.* 10. *Given the search field, when the referee enters a term, then the inbox filters matching portfolios.* 11. *Given the referee chooses logout, when confirmed, then the session ends.* |
| ***Notes*** | 1. *Personal queue insights provides the workload and portfolio count hints. Refer to the data dictionary.* 2. *Referee responsible for a specific program and specialty only views the insights related to them.* 3. *The inbox includes only portfolios retrieved by the referee from their assigned pool.* 4. *The candidate's identity is not shown.* 5. *The Referee Dashboard applies to all referees with role-based pool filtering.* 6. *The pool count shows the portfolios awaiting retrieval in the referee�s assigned pool(s) for their role (Pending, Third Referee Required or 2nd Evaluation Required). It is separate from Pending My Action, which counts only the referee�s own retrieved portfolios.* |

***<u>Referee Dashboard Data Dictionary:</u>***

*Personal Queue insights: These figures indicate the number of portfolios currently assigned to me, not pool numbers.*

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Portfolios in Pool* | *Label* | *System* | *The total count of portfolios in the referee�s assigned pool(s) awaiting retrieval for the referee�s role.* | *N/A* | *N/A* | *Pool count, not a personal-queue count; refreshed on page load.* |
| *Pending My Action* | *Label* | *System* | *The total count of all application with portfolio status In Progress* | *N/A* | *N/A* | *The portfolio count is currently waiting for the referee's action, regardless of the round.* |
| *Complete* | *Label* | *System* | *The total count of all application with portfolio status Complete* | *N/A* | *N/A* | *The count of portfolios for that referee where they finished scoring.* |
| *Returned for COI* | *Label* | *System* | *The total count of applications that were returned by the referee for COI at any stage.* | *N/A* | *N/A* | *These portfolios will not be re-assigned to the same referee.* |

*Personal Queue Inbox*

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Application ID* | *Label* | *System* | *As per the application* | *N/A* | *N/A* | *Read-only. No candidate name shown.* |
| *Program* | *Label* | *System* | *As per the application* | *N/A* | *N/A* | *Read-only.* |
| *Round* | *Label* | *System* | *Round 1 / Round 2 / Round 3 / 2nd Evaluation* | *N/A* | *N/A* | *Read-only.* |
| *Retrieval Date* | *Label* | *System* | *Auto-set on retrieval* | *N/A* | *N/A* | *Read-only. DD/MM/YYYY.* |
| *Due Date* | *Label* | *System* | *Auto-set on retrieval based on configuration* | *N/A* | *N/A* | *Read-only. DD/MM/YYYY. Default is retrieval date + 2 days.* |
| *Portfolio Score Status* | *Label* | *System* | *As per the application* | *N/A* | *N/A* | *Refer to the state diagrams mentioned earlier in this document.* |

***Senior Referee Views the Senior Referee Dashboard [US-3.1.3]***

|  |  |
| --- | --- |
| ***User Story*** | *As a senior referee, I want to view my dashboard so that I can oversee the portfolio scoring, monitor the referees' workload, and act in exceptional cases.* |
| ***Acceptance Criteria*** | 1. *Given successful senior referee login, when dashboard loads, then platform displays all pools insights.* 2. *Given successful senior referee login, when dashboard loads, then it displays Referees Workload panel.* 3. *Given the dashboard loads, when all components appear, then it allows the senior referee to filter it.* 4. *Given filters clicked, when it loads, then it allow senior referee to filter by cycle, program, and specialty.* 5. *Given the senior referee opens a portfolio, when displayed, then platform shows all round scores, referees, sub-question answers, and any discrepancy details.* 6. *Given the senior referee chooses logout, when confirmed, then the session ends.* |
| ***Notes*** | 1. *The login process should follow a role-based approach, similar to the Referee Login user story.* 2. *Senior referee is responsible for overseeing all portfolios, not just for a specific program or specialty.* 3. *Senior referee views all pools insights and Referees Workloads' panel.* 4. *Announcement are not owned by Senior Referee; they are handled by admission team (refer to EPIC-04).* 5. *The Referees Workload Panel is explained in upcoming user stories.* |

***<u>Senior Referee Dashboard Data Dictionary:</u>***

*Pool insights*

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Pending Scoring* | *Label* | *System* | *The total count of portfolios with portfolio score status Pending, Third Referee Required or 2nd Evaluation Required* | *N/A* | *N/A* | *Portfolios waiting for retrieval.* |
| *First Round In Progress* | *Label* | *System* | *The total count of portfolios with Round 1 Status In Progress.* | *N/A* | *N/A* | *Portfolios currently scoring by Round 1 referee.* |
| *Second Round In Progress* | *Label* | *System* | *The total count of portfolios with Round 2 Status In Progress.* | *N/A* | *N/A* | *Portfolios currently scoring by Round 2 referee.* |
| *Resolving Discrepancy* | *Label* | *System* | *The total count of portfolios with Round 3 Status In Progress.* | *N/A* | *N/A* | *Portfolios currently scoring by Round 3 referee.* |
| *Re-scoring Appealed Questions* | *Label* | *System* | *The total count of portfolios with Round 4 Status In Progress.* | *N/A* | *N/A* | *Portfolios currently scoring by Round 3 referee.* |
| *Complete* | *Label* | *System* | *The total count of portfolios with portfolio score status Complete* | *N/A* | *N/A* | *Completed portfolios regardless of their first submission; third referees were required or after an appeal.* |

*Referees Workload Panel:*

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Referee Name* | *Label* | *System* | *As per platform role* | *N/A* | *N/A* | *Read-only. One row per referee within the senior referee's scope.* |
| *Referee Role* | *Label* | *System* | *As per platform role* | *N/A* | *N/A* | *Read-only. Referee / Third Referee / 2nd Evaluation Referee.* |
| *In Progress Portfolios* | *Label* | *System* | *The count of assigned portfolios with portfolio score status In Progress (any round) and not yet reaching their due date.* | *N/A* | *N/A* | *Read-only. Count of currently retrieved portfolios.* |
| *Completed Portfolios* | *Label* | *System* | *The count of assigned portfolios submitted by the referee in the current cycle.* | *N/A* | *N/A* | *Read-only.* |
| *Auto Returned To The Pool Portfolios* | *Label* | *System* | *The count of retrieved portfolios that have passed their due date and automatically went back to the pool.* | *N/A* | *N/A* | *Read-only. Portfolios subject to reassignment.* |
| *COI Returned Portfolios* | *Label* | *System* | *The count of portfolios returned by the referee for Conflict of Interest in the current cycle.* | *N/A* | *N/A* | *Read-only.* |

# ***Retrieve and Manage Portfolios from Pool [STP-3.2]***

*Each program-and-specialty combination has its own portfolio pool. Portfolios are routed automatically on application submission. Referees retrieve number of portfolios from their pool at a time within a time window; they can't retrieve more until the current batch is completed. Third Referees retrieve from the discrepancy pool; 2nd Evaluation Referees retrieve from the appeal pool. The Senior Referee monitors the referees' workload and can reassign or override in exceptional cases.*

*Business Rules:*

1. *Each program + first preference specialty combination has its own portfolio pool.*
2. *A referee can retrieve up to a configurable maximum number of portfolios at a time (default: 10).*
3. *Each retrieved portfolio has a configurable time-to-completion (default: 2 working days from retrieval date).*
4. *Retrieval within a pool is from oldest to newest to prevent bias in assignment.*
5. *A portfolio returned due to conflict should not be accessible to the person who returned it later.*
6. *A referee is never assigned the same portfolio twice, regardless of round (1st Round, 2nd Round, 3rd Round or Appeal).*
7. *If the referee misses the due date, the portfolio is automatically returned to the pool.*
8. *The Senior Referee can't retrieve portfolios to score; the role is oversight and exceptional-action only.*

***Referee Retrieves Portfolios from Pool [US-3.2.1]***

|  |  |
| --- | --- |
| ***User Story*** | *As a referee, I want to retrieve portfolios from my assigned pool so that I can start scoring them.* |
| ***Acceptance Criteria*** | 1. *Given pool has portfolios, when referee retrieve, then platform randomly fetch up to 10 from oldest.* 2. *Given pool is empty, when referee clicks retrieve, then platform shows an empty-pool message.* 3. *Given retrieval is successful, when completed, then platform records the retrieval date and sets due date.* 4. *Given retrieval is successful, when completed, then retrieved portfolios appear in the referee's inbox.* 5. *Given 2 working days pass, when status still In Progress, then platform sends it automatically to the pool.* 6. *Given its 1st round, when the retrieval is completed, then Round One status becomes In Progress.* 7. *Given retrieval is successful, when completed, then it updates application status to Under Review if its still Submitted.* 8. *Given its 2nd round, when the retrieval is completed, then Round two status becomes In Progress.* 9. *Given its 3rd round, when the retrieval is completed, then Round Three status becomes In Progress.* 10. *Given retrieval of round 3 is successful, when completed, then it updates Portfolio status to Third Round In Progress* 11. *Given its appeal round, when the retrieval is completed, then Round Four status becomes In Progress.* 12. *Given retrieval of round 4 is successful, when completed, then it updates Portfolio status 2nd Evaluation In Progress.* 13. *Given application was screened out or withdrawn, when confirmed, it updates any status from above to On Hold.* 14. *Given pool has 80 unprocessed portfolios, when check runs, platform notifies the referees assigned to that pool.* |
| ***Notes*** | 1. *Retrieval is random from oldest within referee's assigned pool (program + first preference specialty) to prevent bias.* 2. *Default maximum retrieval cap is 10; configurable per pool.* 3. *Default time-to-completion is 2 working days from retrieval date; configurable.* 4. *The maximum number of portfolio (currently 80) is configurable.* 5. *Round Status will directly update Portfolio status.* |

***Senior Referee Reassigns or Overrides Portfolios [US-3.2.2]***

|  |  |
| --- | --- |
| ***User Story*** | *As a senior referee, I want to reassign or override portfolios so that portfolios continue on time and exceptional corrections are handled with a proper audit trail.* |
| ***Acceptance Criteria*** | 1. *Given not needed, when senior referee views actions, then Reassign & Override are hidden.* 2. *Given senior referee Reassign, when panel opens, then it prompts for a target referee and justification.* 3. *Given reassignment confirmed, when done, then it assigns portfolio and notifies the selected referee.* 4. *Given reassignment confirmed, when done, then it resets the retrieval and due dates for that portfolio.* 5. *Given exceptional correction needed, when override clicked, then it prompts for target round, new score, justification.* 6. *Given override confirmed, when submitted, then platform updates round score and re-computes final portfolio score.* |
| ***Notes*** | 1. *Only portfolios that exist in the referee's inbox are eligible for supervisor reassignment.* 2. *Target referee list includes only referees in same pool who haven�t scored or returned the portfolio due to a conflict.* 3. *Override is an exceptional action; the standard workflow doesn�t use it and each case should be justified.* 4. *Override Score can be applied to Round 1, Round 2, Round 3, or 2nd Evaluation.* |

***<u>Reassign or Override pop-up Data Dictionary:</u>***

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Action* | *Radio* | *User* | *Empty* | *Yes* | *Enabled* | *List: Reassign, Override Score.* |
| *Target Referee* | *DDL* | *User* | *Empty* | *Yes, if Action is Reassign.* | *Show and enable if Action is Reassign.* | *List of referees assigned to the same pool, excluding those who already scored or returned for COI.* |
| *Target Round* | *DDL* | *User* | *Empty* | *Yes, if Action is Override Score.* | *Show and enable if Action is Override Score.* | *List: Round 1, Round 2, Round 3, 2nd Evaluation.* |
| *New Score* | *Numeric* | *User* | *Empty* | *Yes, if Action is Override Score.* | *Show and enable if Action is Override Score.* | *Format: X out of Y (as per the applicable question set total).* |
| *Justification* | *Text* | *User* | *Empty* | *Yes* | *Enabled* | *The maximum length for the text is 200 characters.* |

***Senior Referee Re-uploads Portfolio Evidence [US-3.2.3]***

|  |  |
| --- | --- |
| ***User Story*** | *As a senior referee, I want to replace an existing portfolio evidence attachment in exceptional cases so that invalid, uploaded evidence can be corrected.* |
| ***Acceptance Criteria*** | 1. *Given a portfolio is open, when senior referee views an attachment, then platform provides Replace Evidence action.* 2. *Given senior referee clicks Replace, when action is triggered, then the platform prompts for a mandatory justification.* 3. *Given a justification is entered, when senior referee proceeds, then platform allows selection of a replacement file.* 4. *Given a replacement is selected, when uploaded, then it validates the file type and size according to the rules.* 5. *Given file passes validation, when submitted, then platform uploads new file and marks it as the active attachment.* 6. *Given a replacement file is uploaded, when processing completes, then platform stores the new version in FileNet.* 7. *Given a replacement file is uploaded, when processing completes, then platform retains the previous version for audit.* 8. *Given a re-uploaded, when processing completes, then platform records user�s name, date, time and justification.* 9. *Given re-upload fails, when processing completes, then it keeps the existing file unchanged and displays a message.* |
| ***Notes*** | 1. *The Replace Evidence action is available only to the Senior Referee and for Admission Supervisor role as well.* 2. *Re-uploading portfolio evidence is intended for exceptional administrative correction activities only.* 3. *Re-uploading evidence does not automatically reopen, reset, cancel, or recompute a portfolio-scoring round.* 4. *If a score correction is required because of the replaced evidence, it must be handled separately through the applicable Senior Referee override process defined in US-3.2.2.* 5. *The previous evidence version must remain available to the Senior Referee for audit and traceability.* 6. *The replacement evidence must follow the same FileNet naming convention and storage process.* 7. *The latest successfully uploaded version is the active version displayed throughout the platform.* |

***<u>Portfolio Attachments Replacement Data Dictionary</u>***

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Replace* | *Button* | *User* | *N/A* | *N/A* | *Enabled* | *Uploads and replaces the attachment.* |
| *Justification* | *Text* | *User* | *Empty* | *Yes* | *Enabled* | *Mandatory reason for replacing the attachment.* |

# ***Review and Score Portfolio [STP-3.3]***

*The referee opens the retrieved portfolio, reviews the portfolio questions and candidate's attached evidence, and scores each question by answering the sub-questions Accept or Reject. All sub-questions answered with Accept awards the full points for the question; any sub-question answered with Reject awards zero points. If the referee sees a Conflict of Interest, they can return the portfolio to the applicable pool. When the referee submits, the platform records the answers and determines the next state.*

*Business Rules:*

1. *The portfolio is the main content visible to the referee. Candidate identity should not be revealed.*
2. *The applicable question set is driven by the candidate's program (Internship & Residency or Fellowship); refer to appendix.*
3. *Questions will be scored in one of two ways: either all-or-nothing, or using a points system.*
4. *Only 2 questions from Internship and Residency portfolio, will follow the point system.*
5. *All-or-nothing logic: Accept = full question points; Reject = zero question points.*
6. *For each rejected question, the referee can select one or more reasons.*
7. *The comment shown to the candidate is a predefined comment mapped to the rejection reason.*
8. *Each referee's answers per question and rejection reasons are logged with date, name, user, and email for traceability.*
9. *A Round 2 referee doesn't see Round 1 answers or scores.*
10. *A discrepancy is detected when Round 1 and Round 2 totals differ OR when any rejection answers differ.*
11. *A Third Referee doesn�t see Round 1 and Round 2 answers and scores and scores independently.*
12. *A 2nd Evaluation referee can re-score only the appealed questions, not the whole portfolio again.*
13. *A 2nd Evaluation Referee sees candidate's appeal responses and scores independently.*
14. *The 2nd Evaluation Referee's score, if invoked, replaces the previous final portfolio score.*
15. *The Portfolio Score is recomputed as (Total Points � Portfolio Weight per program) whenever the final score changes.*
16. *If an application is screened out or withdrawn before scoring is complete, scoring will be put on hold.*

***Referee Views Portfolio Details [US-3.3.1]***

|  |  |
| --- | --- |
| ***User Story*** | *As a referee, I want to open and review a portfolio so that I can score the candidate's answers and attached evidence.* |
| ***Acceptance Criteria*** | 1. *Given portfolio in inbox, when referee clicks it, then platform opens the portfolio in scoring mode.* 2. *Given portfolio is open, when displayed, then only Portfolio section is visible with key application information.* 3. *Given portfolio is open, when displayed, then platform shows the applicable question set and details.* 4. *Given any question is expanded, when displayed, then referee can view and download the evidence files.* |
| ***Notes*** | 1. *The referee�s portfolio should display the Application ID and submission date.* 2. *For internship, Graduation Year should appear for the referee.* 3. *For Residency, the internship completion date should appear for the referee.* 4. *For Fellowship, the program and specialties selected and residency dates (from-to) should appear for the referee.* 5. *Any actor who previews any attachment in the platform should also be able to rotate, zoom in, or zoom out.* 6. *Personal identity is not shown; note that attachments may reveal the name (see US-3.3.2 for COI return).* 7. *The question set is determined by the candidate's program; refer to appendix.* |

***Referee Returns Portfolio for Conflict of Interest [US-3.3.2]***

|  |  |
| --- | --- |
| ***User Story*** | *As a referee, I want to return a portfolio for Conflict of Interest so that I don't score portfolios where I have a personal or professional relationship with the candidate.* |
| ***Acceptance Criteria*** | 1. *Given portfolio is open, when referee clicks Return for COI, then platform prompts for mandatory reason.* 2. *Given reason is entered, when confirmed, then platform returns the portfolio to the applicable pool.* 3. *Given portfolio is returned, when confirmed, then it discards any saved answers by this referee.* 4. *Given portfolio is returned, when confirmed, then platform excludes this referee from any future retrieval.* 5. *Given portfolio is returned, when Round 1 or Round 2, then it returns to the standard portfolio pool.* 6. *Given portfolio is returned, when Round 3, then it returns to the Third Referee pool.* 7. *Given portfolio is returned, when 2nd Evaluation, then it returns to the 2nd Evaluation pool.* |
| ***Notes*** | 1. *Once returned for COI, the referee can�t retrieve the same portfolio again in any round.* 2. *The returned portfolio is picked by the next referee following the standard random assignment rule.* |

***<u>Return for COI pop-up Data Dictionary:</u>***

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Reason* | *Text* | *User* | *Empty* | *Yes* | *Enabled* | *The maximum length for the text is 500 characters.* |

***Referee Scores Portfolio Questions [US-3.3.3]***

|  |  |
| --- | --- |
| ***User Story*** | *As a referee, I want to score each portfolio question by answering the sub-questions so that the platform computes the total portfolio score.* |
| ***Acceptance Criteria*** | 1. *Given portfolio open, when referee views a question, then it displays question, answers, attachments and actions.* 2. *Given all-or-nothing question is accepted, when saved, then platform awards full points for that question.* 3. *Given a points system question is accepted, when saved, then the platform displays selection.* 4. *Given a selection displayed, when accepted, then the platform awards points based on the value selected.* 5. *Given any question type is rejected, when selected, then the platform prompts for reason(s) selection.* 6. *Given reason(s) are confirmed, when saved, then the mapped candidate-facing comment(s) are identified.* 7. *Given one or more reasons are selected, when saved, then platform awards zero points for that question.* 8. *Given referee changes answer, when saved, then it updates answer and re-computes question score.* 9. *Given the referee saves without submitting, when saved, then platform stores the answers as a draft.* 10. *Given the referee reopens the portfolio later, when it loads, then the saved answers are still present.* |
| ***Notes*** | 1. *Refer back to the Candidate Completes Portfolio Information user story for the points system questions.* 2. *The 2- working day overdue status apply even if the referee scored and saved some questions.* 3. *Reasons and predefined comments are configured per program; refer to appendix.* 4. *Each referee's answers and reasons selected are logged in audit log with date, name, user, and email.* 5. *The predefined comment is auto-picked by the platform based on the rejection reason.* 6. *Special case: For internships and residencies, if Q1 was accepted by a referee, Q2 is accepted by default.* |

***<u>Questions and Sub-questions Data Dictionary:</u>***

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Question* | *Label* | *System* | *As per configured portfolio question set* | *N/A* | *Disabled* | *Displays the applicable portfolio question based on the candidate's program.* |
| *Scoring Type* | *Label* | *System* | *As per question configuration* | *N/A* | *Disabled* | *Read-only: All-or-Nothing, Points System.* |
| *Referee Decision* | *Radio* | *User* | *Empty* | *Yes* | *Enabled* | *List: Accept, Reject.* |
| *Classification* | *DDL* | *User* | *Empty* | *Yes, if Referee Decision = Accept and Scoring Type = Points System* | *Show and enable if Referee Decision = Accept and Scoring Type = Points System* | *Each classification is mapped to a predefined point value. Refer to appendix.* |
| *Rejection Reason* | *Multi-select DDL* | *User* | *Empty* | *Yes, if Referee Decision = Reject* | *Show and enable if Referee Decision = Reject* | *Lists the predefined rejection reasons configured for the applicable question. Allows one or more reasons to be selected. Refer to appendix.* |
| *Question Score* | *Label* | *System* | *Auto-calculated* | *N/A* | *Disabled* | *All-or-Nothing: Accept = full points; Reject = zero. Points System: Accept = points mapped to selected classification; Reject = zero.* |
| *Total Portfolio Points* | *Label* | *System* | *Auto-calculated* | *N/A* | *Disabled* | *Sum of all question scores for the current referee's scoring round.* |

***Referee Submits Portfolio Scoring [US-3.3.4]***

|  |  |
| --- | --- |
| ***User Story*** | *As a referee, I want to submit my completed portfolio scoring so that the platform completes my scoring round, determines whether additional scoring is required, and updates the overall portfolio status accordingly.* |
| ***Acceptance Criteria*** | 1. *Given all applicable questions have been scored, when referee clicks Submit, then platform prompts for confirmation.* 2. *Given a questions is incomplete, when referee clicks Submit, then it blocks and highlights unanswered questions.* 3. *Given submission is confirmed, when processing, then it calculates Total Portfolio Points for submitted round.* 4. *Given a round is successfully submitted, when processing, then platform updates that Round Status to Complete.* 5. *Given Round 1 status is completed, when processing, then Portfolio Status stays In Progress if Round 2 not ready yet.* 6. *Given Round 2 is submitted, when Round 1 and Round 2 statuses are both Complete, then the platform compares the two completed rounds to determine whether a discrepancy exists.* 7. *Given Round 1 and Round 2 have the same total score and no scoring discrepancy exists, when comparison completes, then the platform sets Portfolio Status to Complete.* 8. *Given Round 1 and Round 2 have different total scores, when comparison completes, then platform records a discrepancy and sets Portfolio Status to Third Referee Required.* 9. *Given a discrepancy is detected, when recorded, then platform stores the discrepancy details identifying the affected question(s) and the difference between Round 1 and Round 2.* 10. *Given Portfolio Status is Third Referee Required, when updated, then it becomes available in the Third Referee pool.* 11. *Given Third Referee submits scoring, when submission completes, then Round 3 Status becomes Complete, Portfolio Status becomes Complete, and the Round 3 score becomes the Final Portfolio Score.* 12. *Given appeal is submitted after Portfolio Status is Complete, when the appeal is recorded, then Portfolio Status becomes 2nd Evaluation Required.* 13. *Given 2nd Evaluation Referee submits appealed questions, when rescore completes, then Round 4 status becomes Complete, Portfolio Status returns Complete, and 2nd Evaluation score replaces the previous Final Portfolio Score.* 14. *Given Portfolio Status becomes Complete and Verification Status is Complete, when both workstreams are complete, then Application Status becomes Review Completed.* 15. *Given Portfolio Status becomes Complete, when processing completes, then the platform recomputes the weighted Portfolio Score using the final Total Portfolio Points and the applicable program Portfolio Weight.* 16. *Given Portfolio Status becomes Complete but Verification Status is not, when portfolio scoring finishes, then Application Status remains in its applicable review state until verification is completed.* 17. *Given application was screened out or withdrawn while a scoring is still in progress or pending, when confirmed, it updates status to On Hold.* |
| ***Notes*** | 1. *Refer to the stat diagrams mentioned earlier in this document.* 2. *Portfolio Status and Round Status are separate status profiles and must not be combined.* 3. *Portfolio Status represents the overall portfolio-scoring journey.* 4. *Each individual scoring round has its own Round Status.* 5. *Round 1 and Round 2 are mandatory scoring rounds. Round 3 is created/required only when a discrepancy exists. The 2nd Evaluation round is required only when an eligible appeal occurs.* 6. *A discrepancy is not a Portfolio Status or Round Status. It is a system-recorded outcome of comparing completed Round 1 and Round 2 scoring.* 7. *A discrepancy exists when either:*  * *Round 1 Total Portfolio Points ? Round 2 Total Portfolio Points; or* * *One or more question scoring decisions/results differ between Round 1 and Round 2.*  1. *Discrepancy details should be stored separately from the status and linked to the portfolio, including the affected question(s) and Round 1 versus Round 2 results.* 2. *The Third Referee scores independently and does not see Round 1 or Round 2 answers or scores.* 3. *If Round 3 is required, Round 3 becomes the final Portfolio Score.* 4. *If 2nd Evaluation is required, the 2nd Evaluation score replaces the previous final Portfolio Score.* 5. *Portfolio Score = Total Points � Portfolio Weight per program; refer to appendix.* 6. *Announcement of scores is not part of this epic; admission supervisor triggers it during ranking (see EPIC-04).* |

***<u>Application Information Data Dictionary:</u>***

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Portfolio Status* | *DDL* | *System* | *Pending* | *Yes* | *Disabled* | *Read-only.* |
| *Round 1 Status* | *DDL* | *System* | *Pending* | *Yes* | *Disabled* | *Read-only.* |
| *Round 1 Total Points* | *Numeric* | *System* | *Empty* | *N/A* | *Disabled* | *Auto-calculated from the question scores submitted for Round 1.* |
| *Round 2 Status* | *DDL* | *System* | *Pending* | *Yes* | *Disabled* | *Read-only.* |
| *Round 2 Total Points* | *Numeric* | *System* | *Empty* | *N/A* | *Disabled* | *Auto-calculated from the question scores submitted for Round 2.* |
| *Discrepancy* | *Boolean* | *System* | *No* | *Yes* | *Disabled* | *Read-only. Set to Yes when Round 1 and Round 2 Total Portfolio Points differ or one or more question scoring decisions/results differ.* |
| *Discrepancy Details* | *System Record* | *System* | *Empty* | *N/A* | *Show if Discrepancy = Yes* | *Stores the affected question(s) and the difference identified between Round 1 and Round 2.* |
| *Round 3 Status* | *DDL* | *System* | *Pending* | *Yes, if Discrepancy = Yes* | *Show if Discrepancy = Yes* | *Read-only.* |
| *Round 3 Total Points* | *Numeric* | *System* | *Empty* | *N/A* | *Show if Discrepancy = Yes* | *Auto-calculated upon Round 3 submission. Round 3 becomes the Final Portfolio Score when invoked.* |
| *Round 4 / 2nd Evaluation Status* | *DDL* | *System* | *Pending* | *Yes, if appeal evaluation is required* | *Show when 2nd Evaluation is applicable* | *Read-only. This round is activated only following an eligible appeal.* |
| *2nd Evaluation Total Points* | *Numeric* | *System* | *Empty* | *N/A* | *Show if 2nd Evaluation is applicable* | *Auto-calculated following submission of the 2nd Evaluation scoring. Replaces the previous Final Portfolio Score.* |
| *Final Portfolio Points* | *Numeric* | *System* | *Empty* | *N/A* | *Disabled* | *Final unweighted portfolio result. R1/R2 agreement = agreed score; Round 3 invoked = Round 3 score; 2nd Evaluation invoked = 2nd Evaluation score.* |
| *Portfolio Score* | *Numeric* | *System* | *Auto-calculated* | *N/A* | *Disabled* | *Weighted Portfolio Score calculated from the Final Portfolio Points and applicable program Portfolio Weight. Recomputed whenever the final score changes.* |

# ***Screening and Score Announcement Epic [EPIC-04]***

*Note: EPIC-04 ends after the applicable applications are initially announced, screened out, or reannounced following a completed portfolio appeal. Shortlisting, interview invitation, and subsequent offering-stage are outside this epic and will be defined in next release 6.*

# ***Access and Monitor Screening Dashboard [STP-4.1]***

*The admission supervisor opens the Screening Dashboard to monitor all applications that have completed verification and portfolio scoring. The dashboard presents the application statuses, screening criteria, attendance indicators, final weighted scores, appeal indicators, and announcement readiness in one list. The list is ordered by Shortlisting Score from highest to lowest without assigning a formal rank.*

*Business Rules:*

1. *Only authorized admission supervisor can access the Screening Dashboard and perform its actions.*
2. *Applications already screened out during verification were announced immediately.*
3. *The dashboard is filterable and sortable by any available column.*

***Admission Supervisor Views the Screening Dashboard [US-4.1.1]***

|  |  |
| --- | --- |
| ***User Story*** | *As an admission supervisor, I want to view and manage the Screening Dashboard so that I can monitor completed applications, confirm score readiness, and take the applicable screening or announcement action.* |
| ***Acceptance Criteria*** | 1. *Given this dashboard, when supervisor opens it, then all applications are listed and displayed for current cycle.* 2. *Given application is displayed, when the list loads, then it shows the relevant application, review and portfolio info.* 3. *Given the list loads, when displayed, then applications are ordered by Shortlisting Score from highest to lowest.* 4. *Given supervisor selects one or more filters, when applied, then platform refreshes the list using all selected criteria.* 5. *Given a column is displayed, when the supervisor sorts it, then the platform orders the current list by that column.* 6. *Given applications displayed, when application selected, then platform supports individual, multi, or select-all.* 7. *Given applications selected, when done, then platform allows supervisor to perform specific actions.* |
| ***Notes*** | 1. *Refer to the data dictionary below for all fields/columns/actions related to this dashboard.* 2. *This is a screening dashboard for shortlisting candidates for the next stage, not a final ranked list.* |

***<u>Screening Dashboard Data Dictionary:</u>***

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Application ID* | *Label* | *System* | *As per application* | *N/A* | *Disabled* | *Read-only.* |
| *Candidate Name* | *Label* | *System* | *As per application* | *N/A* | *Disabled* | *Read-only.* |
| *Program* | *Label* | *System* | *As per application* | *N/A* | *Disabled* | *Read-only.* |
| *Application Status* | *Label* | *System* | *Review Completed* | *N/A* | *Disabled* | *Read-only.* |
| *Verification Status* | *Label* | *System* | *Complete* | *N/A* | *Disabled* | *Read-only.* |
| *Portfolio Status* | *Label* | *System* | *Complete* | *N/A* | *Disabled* | *Read-only.* |
| *Announcement Status* | *Label* | *System* | *Pending* | *N/A* | *Disabled* | *Read-only. Refer to Screening Announcement Status Profile.*  *Will be explained in upcoming user stories.* |
| *CASPER Attendance Status* | *Label* | *System* | *N/A* | *N/A* | *Disabled* | *Values: N/A, Attended, Absent. Updated through CASPER upload.*  *Will be explained in upcoming user stories.* |
| *Appealed* | *Label* | *System* | *No* | *N/A* | *Disabled* | *Values: Yes, No. Yes when an eligible portfolio appeal has been submitted.* |
| *GPA Shortlisting Score* | *Label* | *System* | *Auto-calculated* | *N/A* | *Disabled* | *Format: X.XX / Y (e.g., 34.13 / 35). Y is the program's GPA weight. Refer to the appendix for each program's weights.* |
| *Entrance Exam Shortlisting Score* | *Label* | *System* | *Auto-calculated* | *N/A* | *Disabled* | *Format: X.XX / Y (e.g., 27.30 / 35). Y is the program's Exam weight.*  *Formulas in the appendix.* |
| *CASPER Shortlisting Score* | *Label* | *System* | *N/A* | *N/A* | *Disabled* | *Read-only. Format: X.XX / Y.*  *Y is the program's CASPER weight. Updated after the file upload.*  *Formulas in the appendix.* |
| *Portfolio Score* | *Label* | *System* | *As per final weighted portfolio score* | *N/A* | *Disabled* | *Read-only. Uses the final portfolio scenario; round scores are not shown in this list.* |
| *Shortlisting Score* | *Label* | *System* | *Auto-computed* | *N/A* | *Disabled* | *Read-only. Sum of applicable weighted score components; recomputed on any input change.* |
| *Review Completed Date* | *Date/Time* | *System* | *When application status became Review Completed* | *N/A* | *Disabled* | *Read-only.* |
| *Initial Announcement Date* | *Date/Time* | *System* | *Empty* | *N/A* | *Disabled* | *Populated when initial announcement is completed.*  *Will be explained in upcoming user stories.* |
| *Reannouncement Date* | *Date/Time* | *System* | *Empty* | *N/A* | *Disabled* | *Populated when post-appeal reannouncement is completed.*  *Will be explained in upcoming user stories.* |
| *Screen Out Reason* | *Label* | *System* | *Empty* | *N/A* | *Show if screened out* | *Read-only. Displays the reason applied through the bulk screen-out action.* |
| *Select* | *Checkbox* | *User* | *Unselected* | *No* | *Enabled* | *Allows individual, multi-select, and select-all actions for the current filtered result.* |
| *Upload CASPER* | *Button* | *User* | *N/A* | *N/A* | *Enabled* | *Validates and processes the selected file.* |
| *Announce* | *Button* | *User* | *N/A* | *N/A* | *Enabled* | *Publishes scores and opens the appeal window.* |
| *Screen Out* | *Button* | *User* | *N/A* | *N/A* | *Enabled* | *N/A.* |
| *Reannounce* | *Button* | *User* | *N/A* | *N/A* | *Enabled* | *Publishes the updated final scores.* |

# ***Upload and Process CASPER Results [STP-4.2]***

*The admission supervisor uploads the CASPER results Excel sheet received from the third-party assessment provider. The platform validates the file, matches each row to the correct application using Application ID, captures the CASPER assessment data, applies the configured program weight, updates attendance, recalculates the Shortlisting Score, and provides a processing summary and exception list.*

*Business Rules:*

1. *Candidates can proceed with the CASPER assessment after their application submission.*
2. *CASPER will replace the current MMI activity in GME; this assessment outcome is now used for shortlisting as well.*
3. *CASPER is required for candidates to be eligible for shortlisting.*
4. *CASPER weight is configured per program and may differ between programs.*
5. *Application ID is the primary key used to match the CASPER result to an admission application.*
6. *Absent candidates should be highlighted for the supervisor.*
7. *Duplicate Application IDs, missing mandatory columns, invalid percentiles, and invalid test dates are reported for correction.*
8. *CASPER upload does not reveal scores to candidates.*

***Admission Supervisor Uploads and Processes CASPER Results [US-4.2.1]***

|  |  |
| --- | --- |
| ***User Story*** | *As an admission supervisor, I want to upload and process CASPER sheet so that the platform captures candidate attendance and assessment results.* |
| ***Acceptance Criteria*** | 1. *Given this dashboard, when supervisor clicks Upload CASPER Data, then platform opens the CASPER upload panel.* 2. *Given the upload panel, when displayed, then supervisor can select and upload an Excel file only.* 3. *Given a file is selected, when supervisor submits it, then platform validates the file type and required columns.* 4. *Given the file structure is valid, when processing begins, then platform creates a new upload version.* 5. *Given a row contains Application ID, when processed, then platform matches it to the correct admission application.* 6. *Given a row matched, when processed, then platform stores all CASPER data on that application level.* 7. *Given a row matched and valid, when processed, then CASPER Attendance Status becomes Attended.* 8. *Given a matched application, when row is processed, then platform calculates the weighted CASPER Score.* 9. *Given the weighted CASPER Score is calculated, when saved, then the platform recomputes the Shortlisting Score.* 10. *Given a row is not matched, when processing completes, then CASPER Attendance Status becomes Absent.* 11. *Given a row is not matched, when processing completes, then CASPER Score remains N/A.* 12. *Given an application is marked Absent, when the Screening Dashboard refreshes, then the platform highlights it.* 13. *Given no match found for uploaded Application ID, when processing completes, then it appears in exception list.* 14. *Given duplicate Application IDs exist, when validation runs, then it appears in exception list.* 15. *Given a value is missing or invalid, when validation runs, then it appears in exception list.* 16. *Given processing completes, when panel displays, then it shows upload process summary.* 17. *Given exceptions exist, when supervisor reviews results, then the platform allows correct file to be downloaded again.* 18. *Given a corrected version is uploaded, when successfully processed, then the latest valid values become current.* |
| ***Notes*** | 1. *CASPER source data is stored as received; weighted CASPER Score is stored separately as system-calculated value.* 2. *CASPER Score remain hidden from candidates until announcement.* 3. *The platform should not partially apply structurally invalid files.* 4. *Row-level validation errors do not prevent valid rows from being processed after the file structure passes validation.* |

***<u>CASPER template:</u>***

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Application ID* | *Numeric* | *System* | *As per application* | *N/A* | *N/A* | *Primary matching key for CASPER upload.* |
| *CASPER Percentile* | *Text* | *System* | *N/A* | *N/A* | *N/A* | *Format 0.xx* |
| *Red Flag Scenarios* | *Text* | *System* | *No* | *N/A* | *N/A* | *redFlagScenarios* |
| *Red Flag Comments* | *Text* | *System* | *No* | *N/A* | *N/A* | *redFlagComments* |
| *Test Date* | *Date* | *System* | *N/A* | *N/A* | *N/A* | *yyyy-mm-dd* |

***<u>CASPER Upload Panel Data Dictionary:</u>***

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *CASPER File* | *File Upload* | *User* | *Empty* | *Yes* | *Enabled* | *Accepts the configured Excel format only.* |
| *Upload Version* | *Label* | *System* | *Auto-generated* | *N/A* | *Disabled* | *Sequential version for each successful upload.* |
| *File Name* | *Label* | *System* | *Uploaded file name* | *N/A* | *Disabled* | *Read-only.* |
| *Upload Date* | *Date/Time* | *System* | *Current date/time* | *N/A* | *Disabled* | *Read-only.* |
| *Uploaded By* | *Label* | *System* | *Current user* | *N/A* | *Disabled* | *Read-only.* |
| *Total Rows* | *Numeric* | *System* | *0* | *N/A* | *Disabled* | *Count of data rows received.* |
| *Matched Rows* | *Numeric* | *System* | *0* | *N/A* | *Disabled* | *Count matched to an application.* |
| *Applied Rows* | *Numeric* | *System* | *0* | *N/A* | *Disabled* | *Count successfully applied.* |
| *Exception Rows* | *Numeric* | *System* | *0* | *N/A* | *Disabled* | *Count not applied due to matching or validation errors.* |
| *Attended Count* | *Numeric* | *System* | *0* | *N/A* | *Disabled* | *Count of applications marked Attended.* |
| *Absent Count* | *Numeric* | *System* | *0* | *N/A* | *Disabled* | *Count of applicable applications not listed in the file.* |
| *Upload CASPER* | *Button* | *User* | *N/A* | *N/A* | *Enabled when file selected* | *Validates and processes the selected file.* |

# ***Announce Initial Screening Scores [STP-4.3]***

*When the final portfolio scores are ready, the admission supervisor announces them for all applicable applications in one or more batches; CASPER attendance and results are processed separately and do not gate this announcement. The platform validates the selected applications, publishes the Final Portfolio Score (and the CASPER Score and Shortlisting Score already available), records the announcement, notifies the candidates, and opens the configured portfolio appeal window.*

*Business rules:*

1. *Initial announcement is a manual action by the admission supervisor.*
2. *Only applications with verification and portfolio scoring complete are eligible for initial announcement; CASPER attendance is not a condition.*
3. *The announcement publishes the Final Portfolio Score (and the CASPER Score and Shortlisting Score where available) only.*
4. *Individual portfolio-round scores remain hidden.*
5. *The configured portfolio appeal window starts from the initial announcement timestamp.*
6. *The announcement does not shortlist the candidate or move the candidate to the interview phase yet.*
7. *The candidate may see that the review is complete, but the candidate-facing score fields remain hidden until initial announcement.*

***Admission Supervisor Announces Initial Scores [US-4.3.1]***

|  |  |
| --- | --- |
| ***User Story*** | *As an admission supervisor, I want to announce the initial scores for ready applications so that candidates can view their final screening scores and, where eligible, submit a portfolio appeal.* |
| ***Acceptance Criteria*** | 1. *Given verification or portfolio scoring is not complete, when checked, then Announcement Status remains Pending.* 2. *Given they are ready, when checked, then Announcement Status becomes Ready for Initial Announcement.* 3. *Given this dashboard, when supervisor filters the list, then platform allows selection from the filtered results.* 4. *Given selected applications, when Initial Announcement clicked, then it validates the selected applications readiness.* 5. *Given application not ready, when validation completes, then it blocks those applications and displays the reason.* 6. *Given all selected ones are ready, when action opens, then it displays a summary and prompts for confirmation.* 7. *Given supervisor confirms, when processing completes, then Announcement Status becomes Announced.* 8. *Given announcement completed, when saved, then it records the date, time, type, and applications.* 9. *Given announcement completed, when candidate opens portal, then it reveals all pending scores.* 10. *Given scores are revealed, when displayed to candidate, then individual portfolio-round scores remain hidden.* 11. *Given announcement completed, when processing done, then it sends email and SMS to announced candidates.* 12. *Given announcement completed, when processing done, then appeal window opens from announcement timestamp.* 13. *Given appeal window is open, when candidate views the result, then platform displays appeal action and deadline.* 14. *Given appeal window is open, when processing done, then Appealed Status becomes No.* 15. *Given no applications are selected, when Initial Announcement clicked, then the platform blocks the action.* |
| ***Notes*** | 1. *Announcement readiness is evaluated for each application based on whether verification and the portfolio are complete. CASPER attendance is handled separately and is not a condition for the portfolio score announcement.* 2. *Applications may be announced in one batch.* 3. *The same announcement rules apply regardless of the filters used to select the applications.* 4. *Initial announcement is not the interview shortlisting announcement.* 5. *The candidate-facing score is the current final score based on the applicable portfolio scenario.* |

***<u>Initial Announcement Panel Data Dictionary:</u>***

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Announcement Type* | *Label* | *System* | *Initial Announcement* | *N/A* | *Disabled* | *Read-only.* |
| *Selected Applications* | *Numeric* | *System* | *Selection count* | *N/A* | *Disabled* | *Number selected for processing.* |
| *Ready Applications* | *Numeric* | *System* | *0* | *N/A* | *Disabled* | *Number that passed readiness validation.* |
| *Not Ready Applications* | *Numeric* | *System* | *0* | *N/A* | *Disabled* | *Number of applications blocked.* |
| *Appeal Duration* | *Label* | *System* | *Configured duration* | *N/A* | *Disabled* | *Read-only. Default is as configured for portfolio appeal.* |
| *Appeal Opens* | *Date/Time* | *System* | *Announcement timestamp* | *N/A* | *Disabled* | *Calculated when announcement completes.* |
| *Appeal Closes* | *Date/Time* | *System* | *Auto-calculated* | *N/A* | *Disabled* | *Calculated from announcement timestamp and appeal duration.* |
| *Announce* | *Button* | *User* | *N/A* | *N/A* | *Enabled when confirmed* | *Publishes scores and opens the appeal window.* |

***Candidate Views Review Completion and Scores [US-4.3.2]***

|  |  |
| --- | --- |
| ***User Story*** | *As a candidate, I want to see when my application review is complete and view my scores only after they are announced so that I receive the result at the appropriate stage.* |
| ***Acceptance Criteria*** | 1. *Given Initial Announcement has not occurred, when candidate views dashbaord, then scores remain hidden.* 2. *Given Initial Announcement occurred, when candidate views dashbaord, then it displays the announced scores.* 3. *Given any scoring scenario, when candidate views dashbaord, then it displays portfolio and shortlisting results.* 4. *Given announcement is completed, when candidate views dashboard, then appeal action and deadline are displayed.* |
| ***Notes*** | 1. *Review completion, score announcements, reannouncement and shortlisting are separate events.* 2. *Refer to user story Candidate Views the Dashboard [US-1.2.1] for the dashboard data dictionary.* 3. *The candidate-facing score is always the current final score, not the individual referee or round score.* 4. *The platform replaces the previously displayed final scores after reannouncement.* |

# ***Bulk Screen Out Applications [STP-4.4]***

*The admission supervisor may screen out one or more applications from the Screening Dashboard using any available filter or selection. This supports cases such as CASPER non-attendance, criteria-based screen-outs (incomplete application or not meeting the published admission criteria) and an operational decision to reduce the number of applications progressing to the next phase. This action is separate from verification-based screen out.*

*Business Rules:*

1. *Bulk screen out is performed by the admission supervisor.*
2. *The supervisor can apply the action to one application, multiple applications, or all applications in the current filtered result.*
3. *A screen-out reason is mandatory and is applied to every selected application.*
4. *Bulk screen out in this stage is separate from verification-based screen out performed in EPIC-02; criteria-based reasons are available in both.*
5. *Bulk screen out updates Application Status to Screened Out and Announcement Status to Announced.*
6. *Screen out doesn�t open appeal. An appeal is available only when scores are announced through the applicable announcement process.*

***Admission Supervisor Screens Out Applications in Bulk [US-4.4.1]***

|  |  |
| --- | --- |
| ***User Story*** | *As an admission supervisor, I want to screen out a selected group of applications from the Screening Dashboard so that applications that should not proceed can be processed consistently in one action* |
| ***Acceptance Criteria*** | 1. *Given this dashboard, when supervisor applies filters, then platform allows to select the applicable applications.* 2. *Given applications are selected, when supervisor clicks Bulk Screen Out, then it opens the screen-out panel.* 3. *Given panel opens, when displayed, then platform shows the selected count and requires a Screen Out Reason.* 4. *Given the required reason selected, when supervisor continues, then the platform displays a confirmation.* 5. *Given supervisor confirms, when processing completes, then Application Status becomes Screened Out.* 6. *Given supervisor confirms, when processing completes, then Announcement Status becomes Announced.* 7. *Given action completes, when saved, then platform records the screen-out reason against each application.* 8. *Given the action completes, when processing finishes, then platform sends email and SMS to each candidate.* 9. *Given no applications are selected, when the supervisor clicks Bulk Screen Out, then the platform blocks the action.* 10. *Given a selected application is already screened out, when validation runs, then platform highlights it.* |
| ***Notes*** | 1. *This action may be used for CASPER absence, criteria-based screen-out (incomplete application or not meeting the admission criteria) or another configured screening reason.* 2. *Screen Out reasons are configurable; refer to Application Screen Out Reasons in the appendix.* |

***<u>Bulk Screen Out Panel Data Dictionary:</u>***

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Selected Applications* | *Numeric* | *System* | *Selection count* | *N/A* | *Disabled* | *Number of applications included in the action.* |
| *Screen Out Reason* | *DDL* | *User* | *Empty* | *Yes* | *Enabled* | *List: Application Screen Out Reasons in the appendix.* |
| *Screen Out* | *Button* | *User* | *N/A* | *N/A* | *Enabled when valid* | *N/A.* |

# ***Reannounce Scores After Portfolio Appeal [STP-4.5]***

*After an eligible portfolio appeal is submitted, the application is routed through the 2nd evaluation process defined in the Portfolio Scoring Epic. When the 2nd evaluation is complete, the platform replaces the previous final portfolio result, recomputes the Shortlisting Score, marks the application ready for reannouncement, and allows the admission supervisor to publish the final post-appeal scores.*

*Business Rules:*

1. *Once complete, the 2nd evaluation score replaces the previous Final Portfolio Score, whether it rises, falls, or stays the same.*
2. *The Shortlisting Score is recomputed using the updated Final Portfolio Score.*
3. *Reannouncement is required for every completed eligible appeal, including cases where the final score did not change.*
4. *Only applications with Announcement Status = Ready for Reannouncement can be reannounced.*
5. *No further portfolio appeal is allowed after reannouncement.*

***Admission Supervisor Reannounces Scores After Portfolio Appeal [US-4.5.1]***

|  |  |
| --- | --- |
| ***User Story*** | *As an admission supervisor, I want to reannounce the final scores after portfolio appeals are completed so that candidates receive the recomputed final outcome and the screening stage can close.* |
| ***Acceptance Criteria*** | 1. *Given a candidate submitted appeal, when done, then Announcement Status becomes Appeal Under Review.* 2. *Given 2nd evaluation is completed, when Portfolio Status returns to Complete, then the platform updates score.* 3. *Given final portfolio result is updated, when processing completes, then platform recomputes the Shortlisting Score.* 4. *Given recomputation completes, when ready, then Announcement Status becomes Ready for Reannouncement.* 5. *Given screening dashboard, when supervisor filters Ready for Reannouncement, then it displays eligible applications.* 6. *Given selected applications, when Reannounced clicked, then it validates the selected applications readiness.* 7. *Given application not ready, when validation completes, then it blocks those applications and displays the reason.* 8. *Given all selected ones are ready, when action opens, then it displays a summary and prompts for confirmation.* 9. *Given supervisor confirms, when processing completes, then Announcement Status becomes Reannounced.* 10. *Given reannouncement completed, when saved, then it records the date, time, type, and applications.* 11. *Given reannouncement completed, when candidate opens portal, then it reveals all updated scores.* 12. *Given reannouncement completed, when processing done, then it sends email and SMS to announced candidates.* 13. *Given no applications are selected, when Reannounced clicked, then the platform blocks the action.* 14. *Given reannouncement completed, when candidate views dashboard, then no further portfolio appeal is available.* |
| ***Notes*** | 1. *The candidate receives the latest final values regardless of whether the result changed.* 2. *Previous announced values remain available internally in the audit history.* 3. *Reannouncement does not shortlist the candidate or invite the candidate to interview.* 4. *This is the final action in EPIC-04 for the current release.* |

***<u>Reannouncement Panel Data Dictionary:</u>***

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Name*** | ***Type*** | ***Source*** | ***Default Value*** | ***Mandatory*** | ***Disabled/Hidden*** | ***Notes*** |
| *Announcement Type* | *Label* | *System* | *Reannouncement* | *N/A* | *Disabled* | *Read-only.* |
| *Selected Applications* | *Numeric* | *System* | *Selection count* | *N/A* | *Disabled* | *Number selected for processing.* |
| *Ready Applications* | *Numeric* | *System* | *0* | *N/A* | *Disabled* | *Number that passed readiness validation.* |
| *Not Ready Applications* | *Numeric* | *System* | *0* | *N/A* | *Disabled* | *Number of applications blocked.* |
| *Previous Final Portfolio Score* | *Label* | *System* | *As previously announced* | *N/A* | *Disabled* | *Internal review value; not shown as a historical value to the candidate.* |
| *Updated Final Portfolio Score* | *Label* | *System* | *As per second evaluation* | *N/A* | *Disabled* | *Current final portfolio result.* |
| *Previous Shortlisting Score* | *Label* | *System* | *As previously announced* | *N/A* | *Disabled* | *Internal review value.* |
| *Updated Shortlisting Score* | *Label* | *System* | *Auto-computed* | *N/A* | *Disabled* | *Recomputed using the updated Final Portfolio Score.* |
| *Score Changed* | *Label* | *System* | *Yes / No* | *N/A* | *Disabled* | *Reannouncement is required for both values.* |
| *Reannounce* | *Button* | *User* | *N/A* | *N/A* | *Enabled when confirmed* | *Publishes the updated final scores.* |

# ***Appendix***

# ***Programs and Specialties***

# ***Certificate***

|  |  |  |  |
| --- | --- | --- | --- |
| ***Specialty*** | ***Program*** | ***Duration*** | ***Capacity*** |
| *Medical Laboratory* | *Certificate* | *1* | *10* |

# ***Fellowship***

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
| ***Specialty*** | ***Program*** | ***Duration*** | ***Capacity*** | ***Required Residency specialization*** |
| *Adult Cardiology* | *Fellowship Programs* | *3* | *3* | *Internal Medicine* |
| *Adult Endocrine* | *Fellowship Programs* | *2* | *2* | *Internal Medicine* |
| *Adult Gastroenterology* | *Fellowship Programs* | *3* | *2* | *Internal Medicine* |
| *Adult Hematology* | *Fellowship Programs* | *2* | *2* | *Internal Medicine* |
| *Adult Nephrology* | *Fellowship Programs* | *3* | *2* | *Internal Medicine* |
| *Adult Pulmonology* | *Fellowship Programs* | *2* | *2* | *Internal Medicine* |
| *Adult Rheumatology* | *Fellowship Programs* | *2* | *1* | *Internal Medicine* |
| *Child and Adolescent Psychiatry* | *Fellowship Programs* | *2* | *3* | *Phsyciatry* |
| *Neonatology* | *Fellowship Programs* | *3* | *4* | *Pediatrics* |
| *Pediatric Endocrine* | *Fellowship Programs* | *2* | *3* | *Pediatrics* |
| *Pediatric Gastroenterology* | *Fellowship Programs* | *3* | *2* | *Pediatrics* |
| *Pediatric Intensive Care* | *Fellowship Programs* | *3* | *2* | *Pediatrics* |
| *Pediatric Nephrology* | *Fellowship Programs* | *2* | *2* | *Pediatrics* |
| *Pediatric Cardiology* | *Fellowship Programs* | *3* | *2* | *Pediatrics* |
| *Pediatric Emergency Medicine* | *Fellowship Programs* | *2* | *2* | *Pediatrics, Emergency Medicine* |
| *Pediatric Orthopedic Surgery* | *Fellowship Programs* | *2* | *1* | *Orthopedics & Trauma Surgery* |
| *Pediatric Otolaryngology* | *Fellowship Programs* | *2* | *2* | *Otolaryngology* |
| *Pediatric Surgery* | *Fellowship Programs* | *3* | *1* | *General Surgery* |
| *Vascular Neurology (Strock)* | *Fellowship Programs* | *2* | *2* | *Neurology* |
| *Critical Care Medicine* | *Fellowship Programs* | *2* | *2* | *Internal Medicine, Emergency Medicine, Anesthesia, General Surgery* |

# ***Residency***

|  |  |  |  |
| --- | --- | --- | --- |
| ***Specialty*** | ***Program*** | ***Duration*** | ***Capacity*** |
| *Anesthesia* | *Medical Residency Programs* | *5* | *6* |
| *Dermatology* | *Medical Residency Programs* | *4* | *3* |
| *Emergency Medicine* | *Medical Residency Programs* | *4* | *11* |
| *Family Dentistry* | *Dental Residency Programs* | *3* | *3* |
| *Family Medicine* | *Medical Residency Programs* | *4* | *12* |
| *General Surgery* | *Medical Residency Programs* | *5* | *5* |
| *Internal Medicine* | *Medical Residency Programs* | *4* | *15* |
| *Neurology* | *Medical Residency Programs* | *5* | *3* |
| *Neurosurgery* | *Medical Residency Programs* | *6* | *1* |
| *Obstetrics & Gynecology* | *Medical Residency Programs* | *5* | *8* |
| *Ophthalmology* | *Medical Residency Programs* | *4* | *2* |
| *Oral Maxillofacial Surgery* | *Dental Residency Programs* | *5* | *1* |
| *Orthopedics & Trauma Surgery* | *Medical Residency Programs* | *5* | *4* |
| *Otolaryngology* | *Medical Residency Programs* | *5* | *2* |
| *Pediatric Neurology* | *Medical Residency Programs* | *5* | *2* |
| *Pediatrics* | *Medical Residency Programs* | *4* | *15* |
| *Psychiatry* | *Medical Residency Programs* | *4* | *6* |
| *Radiology* | *Medical Residency Programs* | *5* | *4* |
| *Urology* | *Medical Residency Programs* | *6* | *2* |
| *AP/CP Pathology* | *Medical Residency Programs* | *5* | *3* |
| *Clinical Pharmacy* | *Pharmacy Residency Programs* | *2* | *3* |

# ***Internship***

|  |  |  |  |
| --- | --- | --- | --- |
| ***Specialty*** | ***Program*** | ***Duration*** | ***Capacity*** |
| *Dental* | *Internship* | *1* | *24* |
| *Medical* | *Internship* | *1* | *90* |

# ***Specialties Per Site Per Capacity***

*TBC by business team.*

# ***Programs and Candidate Statuses***

*An asterisk (\*) means the ID field is required.*

|  |  |  |
| --- | --- | --- |
| ***Program*** | ***Specialty*** | ***Candidate Status (Who can apply?)*** |
| *Dental Residency* | *All specialties* | *MBRU GME Intern\**  *MBRU GME Resident\**  *Active Dubai Health Employee\**  *External Candidate* |
| *Medical Residency* | *All specialties* | *MBRU MD Student/Alumni\**  *MBRU GME Intern\**  *MBRU GME Resident\**  *Active Dubai Health Employee\**  *External Candidate* |
| *Pharmacy Residency* | *Clinical Pharmacy* | *Active Dubai Health Employee\**  *External Candidate* |
| *Internship* | *All specialties* | *External Candidate* |
| *Fellowship* | *All specialties* | *MBRU MD Student/Alumni\**  *MBRU GME Resident\**  *Active Dubai Health Employee\**  *External Candidate* |

# ***Terms and Conditions***

|  |
| --- |
| ***One unified consent for all programs*** |
| *Dear <Candidate Full Name>,*  *Greetings! Thank you for your interest in <Program Name> Program. Kindly read the following carefully before proceeding with your application.*  *1. Candidates are shortlisted solely based on academic merit as outlined on the website; However, in some cases priority will be given to UAE Nationals.*  *2. Candidates must complete the application form and ensure that all the information filled in is correct. Any changes in the form will be the responsibility of the candidate. Moreover, all required attachments should be clear and in PDF format with the exception of the photo. GME has the right to screen out any incomplete or inaccurate application after the submission deadline.*  *3. GME has the right to reject any application if it is found to have false or manipulated information or documentation.*  *4. The application fee is non-refundable. This amount is paid for processing & reviewing the application and is mandatory to consider the application complete.*  *5. For candidates applying to the Residency Program who have not completed the internship training requirement, applications may be submitted during the internship. However, enrollment is subject to the submission of the internship certificate prior to program commencement.*  *6. Enrollment in the program is subject to successfully completing the Dubai Health Authority (DHA) licensing process and Basic Life Support (BLS) course.*  *7. In the case of employment, a 'No Objection Letter' is required to proceed with the application.*  *8. Candidates will join the program as full-time trainees.*  *9. Candidates will commit to paying the annual accreditor board certification fees - as applicable.* |

# ***Countries and Universities***

|  |  |
| --- | --- |
| ***Country*** | ***Universities*** |
| *Extract from current system* | *Extract from current system* |

# ***Accepted UAE Hospitals for Residency***

|  |  |
| --- | --- |
| ***Entity*** | ***Hospitals*** |
| *MBRU* | *Dubai Health Hospitals* |
| *DOH* | *Tawam Hospital*  *Ambulatory Health Services*  *Sheikh Khalifa Medical City (SKMC)*  *Sheikh Shakhbout Medical City (SSMC)*  *Sheikh Tahnoon Medical City (STMC)*  *Corniche Hospital*  *Cleveland Clinic Abu Dhabi*  *Zayed Military Hospital*  *Burjeel Medical City* |
| *EHS* | *Al Qassimi Hospital*  *Al Qassimi Women�s & Children�s Hospital*  *Al Amal Psychiatric Hospital*  *EHS Primary Healthcare Centres*  *Kuwait Hospital* |
| *GMU* | *Thumbay Univeristy Hospital* |

# ***Programs and Required University Degrees***

|  |  |  |
| --- | --- | --- |
| ***Program*** | ***Specialty*** | ***Degree options*** |
| *Dental Residency / Dental Internship* | *All specialties* | *Same as HBMCDM accepted dental degrees* |
| *Medical Residency / Medical Internship* | *All specialties* | *MD or MBBS* |
| *Pharmacy Residency* | *Clinical Pharmacy* | *BSc or MSc in Pharmacy* |
| *Medical Lab* | *All specialties* | *BSc Medical Laboratory Sciences or BSc Biomedical Sciences* |

# ***Programs and Shortlisting Criteria and Weights***

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| ***Candidate*** | ***GPA Shortlisting Score*** | ***Entrance Exam Shortlisting Score*** | ***Portfolio Score*** | ***Shortlisting Score*** | ***CASPER Shortlisting Score*** | ***Interview*** |
| *Intern (Medical)* | *50* | *N/A* | *30* | *80* | *20* | *N/A* |
| *Intern (Dental)* | *50* | *N/A* | *20* | *70* | *N/A* | *30* |
| *Resident (Medical)* | *35* | *35* | *30* | *100* | *20* | *30* |
| *Resident (Dental)* | *35* | *35* | *30* | *100* | *N/A* | *40* |
| *Fellowship* | *N/A* | *N/A* | *30* | *30* | *N/A* | *70* |
| *Certificate* | *50* | *N/A* | *20* | *70* | *N/A* | *30* |

# ***GPA Rubric***

*Conversion rule: Percentage = GPA � 4.00 � 100 (GPA � 25), applied to the GPA exactly as entered (two decimals) with no rounding up or down, so that every GPA value has an equivalent percentage. The table below lists reference points only.*

|  |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ***GPA*** | ***Percentage*** | ***GPA*** | ***Percentage*** | ***GPA*** | ***Percentage*** | ***GPA*** | ***Percentage*** |
| *0.04* | *1%* | *1.04* | *26%* | *2.04* | *51%* | *3.04* | *76%* |
| *0.08* | *2%* | *1.08* | *27%* | *2.08* | *52%* | *3.08* | *77%* |
| *0.12* | *3%* | *1.12* | *28%* | *2.12* | *53%* | *3.12* | *78%* |
| *0.16* | *4%* | *1.16* | *29%* | *2.16* | *54%* | *3.16* | *79%* |
| *0.20* | *5%* | *1.20* | *30%* | *2.20* | *55%* | *3.20* | *80%* |
| *0.24* | *6%* | *1.24* | *31%* | *2.24* | *56%* | *3.24* | *81%* |
| *0.28* | *7%* | *1.28* | *32%* | *2.28* | *57%* | *3.28* | *82%* |
| *0.32* | *8%* | *1.32* | *33%* | *2.32* | *58%* | *3.32* | *83%* |
| *0.36* | *9%* | *1.36* | *34%* | *2.36* | *59%* | *3.36* | *84%* |
| *0.40* | *10%* | *1.40* | *35%* | *2.40* | *60%* | *3.40* | *85%* |
| *0.44* | *11%* | *1.44* | *36%* | *2.44* | *61%* | *3.44* | *86%* |
| *0.48* | *12%* | *1.48* | *37%* | *2.48* | *62%* | *3.48* | *87%* |
| *0.52* | *13%* | *1.52* | *38%* | *2.52* | *63%* | *3.52* | *88%* |
| *0.56* | *14%* | *1.56* | *39%* | *2.56* | *64%* | *3.56* | *89%* |
| *0.60* | *15%* | *1.60* | *40%* | *2.60* | *65%* | *3.60* | *90%* |
| *0.64* | *16%* | *1.64* | *41%* | *2.64* | *66%* | *3.64* | *91%* |
| *0.68* | *17%* | *1.68* | *42%* | *2.68* | *67%* | *3.68* | *92%* |
| *0.72* | *18%* | *1.72* | *43%* | *2.72* | *68%* | *3.72* | *93%* |
| *0.76* | *19%* | *1.76* | *44%* | *2.76* | *69%* | *3.76* | *94%* |
| *0.80* | *20%* | *1.80* | *45%* | *2.80* | *70%* | *3.80* | *95%* |
| *0.84* | *21%* | *1.84* | *46%* | *2.84* | *71%* | *3.84* | *96%* |
| *0.88* | *22%* | *1.88* | *47%* | *2.88* | *72%* | *3.88* | *97%* |
| *0.92* | *23%* | *1.92* | *48%* | *2.92* | *73%* | *3.92* | *98%* |
| *0.96* | *24%* | *1.96* | *49%* | *2.96* | *74%* | *3.96* | *99%* |
| *1.00* | *25%* | *2.00* | *50%* | *3.00* | *75%* | *4.00* | *100%* |

# ***EMREE and EDREE Residency Exams Conversion Rules***

|  |  |
| --- | --- |
| ***Attempt*** | ***Formula*** |
| *First Attempt success* | *EMREE % Score\*10%+ EMREE Percentile Score \*10%* |
| *Second Attempt Success* | *EMREE % Score\*8%+ EMREE Percentile Score \*8%* |
| *Third Attempt and beyond Success* | *EMREE % Score\*6%+ EMREE Percentile Score \*6%* |

# ***SMLE and SDLE Residency Exams Conversion Rules***

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
| ***Medical Professional Field*** | ***Exam Name*** | ***Cut Score*** | ***Max Value*** | ***Conversion Formula*** |
| *Medical* | *SMLE* | *560* | *800* | *((((@Result-200)/2)/300)\*100)* |
| *Dentist* | *SDLE* | *560* | *800* | *((((@Result-200)/2)/300)\*100)* |

# ***Email and SMS Templates***

|  |  |  |
| --- | --- | --- |
| ***Scenario*** | ***Channel*** | ***Template*** |
| *TBC by business team.* |  |  |

# ***Application Screen Out Reasons***

|  |
| --- |
| ***Screen Out Reasons*** |
| *Not meeting the published admission criteria* |
| *Submitting an incomplete application* |
| *Not attending CASPER* |
| *Not attending the interview* |
| *Not responding to the offer by the stipulated deadline* |
| *Submitting an incomplete application due to a missing ECE report* |
| *Submitting an incomplete application due to a missing English language certificate* |
| *Not meeting the English language admission requirements* |
| *The limited number of seats available and the highly competitive candidate pool* |
| *Performance in the shortlisting phase, which did not meet the threshold required to progress further in this admissions cycle* |

# ***Internship and Residency Portfolio Questions, Rejection Reasons and Customer-Facing Comments***

|  |  |  |
| --- | --- | --- |
| ***Question Title*** | ***Scoring Platform Rejection Reasons*** | ***Candidate Comment*** |
| *Were you able to publish a research article in a peer reviewed journal?* | *Candidate authorship not evidenced* | *The submitted documentation does not clearly identify you as an author of the publication.* |
| *Publication not verifiable* | *The submitted publication could not be verified on the original journal website.* |
| *Peer-review status not established* | *The submitted documentation does not establish that the journal is peer-reviewed.* |
| *Have you participated in research activity (writing proposal, collecting data, analyzing data and writing a manuscript) whether published or not?* | *Research Proposal Attached* | *The submitted documentation does not include a complete research proposal that meets the published portfolio criteria.* |
| *Candidate research involvement not evidenced* | *The submitted documentation does not clearly identify your involvement in the research activity.* |
| *Research supervisor confirmation not provided* | *The submitted documentation does not include an acceptable supervisor letter or other supporting evidence required for the research activity.* |
| *Have you presented in a scientific event (conference/symposium/workshop)?* | *Presentation not health-related* | *The submitted presentation does not meet the requirement for a health-related scientific event.* |
| *Presenter role not confirmed on submitted documentation* | *The submitted documentation does not clearly confirm your role as a presenter at the scientific event.* |
| *Official supporting documentation not provided* | *The submitted presentation documentation does not meet the published requirements for official supporting documents.* |
| *Presentation predates medical/dental school entry* | *The submitted presentation does not meet the requirement for an activity completed after entering medical/dental school.* |
| *Official supporting documentation not matching the presentation type* | *The submitted presentation documentation does not match the selected presentation type.* |
| *Did you actively participate in any health related voluntary/community activities since entry to medical/dental school? (e.g. Breast cancer campaign, smoking cessation program, disease awareness day, health education media programs, humanitarian missions, etc.)* | *Volunteering activity does not meet category requirements* | *The submitted activity does not meet the applicable health-related volunteering requirement.* |
| *Volunteering participation not adequately evidenced* | *The submitted documentation does not clearly confirm the volunteering activity, your participation, or the required activity details.* |
| *Official supporting documentation not provided* | *The submitted volunteering documentation does not meet the published requirements for official supporting documents.* |
| *Volunteering predates medical/dental school entry* | *The submitted volunteering activity does not meet the requirement for an activity completed after entering medical/dental school.* |
| *Did you actively participate in another health related voluntary/community activities since entry to medical/dental school? (e.g. Breast cancer campaign, smoking cessation program, disease awareness day, health education media programs, humanitarian missions, etc.)* | *Volunteering activity does not meet category requirements* | *The submitted activity does not meet the requirement for a health-related or humanitarian/community volunteering activity.* |
| *Volunteering participation not adequately evidenced* | *The submitted documentation does not clearly confirm the volunteering activity, your participation, or the required activity details.* |
| *Official supporting documentation not provided* | *The submitted volunteering documentation does not meet the published requirements for official supporting documents.* |
| *Volunteering predates medical/dental school entry* | *The submitted volunteering activity does not meet the requirement for an activity completed after entering medical/dental school.* |
| *Duplicate volunteering activity submitted* | *The same volunteering activity was submitted for both entries; the published criteria require two volunteering activities.* |
| *Did you attend skill enhancement courses (such as Advanced life support, Point-of-Care Ultrasound Certificate (POCUS), Leadership, Quality etc) since entry to medical/dental school?* | *Course completion not adequately evidenced* | *The submitted documentation does not clearly confirm completion of the eligible course, your name, course title, or completion date.* |
| *Official supporting documentation not provided* | *The submitted course documentation does not meet the published requirements for official supporting documents.* |
| *Course predates medical/dental school entry* | *The submitted course does not meet the requirement for completion after entering medical/dental school.* |
| *Did you attend another skill enhancement courses (such as Advanced life support, Point-of-Care Ultrasound Certificate (POCUS), Leadership, Quality etc) since entry to medical/dental school?* | *Course completion not adequately evidenced* | *The submitted documentation does not clearly confirm completion of the eligible course, your name, course title, or completion date.* |
| *Official supporting documentation not provided* | *The submitted course documentation does not meet the published requirements for official supporting documents.* |
| *Course predates medical/dental school entry* | *The submitted course does not meet the requirement for completion after entering medical/dental school.* |
| *Duplicate course submitted* | *The submitted course is the same as the course entered in the preceding question; a separate eligible course is required if both entries are to be scored.* |
| *Have you received any awards or honors for academic achievements since entry to medical/dental school. (e.g. Dean list, Best paper, Best research, Best presentation etc)* | *Academic award/honour not adequately evidenced* | *The submitted documentation does not clearly confirm the academic award/competitive prize, your name, award title, or date.* |
| *Official supporting documentation not provided* | *The submitted award documentation does not meet the published requirements for official supporting documents.* |
| *Award predates medical/dental school entry* | *The submitted award does not meet the requirement for recognition received after entering medical/dental school.* |
| *Have you participated in any extracurricular activities since entering medical or dental school? (e.g. clinical attachments, summer placements, teaching, serving as a council member, or other related experiences)*  *This question does not apply to internships and should not appear in the portfolio.* | *Extracurricular activity not health-related* | *The submitted activity does not meet the published requirement for health-related extracurricular experience.* |
| *Extracurricular involvement not adequately evidenced* | *The submitted documentation does not clearly confirm the activity, your role, or the activity date.* |
| *Official supporting documentation not provided* | *The submitted extracurricular activity documentation does not meet the published requirements for official supporting documents.* |
| *Extracurricular activity predates medical/dental school entry* | *The submitted activity does not meet the requirement for participation after entering medical/dental school.* |
| *Have you participated in another extracurricular activities since entering medical or dental school? (e.g. clinical attachments, summer placements, teaching, serving as a council member, or other related experiences)*  *This question does not apply to internships and should not appear in the portfolio.* | *Extracurricular activity not health-related* | *The submitted activity does not meet the published requirement for health-related extracurricular experience.* |
| *Extracurricular involvement not adequately evidenced* | *The submitted documentation does not clearly confirm the activity, your role, or the activity date.* |
| *Official supporting documentation not provided* | *The submitted extracurricular activity documentation does not meet the published requirements for official supporting documents.* |
| *Extracurricular activity predates medical/dental school entry* | *The submitted activity does not meet the requirement for participation after entering medical/dental school.* |
| *Duplicate or overlapping extracurricular activity submitted* | *The submitted activities do not meet the requirement for distinct, non-overlapping extracurricular experiences.* |

# ***Fellowship Portfolio Questions, Rejection Reasons and Customer-Facing Comments***

|  |  |  |
| --- | --- | --- |
| ***Question Title*** | ***Scoring Platform Rejection Reason*** | ***Candidate Comment*** |
| *(****5 : Points****)  Were you able to publish a research article in a peer reviewed journal?* | *Candidate authorship not evidenced* | *The submitted publication does not clearly identify you among the authors.* |
| *Publication not verifiable* | *The submitted publication could not be verified on the original journal website.* |
| *Peer-review status not established* | *The submitted documentation does not establish that the journal is peer-reviewed.* |
| *Publication predates medical school graduation* | *The submitted publication does not meet the requirement for an activity completed after medical school graduation.* |
| *Publication date not evidenced* | *The submitted documentation does not clearly indicate the publication date.* |
| *Publication type not eligible* | *The submitted item is not an eligible full published manuscript under the published portfolio criteria.* |
| *Handwritten information in supporting documentation* | *The submitted documentation contains handwritten information that is not accepted under the published portfolio criteria.* |
| *(****5 : Points****)  Were you able to publish an additional peer-reviewed research article in the subspecialty program you are applying to?* | *Candidate authorship not evidenced* | *The submitted publication does not clearly identify you among the authors.* |
| *Subspecialty relevance not established* | *The submitted publication does not demonstrate relevance to the fellowship subspecialty for which you applied.* |
| *Publication not verifiable* | *The submitted publication could not be verified on the original journal website.* |
| *Publication is the same as the previous entry* | *The submitted publication is the same as the previous publication entry. A separate publication is required for this question, subject to confirmation of the application criteria.* |
| *Peer-review status not established* | *The submitted documentation does not establish that the journal is peer-reviewed.* |
| *Publication date not evidenced* | *The submitted documentation does not clearly indicate the publication date.* |
| *Publication type not eligible* | *The submitted item is not an eligible full published manuscript under the published portfolio criteria.* |
| *(****5 : Points****) Have you participated in teaching activities? (e.g. Training of Trainers courses, teaching junior residents or medical interns/students, leading teaching programs or contributing to curriculum development.)* | *Supporting evidence missing or incomplete* | *The submitted documentation does not clearly confirm your teaching role, name, activity date, or duration where applicable.* |
| *Supporting documentation not officially authenticated* | *The submitted documentation does not meet the published requirements for official letterhead, signature, or institutional stamp.* |
| *Teaching activity predates medical school graduation* | *The submitted teaching activity or qualification does not meet the requirement for completion after medical school graduation.* |
| *Activity unrelated to medical or health profession education* | *The submitted activity does not meet the requirement for relevance to medical or health professions education.* |
| *Teaching role not evidenced* | *The submitted attendance certificate does not establish that you performed a teaching role.* |
| *Teaching activity or qualification not eligible* | *The submitted activity or qualification is not eligible under the published teaching experience criteria.* |
| *(****5 : Points****) Have you participated in leadership activities? (e.g. Serving on departmental or institutional committees related to clinical governance, quality, or patient safety, chief resident role, or being an executive member of a council, or coordinating health-related educational or community events)* | *Leadership role not evidenced* | *The submitted documentation does not clearly confirm your leadership role, name, or activity date.* |
| *Supporting documentation not officially authenticated* | *The submitted documentation does not meet the published requirements for official letterhead, signature, or institutional stamp.* |
| *Leadership activity predates residency enrollment* | *The submitted leadership activity does not meet the requirement for participation after entering the residency program.* |
| *Eligible leadership responsibilities not demonstrated* | *The submitted documentation does not demonstrate leadership responsibilities that meet the published criteria.* |
| *(****5 : Points****) Have you participated in any system-based practices? (e.g. patient safety initiative, quality improvement project, audit or development of clinical care protocols, guidelines and pathways)* | *Systems-based practice role or required details not evidenced* | *The submitted documentation does not clearly confirm the activity name, your role, name, or activity date.* |
| *Supporting documentation not officially authenticated* | *The submitted documentation does not meet the published requirements for official letterhead, signature, or institutional stamp.* |
| *Activity predates residency enrollment* | *The submitted activity does not meet the requirement for participation after entering the residency program.* |
| *Project completion not evidenced* | *The submitted documentation does not establish completion of the project, initiative, audit, protocol, or guideline.* |
| *Proposal or poster only* | *The submitted proposal or poster does not establish completion of an eligible activity.* |
| *Activity forms part of routine clinical duties* | *The submitted outbreak-response or field-hospital activity falls within routine clinical duties and is excluded under the published criteria.* |
| *(****5 : Points****) Do you hold additional academic qualifications, diplomas, or professional certifications beyond core medical training?* | *Qualification details not evidenced* | *The submitted documentation does not clearly confirm your name, the qualification or course title, or the completion date.* |
| *Supporting documentation not officially authenticated* | *The submitted documentation does not meet the published requirements for official letterhead, signature, or institutional stamp.* |
| *Qualification completion date does not meet eligibility requirement* | *The submitted qualification does not meet the applicable completion-date requirement under the published criteria.* |
| *Qualification type not eligible* | *The submitted qualification or certification is excluded under the published additional qualifications criteria.* |
| *Course duration below minimum threshold* | *The submitted course does not meet the minimum nine-month duration specified in the published criteria.* |
| *Qualification completion not evidenced* | *The submitted documentation does not confirm completion of the qualification or course.* |

