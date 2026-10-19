export interface DailyTask {
  id: string;
  category: "Outreach" | "Demos" | "Follow-up" | "Onboarding" | "Finance" | "Content" | "Review" | "Admin";
  title: string;
  product: string;
  due: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  completed: boolean;
  timeSlot?: "Morning (8:00–10:00)" | "Late morning (10:00–13:00)" | "Afternoon (14:00–18:00)" | "Evening";
  contactPerson?: string;
  phone?: string;
}

export interface DayRhythm {
  dayName: string;
  dayIndex: number; // 0=Sun, 1=Mon, ..., 6=Sat
  morningSlot: string;
  lateMorningSlot: string;
  afternoonSlot: string;
  tasks: Omit<DailyTask, "id" | "completed">[];
}

// Recurring Weekly Rhythm (physical actions replaced with remote/cold outreach)
export const WEEKLY_RHYTHM_TEMPLATES: Record<number, DayRhythm> = {
  1: {
    dayName: "Monday",
    dayIndex: 1,
    morningSlot: "30 Adversoft calls and WhatsApp outreach",
    lateMorningSlot: "Targeted car yard phone & WhatsApp outreach (Vehisoft)",
    afternoonSlot: "Scheduled demos, meetings, and product fixes",
    tasks: [
      {
        title: "30 Adversoft cold calls & personalized WhatsApp messages to billboard operators",
        category: "Outreach",
        product: "Adversoft",
        due: "10:00 AM",
        priority: "HIGH",
        timeSlot: "Morning (8:00–10:00)",
      },
      {
        title: "Targeted car yard phone & WhatsApp video pitch outreach (Vehisoft digital job card pitch)",
        category: "Outreach",
        product: "Vehisoft",
        due: "01:00 PM",
        priority: "HIGH",
        timeSlot: "Late morning (10:00–13:00)",
      },
      {
        title: "Conduct scheduled live demos, client meetings, and software bug fixes",
        category: "Demos",
        product: "Multi-product",
        due: "05:00 PM",
        priority: "HIGH",
        timeSlot: "Afternoon (14:00–18:00)",
      },
      {
        title: "Dispatch follow-up proposal sheets and schedule tomorrow's outreach lists",
        category: "Follow-up",
        product: "Adversoft",
        due: "06:00 PM",
        priority: "MEDIUM",
        timeSlot: "Afternoon (14:00–18:00)",
      },
    ],
  },
  2: {
    dayName: "Tuesday",
    dayIndex: 2,
    morningSlot: "30 Adversoft calls and WhatsApp follow-ups",
    lateMorningSlot: "Laundromat & retail shop cold calling & email demo sprint",
    afternoonSlot: "Live demos, client setups, and product fixes",
    tasks: [
      {
        title: "30 Adversoft cold calls and personalized WhatsApp follow-ups to outdoor media owners",
        category: "Outreach",
        product: "Adversoft",
        due: "10:00 AM",
        priority: "HIGH",
        timeSlot: "Morning (8:00–10:00)",
      },
      {
        title: "Laundromat & retail shop cold calling sprint & remote Lost Money Checks (Versandry & LipaTim)",
        category: "Outreach",
        product: "Versandry",
        due: "01:00 PM",
        priority: "HIGH",
        timeSlot: "Late morning (10:00–13:00)",
      },
      {
        title: "Conduct scheduled software demos, live client setups, and product enhancements",
        category: "Demos",
        product: "Multi-product",
        due: "05:00 PM",
        priority: "HIGH",
        timeSlot: "Afternoon (14:00–18:00)",
      },
    ],
  },
  3: {
    dayName: "Wednesday",
    dayIndex: 3,
    morningSlot: "30 Adversoft calls and messages",
    lateMorningSlot: "Car yard executive phone calls & mystery test follow-ups",
    afternoonSlot: "Product demos, client meetings, and onboarding fixes",
    tasks: [
      {
        title: "30 Adversoft cold calls and personalized WhatsApp messages",
        category: "Outreach",
        product: "Adversoft",
        due: "10:00 AM",
        priority: "HIGH",
        timeSlot: "Morning (8:00–10:00)",
      },
      {
        title: "Car yard phone outreach sprint & follow-up on Mystery Shopper diagnostic reports (Vehisoft)",
        category: "Outreach",
        product: "Vehisoft",
        due: "01:00 PM",
        priority: "HIGH",
        timeSlot: "Late morning (10:00–13:00)",
      },
      {
        title: "Host Vehisoft & Adversoft live product walkthroughs for qualified prospects",
        category: "Demos",
        product: "Multi-product",
        due: "05:00 PM",
        priority: "HIGH",
        timeSlot: "Afternoon (14:00–18:00)",
      },
    ],
  },
  4: {
    dayName: "Thursday",
    dayIndex: 4,
    morningSlot: "30 Adversoft calls and messages",
    lateMorningSlot: "Laundries & retail shops phone outreach sprint",
    afternoonSlot: "Live demos, client onboarding setups, and product fixes",
    tasks: [
      {
        title: "30 Adversoft cold calls and pipeline follow-ups with free 48-hour live map offer",
        category: "Outreach",
        product: "Adversoft",
        due: "10:00 AM",
        priority: "HIGH",
        timeSlot: "Morning (8:00–10:00)",
      },
      {
        title: "Laundries & retail shops outreach sprint: 15 phone calls & remote LipaTim leak check counts",
        category: "Outreach",
        product: "LipaTim",
        due: "01:00 PM",
        priority: "HIGH",
        timeSlot: "Late morning (10:00–13:00)",
      },
      {
        title: "Set up and configure new Versandry or LipaTim clients (promised 3-day go-live)",
        category: "Onboarding",
        product: "Versandry",
        due: "05:00 PM",
        priority: "HIGH",
        timeSlot: "Afternoon (14:00–18:00)",
      },
    ],
  },
  5: {
    dayName: "Friday",
    dayIndex: 5,
    morningSlot: "Follow-ups across all four products",
    lateMorningSlot: "Content creation: record 3 short demonstration videos",
    afternoonSlot: "Client onboarding, support & Weekly Review at 17:00",
    tasks: [
      {
        title: "Multi-product follow-ups across all four pipelines (Adversoft, Vehisoft, Versandry, LipaTim)",
        category: "Follow-up",
        product: "Multi-product",
        due: "10:00 AM",
        priority: "HIGH",
        timeSlot: "Morning (8:00–10:00)",
      },
      {
        title: "Record 3 short videos: 7-day duka leak check, car yard reply speed audit, billboard map demo",
        category: "Content",
        product: "Multi-product",
        due: "01:00 PM",
        priority: "MEDIUM",
        timeSlot: "Late morning (10:00–13:00)",
      },
      {
        title: "Client onboarding implementations, thermal printer remote tests & SLA customer support",
        category: "Onboarding",
        product: "Multi-product",
        due: "04:30 PM",
        priority: "HIGH",
        timeSlot: "Afternoon (14:00–18:00)",
      },
      {
        title: "Conduct Friday 20-Minute Operational Executive Review at 17:00 (Reconcile weekly metrics & scorecard)",
        category: "Review",
        product: "Multi-product",
        due: "05:00 PM",
        priority: "HIGH",
        timeSlot: "Afternoon (14:00–18:00)",
      },
    ],
  },
  6: {
    dayName: "Saturday (Half Day)",
    dayIndex: 6,
    morningSlot: "Send mystery buyer enquiries & remote shop leak-check follow-ups",
    lateMorningSlot: "Behind-the-scenes admin, weekly pipeline planning, and next week's call list",
    afternoonSlot: "Afternoon Rest / Off (Avoid pitching car yards and laundries on customer rush)",
    tasks: [
      {
        title: "Send mystery buyer enquiries to car yards via Jiji/Cheki/WhatsApp & record reply times",
        category: "Outreach",
        product: "Vehisoft",
        due: "10:30 AM",
        priority: "MEDIUM",
        timeSlot: "Morning (8:00–10:00)",
      },
      {
        title: "Write 1-page Mystery Buyer diagnostic reports with response time benchmarking",
        category: "Review",
        product: "Vehisoft",
        due: "12:00 PM",
        priority: "MEDIUM",
        timeSlot: "Late morning (10:00–13:00)",
      },
      {
        title: "Behind-the-scenes administration, CRM pipeline hygiene, and compile Monday's 50-call list",
        category: "Admin",
        product: "Multi-product",
        due: "01:00 PM",
        priority: "MEDIUM",
        timeSlot: "Late morning (10:00–13:00)",
      },
    ],
  },
  0: {
    dayName: "Sunday",
    dayIndex: 0,
    morningSlot: "Scheduled Rest Day",
    lateMorningSlot: "Rest and Mental Recharge",
    afternoonSlot: "Review week ahead overview (Optional)",
    tasks: [
      {
        title: "Scheduled Rest & Mental Recharge (No cold outreach on Sunday)",
        category: "Admin",
        product: "Multi-product",
        due: "Evening",
        priority: "LOW",
        timeSlot: "Morning (8:00–10:00)",
      },
      {
        title: "Evening 15-min mental preparation for Monday 8:00 AM Adversoft 30-call sprint",
        category: "Admin",
        product: "Multi-product",
        due: "08:00 PM",
        priority: "LOW",
        timeSlot: "Evening",
      },
    ],
  },
};

