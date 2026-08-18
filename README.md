# ElevateX Command Center

Build: ElevateX Founder OS — Founder + Co-Founder Operating Dashboard

Build a production-quality internal agency operating system called ElevateX Founder OS.

This is a private dashboard for managing my agency work, daily execution, leads, demos, outreach, content, tasks, time, and co-founder collaboration.

The application must feel like a premium modern SaaS product, not a generic admin template.

The main objective is:

Help the Founder know exactly what to work on, track every lead from discovery to outreach, measure daily execution, and manage the Co-Founder from one central command center.

1. CORE ARCHITECTURE

Create two separate role-based experiences:

Founder

Full access to the entire system.

Co-Founder

Separate dashboard with access only to assigned work, social-media tasks, content creation, and relevant activity.

Both dashboards use the same backend/database but have different permissions and views.

Implement proper authentication and role-based access control.

Roles:

founder
co_founder


Founder must never need to manually ask the Co-Founder for progress.

The Founder dashboard should automatically show Co-Founder activity, completed tasks, submitted content, pending approvals, and deadlines.

2. DESIGN DIRECTION

Use a premium dark SaaS aesthetic.

Design inspiration:

Linear

Notion

modern CRM dashboards

premium startup operating systems

Do NOT make it look like an old-school admin panel.

Visual style

Dark navy/black background

Slightly lighter elevated cards

Premium blue/violet accent

White primary text

Muted secondary text

Subtle borders

Soft shadows

16–20px rounded cards

Clean spacing

Modern typography such as Inter or Geist

Lucide icons

Smooth micro-interactions

Subtle hover states

Minimal but polished animations

Use a restrained claymorphism influence for cards, but do not make the entire interface bubbly.

The interface must be highly readable and professional.

Fully responsive for:

Desktop

Laptop

Tablet

Mobile

Desktop is the primary target.

3. MAIN APPLICATION LAYOUT

Use a persistent sidebar.

Founder sidebar:

Logo / ElevateX

Overview
Daily Mission
Leads
Pipeline
Demos
Outreach
Tasks
Content
Calendar
Analytics
Team
Activity
Notes

----------------

Settings
Logout


Co-Founder sidebar:

Logo / ElevateX

Overview
My Tasks
Social Activity
Content
Calendar
Activity

----------------

Settings
Logout


Top navigation:

Global search

Notifications

Current date

User avatar

User name

Role badge

4. FOUNDER OVERVIEW

This is the most important page.

The Founder should immediately understand:

What needs to be done today

How much has been completed

What is pending

What the Co-Founder completed

Which leads require action

What the next action should be

Header:

Good morning, Hamid 👋
Let's make today productive.


Display current date.

TODAY'S COMMAND CENTER

Create a large highlighted section:

TODAY'S MISSION

10 qualified leads
8 demos
10 outreach messages


Show progress bars for:

Leads

Demos

Deployments

Outreach

Example:

Leads
8 / 10
████████░░ 80%

Demos
6 / 8
███████░░░ 75%

Outreach
7 / 10
███████░░░ 70%


5. KPI CARDS

Show:

Leads

8 / 10

Demos

6 / 8

Websites Deployed

5 / 8

Outreach

7 / 10

Replies

3

Meetings

1

Clients

0

Productivity

82%

Each card should be clickable and open the relevant section.

6. NEXT ACTION SYSTEM

Create a prominent section:

WHAT SHOULD I DO NEXT?


The system should identify the highest-priority incomplete action.

Example:

Build Demo

Dubai Fitness Studio

Lead analysis completed
Prompt completed
Demo not completed

[CONTINUE]


The Continue button should open the relevant lead/task.

This should become the main productivity mechanism of the dashboard.

7. DAILY MISSION PAGE

Create a dedicated Daily Mission page.

Founder workflow:

1. Find Lead
2. Analyze Lead
3. Generate AI Prompt
4. Build Demo
5. Deploy Demo
6. Generate Personalized Message
7. Outreach


Allow the Founder to see all daily tasks.

Each task must support:

Checkbox

Status

Priority

Due time

Notes

Timer

Related lead

Completion timestamp

Statuses:

Pending
In Progress
Completed
Blocked


8. LEAD MANAGEMENT / CRM

Create a powerful Leads page.

Each lead should contain:

Business Name
Industry
Location
Website
Instagram
LinkedIn
Email
Phone
Decision Maker
Lead Source
Lead Score
Priority
Notes
Date Added
Assigned To


Lead priority:

Hot
Warm
Cold


Lead score:

0–100


Allow:

Search

Filters

Sorting

Tags

