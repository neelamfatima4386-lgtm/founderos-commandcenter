
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_founder() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.can_see_lead(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.can_see_task(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.can_see_content(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.bootstrap_account(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_founder() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_see_lead(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_see_task(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_see_content(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_account(text) TO authenticated;

-- SAMPLE LEADS
INSERT INTO public.leads (id, business_name, industry, location, website, instagram, linkedin, email, phone, decision_maker, lead_source, lead_score, priority, stage, tags, notes, website_problems, opportunity, next_follow_up, is_sample, sample_role, created_at)
VALUES
 ('11111111-1111-4111-8111-000000000001','Dubai Fitness Studio','Fitness','Dubai, UAE','dubaifitstudio.ae','@dubaifitstudio','/company/dubai-fitness-studio','hello@dubaifitstudio.ae','+971 50 118 2244','Omar Haddad','Instagram',88,'hot','demo_building','{sample,gulf,fitness}','High ad spend, weak landing page.','No mobile layout, 6s load time, no booking flow.','Rebuild as a fast booking-first site with class schedule.',current_date + 1,true,'founder',now() - interval '2 days'),
 ('11111111-1111-4111-8111-000000000002','Marina Dental Clinic','Healthcare','Abu Dhabi, UAE','marinadental.ae','@marinadental','/company/marina-dental','front@marinadental.ae','+971 55 442 9010','Dr. Layla Farouk','Google Maps',76,'hot','deployed','{sample,healthcare}','Wants online appointments.','Outdated design, no SEO, no reviews section.','Appointment funnel + treatment pages.',current_date,true,'founder',now() - interval '3 days'),
 ('11111111-1111-4111-8111-000000000003','Karachi Coffee Roasters','F&B','Karachi, PK','kcroasters.pk','@kcroasters',null,'orders@kcroasters.pk','+92 300 220 4411','Bilal Ahmed','LinkedIn',64,'warm','analyzing','{sample,fnb}','Strong brand, weak web presence.','Shopify theme unedited, no wholesale page.','Wholesale lead capture + subscription page.',current_date + 3,true,'founder',now() - interval '1 day'),
 ('11111111-1111-4111-8111-000000000004','Nova Real Estate','Real Estate','Dubai, UAE','novaproperties.ae',null,'/company/nova-properties','info@novaproperties.ae','+971 52 771 8890','Sara Nasser','Referral',81,'hot','contacted','{sample,realestate}','Replied asking for pricing.','Listings not filterable, slow gallery.','Listing search + agent lead routing.',current_date,true,'founder',now() - interval '5 days'),
 ('11111111-1111-4111-8111-000000000005','Peak Interior Design','Interiors','Riyadh, KSA','peakinteriors.sa','@peakinteriors',null,'studio@peakinteriors.sa',null,'Faisal Al Otaibi','Instagram',59,'warm','prompt_ready','{sample,design}','Portfolio heavy, no CTA.','No contact form, images 4MB each.','Portfolio + consultation booking.',current_date + 2,true,'founder',now() - interval '1 day'),
 ('11111111-1111-4111-8111-000000000006','Atlas Logistics','Logistics','Sharjah, UAE','atlas-logistics.ae',null,'/company/atlas-logistics','sales@atlas-logistics.ae','+971 6 555 1200','Hamza Iqbal','Cold Email',52,'cold','new','{sample,b2b}','Enterprise-ish, long cycle.','No website, only PDF brochure.','Full corporate site with quote calculator.',null,true,'founder',now() - interval '6 hours'),
 ('11111111-1111-4111-8111-000000000007','Bloom Beauty Lounge','Beauty','Doha, QA','bloombeauty.qa','@bloombeautyqa',null,'hi@bloombeauty.qa','+974 33 220 118','Noor Al Kuwari','Instagram',70,'warm','message_ready','{sample,beauty}','Ready to send outreach.','Booking via DM only.','Online booking + service menu.',current_date + 1,true,'founder',now() - interval '2 days'),
 ('11111111-1111-4111-8111-000000000008','Vertex Accounting','Professional Services','Lahore, PK','vertexaccounting.pk',null,'/company/vertex-accounting','contact@vertexaccounting.pk',null,'Adeel Raza','LinkedIn',67,'warm','replied','{sample,services}','Asked for a call next week.','Generic template, no trust signals.','Authority site + lead magnet.',current_date + 4,true,'founder',now() - interval '8 days'),
 ('11111111-1111-4111-8111-000000000009','Summit Auto Detailing','Automotive','Dubai, UAE','summitdetailing.ae','@summitdetailing',null,'book@summitdetailing.ae','+971 58 990 3312','Yousef Kamal','Referral',74,'hot','meeting','{sample,automotive}','Meeting booked Thursday.','No pricing page, no reviews.','Pricing + mobile booking flow.',current_date + 2,true,'founder',now() - interval '10 days'),
 ('11111111-1111-4111-8111-00000000000a','Cedar Law Chambers','Legal','Amman, JO','cedarlaw.jo',null,'/company/cedar-law','office@cedarlaw.jo',null,'Rania Khoury','Cold Email',41,'cold','follow_up','{sample,legal}','No response to first message.','Broken mobile nav.','Practice-area pages + intake form.',current_date,true,'founder',now() - interval '12 days');

INSERT INTO public.demos (lead_id, research_done, prompt_done, build_done, deploy_done, demo_ready, lovable_url, vercel_url, demo_url, deployed_at)
VALUES
 ('11111111-1111-4111-8111-000000000001',true,true,false,false,false,'https://lovable.dev/projects/demo-dubai-fitness',null,null,null),
 ('11111111-1111-4111-8111-000000000002',true,true,true,true,true,'https://lovable.dev/projects/demo-marina-dental','https://marina-dental-demo.vercel.app','https://marina-dental-demo.vercel.app',now() - interval '1 day'),
 ('11111111-1111-4111-8111-000000000003',true,false,false,false,false,null,null,null,null),
 ('11111111-1111-4111-8111-000000000004',true,true,true,true,true,'https://lovable.dev/projects/demo-nova','https://nova-properties-demo.vercel.app','https://nova-properties-demo.vercel.app',now() - interval '4 days'),
 ('11111111-1111-4111-8111-000000000005',true,true,false,false,false,null,null,null,null),
 ('11111111-1111-4111-8111-000000000007',true,true,true,true,true,'https://lovable.dev/projects/demo-bloom','https://bloom-beauty-demo.vercel.app','https://bloom-beauty-demo.vercel.app',now() - interval '2 days'),
 ('11111111-1111-4111-8111-000000000008',true,true,true,true,true,'https://lovable.dev/projects/demo-vertex','https://vertex-accounting-demo.vercel.app','https://vertex-accounting-demo.vercel.app',now() - interval '7 days'),
 ('11111111-1111-4111-8111-000000000009',true,true,true,true,true,'https://lovable.dev/projects/demo-summit','https://summit-detailing-demo.vercel.app','https://summit-detailing-demo.vercel.app',now() - interval '9 days'),
 ('11111111-1111-4111-8111-00000000000a',true,true,true,true,true,'https://lovable.dev/projects/demo-cedar','https://cedar-law-demo.vercel.app','https://cedar-law-demo.vercel.app',now() - interval '11 days');

INSERT INTO public.outreach (lead_id, message, channel, status, message_ready, message_sent, first_contact_at, followup_1_at, replied_at, meeting_at, next_follow_up, outcome)
VALUES
 ('11111111-1111-4111-8111-000000000004','Hi Sara — built a quick demo of a faster listings experience for Nova. Want the link?','linkedin','contacted',true,true,now() - interval '3 days',null,null,null,current_date,null),
 ('11111111-1111-4111-8111-000000000007','Hi Noor — made a booking-first demo for Bloom. 60 seconds to look at?','instagram','not_contacted',true,false,null,null,null,null,current_date + 1,null),
 ('11111111-1111-4111-8111-000000000008','Hi Adeel — rebuilt your homepage as a demo, load time went 6.1s to 0.9s.','linkedin','replied',true,true,now() - interval '6 days',now() - interval '3 days',now() - interval '1 day',null,current_date + 4,'Asked for a call next week'),
 ('11111111-1111-4111-8111-000000000009','Hi Yousef — demo with pricing + mobile booking is live.','whatsapp','meeting',true,true,now() - interval '9 days',now() - interval '6 days',now() - interval '5 days',now() + interval '2 days',null,'Meeting booked'),
 ('11111111-1111-4111-8111-00000000000a','Hi Rania — quick demo of a practice-area site for Cedar Law.','email','follow_up_due',true,true,now() - interval '11 days',now() - interval '7 days',null,null,current_date,null),
 ('11111111-1111-4111-8111-000000000002','Hi Dr. Layla — appointment-first demo ready for Marina Dental.','email','contacted',true,true,now() - interval '1 day',null,null,null,current_date,null);

INSERT INTO public.follow_ups (lead_id, channel, due_date, note)
VALUES
 ('11111111-1111-4111-8111-000000000004','linkedin',current_date,'Send pricing breakdown'),
 ('11111111-1111-4111-8111-00000000000a','email',current_date,'Second follow-up, reference load speed'),
 ('11111111-1111-4111-8111-000000000002','email',current_date,'Check if she opened the demo'),
 ('11111111-1111-4111-8111-000000000008','linkedin',current_date + 4,'Confirm call time');

INSERT INTO public.lead_notes (lead_id, body) VALUES
 ('11111111-1111-4111-8111-000000000001','Owner active on Instagram between 8-10pm local — send outreach then.'),
 ('11111111-1111-4111-8111-000000000009','Wants to see 3 pricing tiers on the call.');

-- SAMPLE TASKS (founder)
INSERT INTO public.tasks (title, description, category, status, priority, due_at, recurrence, lead_id, is_sample, sample_role, completed_at)
VALUES
 ('Find 10 qualified leads','Target Gulf service businesses with paid ads and weak sites.','Leads','completed','urgent',now() + interval '3 hours','daily',null,true,'founder',now() - interval '4 hours'),
 ('Analyze lead: Dubai Fitness Studio','Audit speed, mobile, booking flow.','Leads','completed','high',now() + interval '4 hours','none','11111111-1111-4111-8111-000000000001',true,'founder',now() - interval '3 hours'),
 ('Generate AI prompt: Dubai Fitness Studio','Write the build prompt externally, paste result into demo notes.','Demo','completed','high',now() + interval '5 hours','none','11111111-1111-4111-8111-000000000001',true,'founder',now() - interval '2 hours'),
 ('Build demo: Dubai Fitness Studio','Booking-first layout, class schedule, sticky CTA.','Demo','in_progress','urgent',now() + interval '6 hours','none','11111111-1111-4111-8111-000000000001',true,'founder',null),
 ('Deploy demo: Karachi Coffee Roasters','Ship to Vercel and copy the URL into the lead.','Demo','pending','medium',now() + interval '8 hours','none','11111111-1111-4111-8111-000000000003',true,'founder',null),
 ('Write personalized message: Bloom Beauty Lounge','Reference DM-only booking problem.','Outreach','pending','high',now() + interval '7 hours','none','11111111-1111-4111-8111-000000000007',true,'founder',null),
 ('Send 10 outreach messages','LinkedIn + Instagram mix.','Outreach','in_progress','urgent',now() + interval '9 hours','daily',null,true,'founder',null),
 ('Follow up: Cedar Law Chambers','Second touch, lead with speed gain.','Outreach','pending','medium',now() + interval '2 hours','none','11111111-1111-4111-8111-00000000000a',true,'founder',null),
 ('Prep meeting: Summit Auto Detailing','Three pricing tiers + demo walkthrough.','Sales','blocked','high',now() + interval '2 days','none','11111111-1111-4111-8111-000000000009',true,'founder',null),
 ('Weekly pipeline review','Clean stale leads, re-score pipeline.','Ops','pending','low',now() + interval '3 days','weekly',null,true,'founder',null);

-- SAMPLE TASKS (co-founder)
INSERT INTO public.tasks (title, description, category, status, priority, due_at, recurrence, daily_target, is_sample, sample_role, completed_at)
VALUES
 ('LinkedIn engagement','Comment on 15 founder posts in our niche.','LinkedIn','completed','high',now() + interval '4 hours','daily',15,true,'co_founder',now() - interval '2 hours'),
 ('LinkedIn posting','Publish approved post of the day.','LinkedIn','pending','high',now() + interval '6 hours','daily',1,true,'co_founder',null),
 ('X engagement','20 replies to build-in-public accounts.','X','in_progress','medium',now() + interval '5 hours','daily',20,true,'co_founder',null),
 ('X posting','Ship one thread from approved content.','X','pending','medium',now() + interval '7 hours','daily',1,true,'co_founder',null),
 ('Instagram management','3 stories + reply to DMs.','Instagram','completed','medium',now() + interval '3 hours','daily',3,true,'co_founder',now() - interval '1 hour'),
 ('Content ideas','Submit 3 new content ideas.','Content','completed','medium',now() + interval '5 hours','daily',3,true,'co_founder',now() - interval '30 minutes'),
 ('Content writing','Draft the case-study carousel.','Content','in_progress','high',now() + interval '8 hours','daily',1,true,'co_founder',null),
 ('Fix rejected LinkedIn post','Tighten the hook, resubmit.','Content','pending','urgent',now() + interval '2 hours','none',null,true,'co_founder',null);

-- SAMPLE CONTENT
INSERT INTO public.content (title, platform, content_type, idea, draft, caption, hashtags, status, scheduled_at, founder_feedback, is_sample, sample_role)
VALUES
 ('How we ship a client demo in 90 minutes','linkedin','post','Break down the exact demo pipeline.','We build the demo before the pitch. Here is the 7-step pipeline...','Demo-first outreach beats cold pitching.','#agency #webdesign','submitted',null,null,true,'co_founder'),
 ('3 website mistakes killing Gulf service businesses','instagram','carousel','Audit-style carousel with before/after.','Slide 1: 6 second load time...','Most local sites lose the lead in 3 seconds.','#dubaibusiness #webdesign','submitted',null,null,true,'co_founder'),
 ('Case study: Marina Dental','x','thread','Thread on the appointment funnel rebuild.','1/ We rebuilt a dental clinic site around one action: book.','','#buildinpublic','under_review',null,null,true,'co_founder'),
 ('Why we never send a proposal first','linkedin','personal_brand','Founder POV post.','Proposals are a tax on trust you have not earned yet...','','#founder','submitted',null,null,true,'co_founder'),
 ('Reel: 30 second site teardown','instagram','reel','Screen-record teardown of a slow site.','Hook: this site costs them 40 leads a month.','','#teardown','rejected',null,'Hook is too soft — open with the number, not the setup.',true,'co_founder'),
 ('Behind the scenes: our lead scoring','linkedin','educational','Explain the 0-100 scoring model.','Score = ad spend + site weakness + reachability...','','#growth','approved',now() + interval '1 day',null,true,'co_founder'),
 ('Client win: Summit Auto Detailing','linkedin','case_study','Share pricing page result.','Draft pending numbers from the call.','','#casestudy','draft',null,null,true,'co_founder'),
 ('Idea: outreach message teardown series','x','thread','Weekly teardown of our own messages.',null,null,null,'idea',null,null,true,'co_founder'),
 ('Scheduled: 5 signs your site is losing money','instagram','post','Checklist post.','1. Load time over 3s...','Save this before your next ad campaign.','#smallbusiness','scheduled',now() + interval '2 days',null,true,'co_founder'),
 ('Published: our first 30 days of ElevateX','linkedin','post','Transparent recap.','30 days, 210 leads, 64 demos, 11 replies...','','#buildinpublic','published',now() - interval '2 days',null,true,'co_founder');

-- SAMPLE NOTIFICATIONS
INSERT INTO public.notifications (type, title, body, link, read, is_sample, sample_role) VALUES
 ('content_submitted','Content submitted for approval','Co-Founder submitted "How we ship a client demo in 90 minutes"','/content/approvals',false,true,'founder'),
 ('follow_up_due','3 follow-ups due today','Nova Real Estate, Cedar Law Chambers, Marina Dental','/outreach',false,true,'founder'),
 ('task_completed','Task completed','LinkedIn engagement completed by Co-Founder','/activity',false,true,'founder'),
 ('deadline','Deadline approaching','Build demo: Dubai Fitness Studio is due in 6 hours','/daily-mission',false,true,'founder'),
 ('new_lead','New lead added','Atlas Logistics was added to the pipeline','/leads',true,true,'founder'),
 ('content_rejected','Revision requested','Founder requested changes on "Reel: 30 second site teardown"','/content',false,true,'co_founder'),
 ('task_assigned','New task assigned','Fix rejected LinkedIn post','/my-tasks',false,true,'co_founder'),
 ('content_approved','Content approved','"Behind the scenes: our lead scoring" was approved and scheduled','/content',true,true,'co_founder');

-- SAMPLE CALENDAR
INSERT INTO public.calendar_events (title, event_type, starts_at, ends_at, lead_id, is_sample, sample_role) VALUES
 ('Demo call — Summit Auto Detailing','meeting',now() + interval '2 days' + interval '3 hours',now() + interval '2 days' + interval '4 hours','11111111-1111-4111-8111-000000000009',true,'founder'),
 ('Follow-up — Nova Real Estate','follow_up',now() + interval '4 hours',null,'11111111-1111-4111-8111-000000000004',true,'founder'),
 ('Discovery call — Vertex Accounting','meeting',now() + interval '4 days' + interval '2 hours',now() + interval '4 days' + interval '3 hours','11111111-1111-4111-8111-000000000008',true,'founder'),
 ('Weekly review','deadline',now() + interval '3 days',null,null,true,'founder'),
 ('Publish LinkedIn post','content',now() + interval '1 day',null,null,true,'co_founder'),
 ('Instagram carousel goes live','content',now() + interval '2 days',null,null,true,'co_founder');

-- SAMPLE NOTES
INSERT INTO public.notes (title, body, tags, pinned, lead_id, is_sample, sample_role) VALUES
 ('Outreach hook library','Openers that got replies: load-time number, lost-leads math, competitor comparison.','{sample,outreach}',true,null,true,'founder'),
 ('Demo build checklist','Hero with one CTA, proof block, service list, booking, mobile pass, Lighthouse > 90.','{sample,demo}',true,null,true,'founder'),
 ('Dubai Fitness — call prep','Owner cares about class fill rate, not design awards.','{sample}',false,'11111111-1111-4111-8111-000000000001',true,'founder'),
 ('Content voice guide','Short lines. Numbers over adjectives. No hype words.','{sample,content}',true,null,true,'co_founder');

-- SAMPLE ACTIVITY
INSERT INTO public.activity_logs (entity_type, action, description, is_sample, sample_role, created_at) VALUES
 ('task','completed','Completed LinkedIn engagement (15/15 comments)',true,'co_founder',now() - interval '2 hours'),
 ('content','submitted','Submitted 3 content ideas for review',true,'co_founder',now() - interval '90 minutes'),
 ('task','completed','Completed Instagram management (3 stories)',true,'co_founder',now() - interval '1 hour'),
 ('content','submitted','Submitted LinkedIn post "How we ship a client demo in 90 minutes"',true,'co_founder',now() - interval '45 minutes'),
 ('lead','created','Added Atlas Logistics to the pipeline',true,'founder',now() - interval '6 hours'),
 ('demo','deployed','Deployed demo for Marina Dental Clinic',true,'founder',now() - interval '1 day'),
 ('outreach','sent','Sent outreach to Nova Real Estate',true,'founder',now() - interval '3 days');
