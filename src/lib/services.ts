export interface Service {
  id: string; name: string;
  category: 'core'|'website'|'bookings'|'ai'|'marketing'|'support';
  description: string; setupFee: number; monthlyFee: number; required?: boolean;
}

export const ALL_SERVICES: Service[] = [
  { id:'crm_dashboard',       name:'CRM Dashboard',             category:'core',      description:'Client management, appointments, revenue, invoices and client portal.',        setupFee:0,   monthlyFee:25,  required:true },
  { id:'onboarding_setup',    name:'Onboarding and Data Setup', category:'core',      description:'We import your client list, set up industry settings, and walk you through.', setupFee:49,  monthlyFee:0   },
  { id:'basic_website',       name:'Basic Website (5 pages)',   category:'website',   description:'Home, About, Services, Gallery, Contact. Mobile-ready. Domain + hosting.',    setupFee:249, monthlyFee:15  },
  { id:'custom_website',      name:'Custom Website',            category:'website',   description:'Fully custom design, booking integration, photo gallery, SEO-ready.',         setupFee:599, monthlyFee:25  },
  { id:'local_seo',           name:'Local SEO Setup',           category:'website',   description:'Google Business Profile, keyword setup, local citations.',                    setupFee:79,  monthlyFee:15  },
  { id:'booking_calendar',    name:'Online Booking Calendar',   category:'bookings',  description:'Clients book 24/7. Auto-syncs with your CRM.',                               setupFee:49,  monthlyFee:10  },
  { id:'appt_reminders',      name:'Appointment Reminders',     category:'bookings',  description:'Automated SMS + email reminders. Cuts no-shows by ~40%.',                     setupFee:29,  monthlyFee:10  },
  { id:'ai_phone_agent',      name:'AI Phone Agent',            category:'ai',        description:'Answers calls 24/7, books appointments, handles FAQs.',                       setupFee:99,  monthlyFee:35  },
  { id:'ai_chat_widget',      name:'AI Website Chat Widget',    category:'ai',        description:'Instant answers on your site, captures leads and books automatically.',       setupFee:49,  monthlyFee:15  },
  { id:'auto_followup',       name:'Auto Follow-up Sequences',  category:'ai',        description:'Auto texts + emails after visits to get reviews, rebook, or run promos.',     setupFee:49,  monthlyFee:15  },
  { id:'review_management',   name:'Review Management',         category:'marketing', description:'Auto-request Google reviews after every visit.',                              setupFee:29,  monthlyFee:12  },
  { id:'email_sms_marketing', name:'Email and SMS Marketing',   category:'marketing', description:'Monthly newsletters, promotions, and re-engagement blasts.',                  setupFee:29,  monthlyFee:15  },
  { id:'social_templates',    name:'Social Media Templates',    category:'marketing', description:'20 branded Canva templates for Instagram + Facebook.',                        setupFee:79,  monthlyFee:0   },
  { id:'priority_support',    name:'Priority Support',          category:'support',   description:'Same-day response, monthly check-in call, proactive monitoring.',             setupFee:0,   monthlyFee:20  },
];

export const CATEGORY_ICONS: Record<string, string> = {
  core:'🏠', website:'🌐', bookings:'📅', ai:'🤖', marketing:'📣', support:'🎧'
};
export const CATEGORY_LABELS: Record<string, string> = {
  core:'Core', website:'Website', bookings:'Bookings', ai:'AI', marketing:'Marketing', support:'Support'
};
