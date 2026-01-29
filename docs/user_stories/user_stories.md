# General User Stories

## Overview

User stories for general users (Business Users, Analysts, Managers) interacting with the Banking ML Pipeline.

## Role Definition

**Role**: General User
**Access Level**: Basic to Medium
**Responsibilities**: View reports, run predictions, analyze results

---

## Dashboard & Navigation

### USER-001: View Personal Dashboard
**As a** User
**I want to** see a personalized dashboard when I log in
**So that** I can quickly access my most used features

**Acceptance Criteria:**
- Dashboard shows my department's use cases
- Shows recent activity
- Shows pending tasks
- Shows key metrics
- Can customize widgets

**Priority:** High
**Sprint:** 1

---

### USER-002: Navigate by Department
**As a** User
**I want to** navigate to my department's section
**So that** I can access relevant use cases

**Acceptance Criteria:**
- Left sidebar shows all departments
- Can expand department to see use cases
- Shows active/inactive status
- Shows use case count per department
- Remembers last visited

**Priority:** High
**Sprint:** 1

---

### USER-003: Search Across System
**As a** User
**I want to** search for use cases, reports, and data
**So that** I can quickly find what I need

**Acceptance Criteria:**
- Global search bar available
- Searches across all content types
- Shows categorized results
- Supports filters
- Shows recent searches

**Priority:** Medium
**Sprint:** 2

---

### USER-004: View Notifications
**As a** User
**I want to** view my notifications
**So that** I stay informed about important events

**Acceptance Criteria:**
- Shows unread count
- Can mark as read
- Can filter by type
- Links to relevant content
- Can configure preferences

**Priority:** Medium
**Sprint:** 2

---

### USER-005: Access Help & Documentation
**As a** User
**I want to** access help documentation
**So that** I can learn how to use the system

**Acceptance Criteria:**
- Context-sensitive help
- Searchable documentation
- Video tutorials available
- FAQ section
- Support contact info

**Priority:** Low
**Sprint:** 3

---

## Use Case Interaction

### USER-006: View Use Case Details
**As a** User
**I want to** view detailed information about a use case
**So that** I understand what it does and how to use it

**Acceptance Criteria:**
- Shows use case description
- Shows model information
- Shows performance metrics
- Shows recent runs
- Shows documentation links

**Priority:** High
**Sprint:** 1

---

### USER-007: Run Manual Prediction
**As a** User
**I want to** run a manual prediction
**So that** I can get ML insights on demand

**Acceptance Criteria:**
- Can upload input data
- Can configure parameters
- Shows processing status
- Displays results clearly
- Can download results

**Priority:** High
**Sprint:** 1

---

### USER-008: View Prediction Results
**As a** User
**I want to** view prediction results in detail
**So that** I can understand and act on them

**Acceptance Criteria:**
- Shows prediction values
- Shows confidence scores
- Shows feature contributions
- Shows visualization
- Can export results

**Priority:** High
**Sprint:** 1

---

### USER-009: Compare Multiple Predictions
**As a** User
**I want to** compare multiple prediction runs
**So that** I can track changes over time

**Acceptance Criteria:**
- Can select runs to compare
- Side-by-side comparison view
- Highlights differences
- Shows trend analysis
- Can export comparison

**Priority:** Medium
**Sprint:** 3

---

### USER-010: Save Favorite Use Cases
**As a** User
**I want to** save my frequently used use cases
**So that** I can quickly access them

**Acceptance Criteria:**
- Can mark as favorite
- Favorites show on dashboard
- Can organize favorites
- Quick access from any page
- Syncs across devices

**Priority:** Low
**Sprint:** 3

---

## Data Management

### USER-011: Upload Data Files
**As a** User
**I want to** upload data files for processing
**So that** I can run predictions on my data

**Acceptance Criteria:**
- Supports CSV, Excel, JSON
- Shows upload progress
- Validates file format
- Shows data preview
- Stores upload history

**Priority:** High
**Sprint:** 1

---

### USER-012: Preview Data Before Processing
**As a** User
**I want to** preview my data before running predictions
**So that** I can verify it's correct

**Acceptance Criteria:**
- Shows first N rows
- Shows column statistics
- Highlights data issues
- Can edit/fix issues
- Shows schema validation

**Priority:** High
**Sprint:** 1

---

### USER-013: View Historical Data
**As a** User
**I want to** view historical prediction data
**So that** I can analyze trends

**Acceptance Criteria:**
- Filter by date range
- Filter by use case
- Sortable columns
- Pagination support
- Export capability

**Priority:** Medium
**Sprint:** 2

---

### USER-014: Download Results
**As a** User
**I want to** download prediction results
**So that** I can use them in other tools

**Acceptance Criteria:**
- Multiple formats (CSV, Excel, JSON)
- Include metadata option
- Include visualizations option
- Scheduled downloads
- Download history

**Priority:** Medium
**Sprint:** 2

---

### USER-015: Schedule Data Refresh
**As a** User
**I want to** schedule automatic data refresh
**So that** predictions stay current

**Acceptance Criteria:**
- Set refresh frequency
- Choose data source
- Set notification preferences
- View refresh history
- Pause/resume schedule

**Priority:** Medium
**Sprint:** 3

---

## Reports & Visualization