Bulk selection

Bulk status updates

9. LEAD PIPELINE

Create a Kanban pipeline:

NEW
↓
ANALYZING
↓
PROMPT READY
↓
DEMO BUILDING
↓
DEPLOYED
↓
MESSAGE READY
↓
CONTACTED
↓
FOLLOW-UP
↓
REPLIED
↓
MEETING
↓
WON / LOST


Cards should show:

Business name

Industry

Lead score

Current stage

Demo status

Outreach status

Next follow-up

Assigned person

Allow drag-and-drop between stages.

10. LEAD DETAIL PAGE

When opening a lead, show a complete workspace.

Header:

Business Name
Industry
Location
Lead Score
Status


Tabs:

Overview
Research
Demo
Outreach
Activity
Notes


RESEARCH TAB

Show:

Website

Social profiles

Contact information

Current website problems

Opportunity

Notes

Add editable fields.

11. DEMO WEBSITE TRACKER

Every lead must have a Demo section.

Track:

Lead Research       ✓
AI Prompt           ✓
Lovable Build       ✓
Vercel Deployment   ✓
Demo Ready          ✓


Store:

Lovable URL
Vercel URL
Demo URL
Created Date
Deployment Date


Buttons:

Open Demo
Open Lovable
Open Vercel
Copy URL


Allow manual status changes.

12. OUTREACH CRM

Create a dedicated Outreach page.

For every lead store:

Message
Channel
First Contact Date
Follow-up #1
Follow-up #2
Follow-up #3
Reply
Meeting
Outcome


Channels:

LinkedIn
Instagram
WhatsApp
Email
X
Other


Outreach statuses:

Not Contacted
Contacted
Follow-up Due
Replied
No Response
Meeting
Won
Lost


Show a "Follow-ups Due Today" section.

13. PERSONALIZED MESSAGE AREA

Inside every lead create:

Personalized Outreach Message


Allow:

Edit

Copy

Regenerate manually later

Save message

Mark as ready

Mark as sent

Do not require external AI integration for V1.

Keep the field ready for future AI integration.

14. TASK MANAGEMENT

Create a full Tasks system.

Founder can:

Create tasks

Edit tasks

Delete tasks

Assign tasks

Set priority

Set deadline

Add notes

Add subtasks

Set recurring tasks

Task priority:

Low
Medium
High
Urgent


Task status:

Pending
In Progress
Completed
Blocked


Recurring options:

Daily
Weekly
Monthly
Custom


15. TASK + LEAD RELATIONSHIP

Tasks can be linked to leads.

Example:

Task:
Build Demo

Lead:
Dubai Fitness Studio

Status:
In Progress


When a lead reaches a new stage, show the next logical task.

Do not automatically complete tasks unless explicitly configured.

16. TIME TRACKING

Create a Focus Timer.

Each task should have:

Start Timer
Pause
Resume
Stop


Track:

Time spent today
Time spent this week
Time per task
Time per lead


Show productivity analytics such as:

Average time per lead
Average time per demo
Average time spent on outreach


Create a dedicated Focus Mode screen with minimal distractions.

17. CONTENT MANAGEMENT SYSTEM

Create a shared Content Workspace.

Content workflow:

IDEA
↓
DRAFT
↓
SUBMITTED
↓
UNDER REVIEW
↓
APPROVED / REJECTED
↓
SCHEDULED
↓
PUBLISHED


Content fields:

Title
Platform
Content Type
Idea
Draft
Caption
Hashtags
Media
Author
Status
Scheduled Date
Founder Feedback
Created Date
Updated Date


Platforms:

LinkedIn
X
Instagram
Other


Content types:

Post
Carousel
Reel
Story
Thread
Educational
Promotional
Case Study
Personal Brand


18. CO-FOUNDER CONTENT SUBMISSION

Co-Founder should be able to:

Create ideas

Write drafts

Upload media

Submit content

View founder feedback

Edit rejected content

Resubmit

Founder should see:

Needs Approval: 4


19. FOUNDER CONTENT APPROVAL CENTER

Create a dedicated Founder page:

CONTENT NEEDING APPROVAL


Each submission should have:

Preview

Platform

Author

Content

Submission date

Actions:

Approve
Reject
Request Changes
Add Comment
Schedule


If rejected/request changes:

Co-Founder receives the update in their dashboard.

20. CONTENT CALENDAR

Create a visual calendar.

Show:

Drafts

Approved content

Scheduled posts

Published content

Support:

Day
Week
Month


Allow Founder to schedule approved content manually.

Do NOT integrate actual social media APIs in V1.

Build the internal planning system first.