// 4-Week Comprehensive Launch Plan (with physical tasks adapted to phone/email/WhatsApp outreach)
export interface RoadmapWeek {
  weekNumber: number;
  dateRange: string;
  theme: string;
  targetsSummary: string;
  days: {
    date: string;
    dayTitle: string;
    morningFocus: string;
    afternoonFocus: string;
    keyDeliverables: string[];
  }[];
}

export const FOUR_WEEK_LAUNCH_ROADMAP: RoadmapWeek[] = [
  {
    weekNumber: 1,
    dateRange: "19–24 October 2026",
    theme: "Get Ready and Start Conversations",
    targetsSummary: "CRM loaded with 180+ leads · 100 warm messages · 40 billboard calls · 15 remote checks · 10 mystery tests · 3–5 leak checks",
    days: [
      {
        date: "2026-10-19",
        dayTitle: "Monday 19 Oct — Set up the machine",
        morningFocus: "Set up WhatsApp Business ('Versaly', description, hours, product labels), save quick replies, set up CRM pipelines, finalize sales collateral.",
        afternoonFocus: "Contact 3 KRA-approved eTIMS integrators for API access/cost, set up M-Pesa Paybill & bank, draft client agreement, warm outreach to 30 contacts.",
        keyDeliverables: [
          "WhatsApp Business verified with product labels (Adversoft, Vehisoft, Versandry, LipaTim)",
          "CRM 4-stage pipeline loaded with 51 initial records",
          "eTIMS integrator API documentation & quotation received",
          "Standard Client Service Agreement drafted",
          "30 warm referral messages sent via WhatsApp",
        ],
      },
      {
        date: "2026-10-20",
        dayTitle: "Tuesday 20 Oct — Mashujaa Day: build lead lists",
        morningFocus: "Digital billboard & car yard mapping: compile 60 billboard operators & 40 car yards via digital directories, Street View, and dealer registries.",
        afternoonFocus: "Remote laundry & retail mapping: compile 80 laundromat & retail shop contacts. Enter 180 leads into CRM. Warm outreach to 30 more contacts.",
        keyDeliverables: [
          "60 billboard operators compiled with direct mobile numbers",
          "40 car yard dealer decision makers identified",
          "80 laundries & retail shops listed in CRM",
          "30 additional warm outreach messages sent",
        ],
      },
      {
        date: "2026-10-21",
        dayTitle: "Wednesday 21 Oct — Demo accounts and polish",
        morningFocus: "Create demo accounts for each product loaded with realistic Kenyan data (KES pricing, real roads, car models, laundry items).",
        afternoonFocus: "Feature verification, record 30-60 second mobile video walkthroughs of core workflows, warm outreach to 40 contacts & reply to responses.",
        keyDeliverables: [
          "4 demo accounts pre-seeded with Kenyan test data",
          "4 high-converting screen video demos recorded for WhatsApp",
          "40 warm outreach messages sent",
        ],
      },
      {
        date: "2026-10-22",
        dayTitle: "Thursday 22 Oct — First real outreach sprint",
        morningFocus: "8:00–10:00: Call 20 billboard operators using cold call script, offer free 48-hour live billboard map.",
        afternoonFocus: "10:00–13:00: Cold call sprint to 15 laundries and retail shops for remote Lost Money Checks. Afternoon: finalize sales sheets & send WhatsApp follow-ups.",
        keyDeliverables: [
          "20 billboard operators cold called (free map pitch)",
          "15 laundry & shop owners engaged with remote Lost Money Checks",
          "Sales sheets & demo videos dispatched to all contacted prospects",
        ],
      },
      {
        date: "2026-10-23",
        dayTitle: "Friday 23 Oct — Car yards and mystery tests",
        morningFocus: "8:00–10:00: Call 20 more billboard operators. 10:00–13:00: Send Mystery Buyer enquiries to 10 car yards on 3 cars each via Jiji/WhatsApp.",
        afternoonFocus: "Build requested 48-hour billboard maps. 17:00: First Friday 20-minute weekly review & scorecard check.",
        keyDeliverables: [
          "20 billboard operator calls completed",
          "10 car yards mystery tested with response timestamps logged",
          "Billboard demo maps built and delivered",
          "Friday 17:00 Weekly Review scorecard reconciled",
        ],
      },
      {
        date: "2026-10-24",
        dayTitle: "Saturday 24 Oct (Half Day) — Analysis & Planning",
        morningFocus: "Record car yards' reply times & follow-ups. Draft 1-page Mystery Buyer report for each dealer. LipaTim follow-ups.",
        afternoonFocus: "Behind-the-scenes admin & plan next week's call lists.",
        keyDeliverables: [
          "10 Mystery Buyer audit reports generated",
          "Call lists compiled for Monday morning",
        ],
      },
    ],
  },
  {
    weekNumber: 2,
    dateRange: "26–31 October 2026",
    theme: "Free Checks Into Demos",
    targetsSummary: "15 billboard map requests · 10 Vehisoft reports delivered · 20 remote checks · 8+ demos · 2–4 clients signed",
    days: [
      {
        date: "2026-10-26",
        dayTitle: "Monday 26 Oct — Present Mystery Reports & Book Demos",
        morningFocus: "8:00–10:00: 30 Adversoft calls & follow-ups; deliver finished maps.",
        afternoonFocus: "10:00–13:00: Call the 10 mystery-tested car yards with their audit reports to book 20-min demos. Afternoon: conduct first live demos.",
        keyDeliverables: [
          "30 Adversoft calls completed",
          "10 Mystery Buyer audit reports presented to car yard owners",
          "First 3 live product demos conducted",
        ],
      },
      {
        date: "2026-10-27",
        dayTitle: "Tuesday 27 Oct — Day-7 Leak Checks & First Closes",
        morningFocus: "8:00–10:00: 30 Adversoft calls. 10:00–13:00: Day-7 leak check reveal calls with retail shops.",
        afternoonFocus: "Call 15 new laundries and shops; present offers to shops with confirmed stock leakage; sign first LipaTim & Versandry clients.",
        keyDeliverables: [
          "Day-7 stock leak results presented to shops",
          "15 new laundry/shop cold calls completed",
          "First 2 paying clients signed (LipaTim / Versandry)",
        ],
      },
      {
        date: "2026-10-28",
        dayTitle: "Wednesday 28 Oct — Car Yard Mystery Sprint 2",
        morningFocus: "8:00–10:00: 30 Adversoft calls and follow-ups. 10:00–13:00: Phone 10 new car yards & initiate 10 new mystery tests.",
        afternoonFocus: "Conduct Vehisoft and Adversoft scheduled demos.",
        keyDeliverables: [
          "10 new mystery tests initiated",
          "2 live Adversoft/Vehisoft demos conducted",
        ],
      },
      {
        date: "2026-10-29",
        dayTitle: "Thursday 29 Oct — Onboarding & Delivery",
        morningFocus: "8:00–10:00: 30 Adversoft calls. 10:00–13:00: 15–20 laundry & shop cold calls; start 5 new leak checks.",
        afternoonFocus: "Setup and configure newly signed clients (guaranteed go-live within 3 days).",
        keyDeliverables: [
          "New clients onboarded with initial inventory & staff credentials",
          "5 new leak checks started",
        ],
      },
      {
        date: "2026-10-30",
        dayTitle: "Friday 30 Oct — Content & Weekly Review",
        morningFocus: "8:00–10:00: Pipeline follow-up across all 4 products. 10:00–13:00: Record 3 short video case studies.",
        afternoonFocus: "Client onboarding implementations. 17:00: Friday Weekly Review.",
        keyDeliverables: [
          "3 video clips published",
          "Friday 17:00 review completed",
        ],
      },
      {
        date: "2026-10-31",
        dayTitle: "Saturday 31 Oct (Half Day) — Mystery Analysis",
        morningFocus: "Analyze results from new car yard mystery tests; build reports.",
        afternoonFocus: "Prepare week 3 call lists.",
        keyDeliverables: ["Mystery buyer scorecards compiled", "Next week pipeline loaded"],
      },
    ],
  },
  {
    weekNumber: 3,
    dateRange: "2–7 November 2026",
    theme: "Closing Week & Strategic Partnerships",
    targetsSummary: "1 Adversoft · 2 Vehisoft · 5 Versandry · 3 LipaTim signed (cumulative)",
    days: [
      {
        date: "2026-11-02",
        dayTitle: "Monday 2 Nov — Adversoft Map Follow-ups",
        morningFocus: "Follow up every Adversoft map: 'Did the agencies like it? Ready to make it live?' Book offer meetings.",
        afternoonFocus: "Close Adversoft founding client contracts.",
        keyDeliverables: ["1 Adversoft contract issued", "Demos completed"],
      },
      {
        date: "2026-11-03",
        dayTitle: "Tuesday 3 Nov — Referral Engine Launch",
        morningFocus: "Close leak-check shops over phone/video. Ask every new client for 2 referrals (laundry or shop owners they know).",
        afternoonFocus: "Call referral leads with warm introduction.",
        keyDeliverables: ["First referral introductions received", "2 new contracts signed"],
      },
      {
        date: "2026-11-04",
        dayTitle: "Wednesday 4 Nov — Car Yard ROI Closes",
        morningFocus: "Offer meetings with car dealers: pitch 'one extra car sale pays for the whole year of Vehisoft'.",
        afternoonFocus: "Execute dealer onboarding and job card setups.",
        keyDeliverables: ["2 Vehisoft dealerships closed", "Setup fees collected"],
      },
      {
        date: "2026-11-05",
        dayTitle: "Thursday 5 Nov — Channel Partner Outreach",
        morningFocus: "Partner outreach: contact POS hardware distributors for LipaTim and laundry equipment/detergent suppliers for Versandry.",
        afternoonFocus: "Joint bundle agreements proposed.",
        keyDeliverables: ["2 hardware/supplier partner meetings booked"],
      },
      {
        date: "2026-11-06",
        dayTitle: "Friday 6 Nov — Proof & Review",
        morningFocus: "Turn first client result into social proof post (with permission). 17:00 Weekly review.",
        afternoonFocus: "Client support & review.",
        keyDeliverables: ["Client case study drafted", "Friday review reconciled"],
      },
      {
        date: "2026-11-07",
        dayTitle: "Saturday 7 Nov — Contracts & Admin",
        morningFocus: "Contract review, eTIMS tax invoices, and pipeline hygiene.",
        afternoonFocus: "Week 4 preparation.",
        keyDeliverables: ["All signed contracts archived", "Invoices matched to M-Pesa"],
      },
    ],
  },
  {
    weekNumber: 4,
    dateRange: "9–14 November 2026",
    theme: "Deliver Perfectly, Social Proof & Testimonials",
    targetsSummary: "3 Adversoft · 4 Vehisoft · 10 Versandry · 8 LipaTim signed · 3+ video testimonials · 10+ referral intros",
    days: [
      {
        date: "2026-11-09",
        dayTitle: "Monday 9 Nov — Client Health Check",
        morningFocus: "Check every live client: is the system running smoothly? Resolve support items before any new outreach.",
        afternoonFocus: "Outreach calls to warm pipeline.",
        keyDeliverables: ["100% active client health verified", "Zero open high-severity tickets"],
      },
      {
        date: "2026-11-10",
        dayTitle: "Tuesday 10 Nov — 10-Minute Executive Check-ins",
        morningFocus: "Conduct 10-minute check-in call with each live Versandry & LipaTim client.",
        afternoonFocus: "Record feedback and usage observations.",
        keyDeliverables: ["Client satisfaction validated", "Upsell opportunities noted"],
      },
      {
        date: "2026-11-11",
        dayTitle: "Wednesday 11 Nov — Weekly Lead Reports to Dealers",
        morningFocus: "Deliver first weekly lead report to Vehisoft car yards showing fast replies and closed deals.",
        afternoonFocus: "Demos with referred dealers.",
        keyDeliverables: ["Dealer weekly performance reports delivered"],
      },
      {
        date: "2026-11-12",
        dayTitle: "Thursday 12 Nov — Video Testimonial Collection",
        morningFocus: "Ask happiest clients for a short 30-second mobile video testimonial or quote for sales sheets.",
        afternoonFocus: "Collect and format testimonials.",
        keyDeliverables: ["3 video testimonials or written quotes collected"],
      },
      {
        date: "2026-11-13",
        dayTitle: "Friday 13 Nov — Update Collateral & Final Review",
        morningFocus: "Update sales sheets with real client quotes and quantified loss savings. 17:00 Weekly review.",
        afternoonFocus: "Reconcile launch month metrics.",
        keyDeliverables: ["Sales collateral updated with social proof", "Month 1 review completed"],
      },
      {
        date: "2026-11-14",
        dayTitle: "Saturday 14 Nov — Month 2 Expansion Planning",
        morningFocus: "Plan Month 2 scale-up. Contact 2 more partner types (car-finance providers, billboard large-format printers).",
        afternoonFocus: "Finalize launch push documentation.",
        keyDeliverables: ["Month 2 growth roadmap finalized"],
      },
    ],
  },
];

// Helper: Calculate the current 5:00 AM cycle identifier (YYYY-MM-DD)
export function get5AMCycleKey(date: Date = new Date()): string {
  const d = new Date(date);
  // If before 5 AM, belongs to previous calendar day cycle
  if (d.getHours() < 5) {
    d.setDate(d.getDate() - 1);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Helper: Get standard tasks for a specific date based on weekly rhythm
export function getRhythmTasksForDate(date: Date = new Date()): DailyTask[] {
  const dayIndex = date.getDay(); // 0-6
  const rhythm = WEEKLY_RHYTHM_TEMPLATES[dayIndex] || WEEKLY_RHYTHM_TEMPLATES[1];
  
  return rhythm.tasks.map((t, idx) => ({
    id: `rhythm-${dayIndex}-${idx}-${Date.now()}`,
    title: t.title,
    category: t.category,
    product: t.product,
    due: `Today ${t.due}`,
    priority: t.priority,
    completed: false,
    timeSlot: t.timeSlot,
  }));
}
