# CareFind V3 - Clinical Workflow Integration Tracking

This file tracks the status of the CareFind V3 architecture transition. CareFind V3 moves from a conversation-driven model to a strict state-driven clinical triage system.

---

## Architecture Overview

1. **Intake demographics & symptoms**: Collected in the client wizard.
2. **Information Extraction**: LLM (Groq) extracts structured variables into the `Clinical State` object.
3. **Emergency Detection**: Scans state using rule-based criteria. If an emergency is triggered, questioning halts immediately.
4. **Symptom Registry**: Matches symptoms to clinical requirements (e.g. fever, headache, chest pain).
5. **Missing Info Engine**: Determines which required questions are unanswered.
6. **Priority Engine**: Scores and ranks missing questions (Red Flags = 100, Severity = 70, Duration = 50, Location = 30).
7. **Question Generator**: Generates natural clinical queries for the highest priority missing key.
8. **Disposition & Specialist Engine**: Computes final care urgency and medical specialty recommendation once questioning is complete.

---

## File Status

| File | Type | Purpose | Status |
| --- | --- | --- | --- |
| [session.model.js](file:///d:/Development/carefind/server/models/session.model.js) | DB Model | Persistent Mongoose schema for `SymptomSession` | **COMPLETED** |
| [symptomRegistry.js](file:///d:/Development/carefind/server/data/symptomRegistry.js) | Config | Registry data for all 13 supported primary symptoms | **COMPLETED** |
| [extractionLayer.service.js](file:///d:/Development/carefind/server/services/extractionLayer.service.js) | Engine | LLM-based entity extraction and state merger | **COMPLETED** |
| [emergencyLayer.service.js](file:///d:/Development/carefind/server/services/emergencyLayer.service.js) | Engine | Rule-based critical emergency detector | **COMPLETED** |
| [missingInfoEngine.service.js](file:///d:/Development/carefind/server/services/missingInfoEngine.service.js) | Engine | Computes missing parameters from state vs registry | **COMPLETED** |
| [priorityEngine.service.js](file:///d:/Development/carefind/server/services/priorityEngine.service.js) | Engine | Scores clinical questions by severity/type | **COMPLETED** |
| [questionGenerator.service.js](file:///d:/Development/carefind/server/services/questionGenerator.service.js) | Engine | LLM natural-language question formulation | **COMPLETED** |
| [dispositionEngine.service.js](file:///d:/Development/carefind/server/services/dispositionEngine.service.js) | Engine | Computes final urgency disposition & specialty recommendations | **COMPLETED** |
| [session.service.js](file:///d:/Development/carefind/server/services/session.service.js) | Service | Refactored database operations from Redis to MongoDB | **COMPLETED** |
| [triage.controller.js](file:///d:/Development/carefind/server/controllers/triage.controller.js) | Controller | Triage endpoints `/start` and `/message` using V3 pipeline | **COMPLETED** |
| [session.controller.js](file:///d:/Development/carefind/server/controllers/session.controller.js) | Controller | Session operations hooked to the Mongoose `SessionService` | **COMPLETED** |
| [triage.routes.js](file:///d:/Development/carefind/server/routes/triage.routes.js) | Routes | Hooked up `protect` middleware to secure triage endpoints | **COMPLETED** |
| [analyze/page.tsx](file:///d:/Development/carefind/frontend/app/(pages)/analyze/page.tsx) | UI | Beautiful clinical intake, chat assistant, and dashboard | **COMPLETED** |

---

## How to Verify & Test

### Run Unit Tests
Unit tests exist for `EmergencyLayer`, `MissingInfoEngine`, and `PriorityEngine`:
```bash
cd server
npm test
```

### Manual Testing
1. Navigate to `/analyze`.
2. Input demographics (e.g. 35, Male, 1 day) and primary symptom ("severe chest pain").
3. Verify that the conversational flow asks prioritized questions (e.g. radiation or shortness of breath).
4. Select/answer the questions. Once finished, verify the Cardiology specialist recommendation card appears.
5. Check if the "See Nearby Specialist" button triggers geolocation and loads matching doctors.