21. CO-FOUNDER DASHBOARD

Create a completely separate dashboard.

Header:

Good morning, [Co-Founder Name]
Here is your work for today.


Show:

Today's Tasks
Completed
Pending
Overdue
Progress %


Main task categories:

LinkedIn

Engagement

Comments

Posting

X

Engagement

Replies

Posting

Instagram

Content

Stories

Engagement

Content

Ideas

Drafts

Submissions

22. CO-FOUNDER DAILY TASKS

Create separate recurring tasks.

Examples:

LinkedIn Engagement
X Engagement
Instagram Management
Content Ideas
Content Writing


Each task can have:

Daily target

Completion checkbox

Notes

Time spent

Deadline

Completion timestamp

Founder should be able to see these tasks.

23. CO-FOUNDER ACTIVITY FEED

Founder dashboard must include:

CO-FOUNDER ACTIVITY


Examples:

✓ LinkedIn engagement completed
✓ Submitted 3 content ideas
✓ Completed Instagram task
✓ Submitted LinkedIn post for approval


Each activity should show:

Action

Person

Date

Time

Create a full Activity page with filtering.

24. FOUNDER → CO-FOUNDER TASK ASSIGNMENT

Founder can create and assign tasks.

Fields:

Task
Description
Priority
Deadline
Assigned To
Recurring
Notes


Co-Founder receives it instantly in their task list.

Founder can see:

Assigned
In Progress
Completed
Overdue
Blocked


25. TEAM PAGE

Create a Team page.

Show:

Founder
Co-Founder


Each member card:

Name

Role

Current tasks

Completed today

Pending

Productivity

Last active

Founder can click Co-Founder to see their detailed activity.

26. ANALYTICS

Create Founder analytics.

Lead Metrics

Total Leads
Leads Today
Leads This Week
Demos
Deployments
Outreach
Replies
Meetings
Clients


Conversion Funnel

Leads
↓
Contacted
↓
Replies
↓
Meetings
↓
Clients


Calculate percentages automatically.

27. PRODUCTIVITY ANALYTICS

Show:

Tasks completed
Tasks overdue
Hours worked
Leads/hour
Demos/hour
Outreach/hour
Average lead completion time


Allow:

Today
7 Days
30 Days


28. WEEKLY REVIEW

Create a Weekly Review page.

Show:

Total Leads
Total Demos
Total Outreach
Replies
Meetings
Clients
Hours Worked
Tasks Completed


Also show:

Best Performing Day
Most Productive Task
Most Time-Consuming Task


Create a simple "Weekly Notes" section for Founder.

29. CALENDAR

Unified calendar should show:

Tasks

Deadlines

Follow-ups

Meetings

Content schedules

Recurring tasks

Use different visual indicators for different event types.

30. NOTIFICATION SYSTEM

Create an in-app notification center.

Notifications:

New task assigned
Task completed
Task overdue
Content submitted
Content approved
Content rejected
Revision requested
Follow-up due
Deadline approaching
New lead added
Demo completed


Unread notification count should appear in the top navigation.

31. NOTES

Create a simple Notes module.

Support:

Create note

Edit note

Delete note

Search notes

Pin note

Tags

Notes can optionally be linked to:

Lead

Task

Content

Project

32. GLOBAL SEARCH

Create global search accessible from the top navigation.

Search across:

Leads
Tasks
Content
Notes
Activity


Results should be grouped by type.

33. DATABASE STRUCTURE

Create a proper relational database.

Suggested tables:

users
profiles
roles
leads
lead_activities
lead_notes
tasks
task_subtasks
task_time_entries
outreach
follow_ups
demos
content
content_feedback
content_schedule
notifications
calendar_events
notes
activity_logs
daily_goals
weekly_reviews


Use proper relationships.

Every important record should include:

id
created_at
updated_at


Where relevant include:

created_by
assigned_to
status
priority


34. SECURITY

Implement proper authentication.

Use role-based permissions.

Founder:

FULL ACCESS


Co-Founder:

OWN TASKS
OWN ACTIVITY
CONTENT
ASSIGNED WORK
RELEVANT CALENDAR


Co-Founder must NOT be able to:

Access Founder-only analytics

Modify Founder settings

Delete leads unless explicitly permitted

Modify other users' private tasks

Change roles

Access sensitive Founder data

Use backend/database security rules, not only frontend hiding.

35. SAMPLE DATA

Populate the application with realistic demo data so the UI does not look empty.

Create sample:

Leads

Tasks

Demos

Outreach

Content submissions

Notifications

Activity

Calendar events

Clearly mark sample/demo data where appropriate.