### USER-016: View Standard Reports
**As a** User
**I want to** view standard reports
**So that** I can understand performance and trends

**Acceptance Criteria:**
- Pre-built report templates
- Customizable date ranges
- Multiple visualization types
- Drill-down capability
- Export to PDF/Excel

**Priority:** High
**Sprint:** 2

---

### USER-017: Create Custom Report
**As a** User
**I want to** create custom reports
**So that** I can analyze data my way

**Acceptance Criteria:**
- Drag-drop report builder
- Multiple data sources
- Custom calculations
- Save report templates
- Share with team

**Priority:** Medium
**Sprint:** 3

---

### USER-018: View Interactive Dashboards
**As a** User
**I want to** view interactive dashboards
**So that** I can explore data visually

**Acceptance Criteria:**
- Interactive charts
- Filter and drill-down
- Real-time updates
- Mobile responsive
- Embed capability

**Priority:** High
**Sprint:** 2

---

### USER-019: Set Up Alerts
**As a** User
**I want to** set up alerts for specific conditions
**So that** I'm notified of important changes

**Acceptance Criteria:**
- Define alert conditions
- Choose notification method
- Set alert frequency
- Pause/resume alerts
- View alert history

**Priority:** Medium
**Sprint:** 3

---

### USER-020: Share Reports with Team
**As a** User
**I want to** share reports with my team
**So that** we can collaborate on insights

**Acceptance Criteria:**
- Share via link
- Set access permissions
- Add comments
- Track who viewed
- Version history

**Priority:** Medium
**Sprint:** 3

---

## Explainability & Insights

### USER-021: View Feature Importance
**As a** User
**I want to** see which features influenced a prediction
**So that** I can understand the model's reasoning

**Acceptance Criteria:**
- Top features listed
- Importance percentages
- Visual representation
- Compare to average
- Feature descriptions

**Priority:** High
**Sprint:** 2

---

### USER-022: View SHAP Explanations
**As a** User
**I want to** view SHAP explanations
**So that** I can understand individual predictions

**Acceptance Criteria:**
- SHAP waterfall chart
- Feature contribution values
- Positive/negative impact shown
- Exportable visualizations
- Explanation text

**Priority:** High
**Sprint:** 2

---

### USER-023: Compare Predictions
**As a** User
**I want to** compare why two records got different predictions
**So that** I can understand the decision factors

**Acceptance Criteria:**
- Side-by-side comparison
- Highlight key differences
- Show feature deltas
- Explain impact of differences
- Save comparison

**Priority:** Medium
**Sprint:** 3

---

### USER-024: Request Human Review
**As a** User
**I want to** request human review for a prediction
**So that** edge cases get proper attention

**Acceptance Criteria:**
- Flag prediction for review
- Add review notes
- Assign to reviewer
- Track review status
- View review outcome

**Priority:** Medium
**Sprint:** 3

---

### USER-025: View Model Performance
**As a** User
**I want to** view model performance metrics
**So that** I can trust the predictions

**Acceptance Criteria:**
- Shows accuracy metrics
- Shows recent performance trend
- Compares to baseline
- Shows confidence intervals
- Explains metrics

**Priority:** Medium
**Sprint:** 2

---

## Profile & Settings

### USER-026: Update Profile
**As a** User
**I want to** update my profile information
**So that** my account is current

**Acceptance Criteria:**
- Edit name, contact info
- Change profile picture
- Update department
- Set timezone
- Update preferences

**Priority:** Low
**Sprint:** 2

---

### USER-027: Change Password
**As a** User
**I want to** change my password
**So that** my account stays secure

**Acceptance Criteria:**
- Verify current password
- Set new password
- Password strength indicator
- Confirmation required
- Notification sent

**Priority:** High
**Sprint:** 1

---

### USER-028: Configure Notifications
**As a** User
**I want to** configure my notification preferences
**So that** I receive relevant alerts

**Acceptance Criteria:**
- Choose notification types
- Set email/in-app preferences
- Set quiet hours
- Digest option
- Test notification

**Priority:** Medium
**Sprint:** 2

---

### USER-029: Set Default Views
**As a** User
**I want to** set my default views and filters
**So that** the system remembers my preferences

**Acceptance Criteria:**
- Set default date range
- Set default filters
- Set default display mode
- Per-page settings
- Reset to defaults

**Priority:** Low
**Sprint:** 3

---

### USER-030: View Activity History
**As a** User
**I want to** view my activity history
**So that** I can track my actions

**Acceptance Criteria:**
- Shows all my actions
- Filter by type/date
- Shows prediction runs
- Shows report views
- Export capability

**Priority:** Low
**Sprint:** 3

---

## Story Summary

| Category | Stories | Priority High | Priority Medium | Priority Low |
|----------|---------|---------------|-----------------|--------------|
| Dashboard & Navigation | 5 | 2 | 2 | 1 |
| Use Case Interaction | 5 | 3 | 1 | 1 |
| Data Management | 5 | 2 | 3 | 0 |
| Reports & Visualization | 5 | 2 | 3 | 0 |
| Explainability & Insights | 5 | 2 | 3 | 0 |
| Profile & Settings | 5 | 1 | 2 | 2 |
| **Total** | **30** | **12** | **14** | **4** |