36. EMPTY STATES

Every page needs a polished empty state.

Example:

No leads yet.

Start building your pipeline.

[Add Lead]


Do not leave blank white/dark areas.

37. LOADING + ERROR STATES

Add proper:

Skeleton loaders

Loading indicators

Error messages

Success toast

Confirmation dialogs

Examples:

Task created successfully
Content submitted for approval
Lead updated
Changes saved


38. DASHBOARD QUICK ACTIONS

Founder dashboard should have quick action buttons:

+ Add Lead
+ Create Task
+ Add Content
+ Add Note
+ Add Follow-up


Co-Founder:

+ New Content
+ Add Idea
+ Update Task


39. IMPORTANT USER EXPERIENCE RULE

The application should minimize manual data entry.

Whenever possible:

Reuse lead information

Automatically connect tasks to leads

Automatically update dashboard counters

Automatically calculate progress

Automatically create activity records

Automatically show pending approvals

Automatically show overdue tasks

Automatically show follow-ups due today

But do NOT perform destructive or irreversible actions automatically.

40. FOUNDER DAILY WORKFLOW

The system must support this exact workflow:

1. Find 8–10 leads
        ↓
2. Add leads to CRM
        ↓
3. Analyze lead
        ↓
4. Generate AI prompt externally
        ↓
5. Build demo using Lovable
        ↓
6. Deploy demo using Vercel
        ↓
7. Generate personalized message
        ↓
8. Send outreach
        ↓
9. Track response
        ↓
10. Follow up
        ↓
11. Book meeting
        ↓
12. Close client


The dashboard should make this workflow visible and measurable.

41. CO-FOUNDER WORKFLOW

Daily Tasks
      ↓
LinkedIn Engagement
      ↓
X Engagement
      ↓
Instagram
      ↓
Content Ideas
      ↓
Content Draft
      ↓
Submit to Founder
      ↓
Founder Approval
      ↓
Schedule
      ↓
Published


42. DO NOT BUILD THESE IN V1

Do not overcomplicate V1 with:

Actual LinkedIn API automation

Actual X API automation

Actual Instagram publishing API

WhatsApp API

Email automation

AI API integrations

Complex billing

Client portal

Multi-company SaaS

Payment system

However, structure the database and code so these can be added later.

43. FUTURE AI-READY ARCHITECTURE

Keep placeholders/hooks for future AI features:

AI Lead Analysis
AI Lead Scoring
AI Personalized Outreach
AI Follow-up Suggestions
AI Content Ideas
AI Daily Planning
AI Weekly Review
AI Productivity Coach


Future AI assistant could say:

You have 4 leads remaining today.
3 demos are ready.
2 follow-ups are due.
Your highest priority is Lead #24.


Do not implement expensive AI API functionality in V1.

44. FOUNDER COMMAND CENTER PRIORITY

The Founder dashboard should answer these questions immediately:

What do I need to do today?
How many leads have I completed?
How many demos are ready?
How much outreach have I sent?
Who needs follow-up?
What is blocking me?
What did my Co-Founder complete?
What content needs my approval?
What should I do next?


If the UI does not answer these quickly, improve the layout.

45. RESPONSIVE BEHAVIOR

Desktop:

Full sidebar

Multi-column dashboard

Dense data views

Tablet:

Collapsible sidebar

Responsive cards

Mobile:

Bottom navigation or collapsible navigation

Stacked KPI cards

Mobile-friendly Kanban

Touch-friendly buttons

Responsive tables/cards

46. CODE QUALITY

Use a clean component architecture.

Create reusable components for:

Cards

Buttons

Modals

Tables

Kanban cards

Status badges

Progress bars

Task items

Activity items

Charts

Forms

Avoid duplicated code.

Use TypeScript.

Keep the project maintainable.

47. FINAL PRODUCT FEEL

The finished application should feel like:

A personal Founder Operating System for running ElevateX.

Not:

"another task management app."

The Founder should open the dashboard in the morning and immediately understand:

TODAY'S TARGET
↓
CURRENT PROGRESS
↓
NEXT ACTION
↓
LEAD PIPELINE
↓
OUTREACH
↓
FOLLOW-UPS
↓
CO-FOUNDER ACTIVITY
↓
CONTENT APPROVALS


Prioritize usability, speed, clarity, and workflow over unnecessary visual effects.

Build the complete V1 with functional navigation, authentication, database structure, role permissions, CRUD operations, task management, lead pipeline, content approval workflow, activity tracking, analytics, notifications, and responsive UI.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/cfe444ec-6dc0-4396-b460-5380072a7a6a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
