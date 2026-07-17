/**
 * Mock data for the admin UI so every screen is fully browsable before the Spring Boot +
 * MySQL backend exists. Each export maps 1:1 to a future REST resource:
 *   adminUsers   → GET /api/users
 *   rfqRequests  → GET /api/rfq
 *   contactMsgs  → GET /api/contact
 *   applications → GET /api/careers
 * When the API is live, swap these imports for fetch() calls — the shapes are the columns
 * the tables already render, so the components don't change.
 */
import { ROLES } from '../auth/roles';

export const adminUsers = [
  { id: 1, name: 'Raveesh Moudgil', email: 'raveesh@keaa-international.net', role: ROLES.SUPER_ADMIN, status: 'active', lastActive: '2026-07-17' },
  { id: 2, name: 'Bhupesh Gautam', email: 'bhupesh@keaa-international.net', role: ROLES.SALES, status: 'active', lastActive: '2026-07-16' },
  { id: 3, name: 'Sumit Moudgil', email: 'sumit@keaa-international.net', role: ROLES.SALES, status: 'active', lastActive: '2026-07-15' },
  { id: 4, name: 'Priya Sharma', email: 'priya.hr@keaa-international.net', role: ROLES.HR, status: 'active', lastActive: '2026-07-14' },
  { id: 5, name: 'Arjun Mehta', email: 'arjun.ops@keaa-international.net', role: ROLES.EMPLOYEE, status: 'inactive', lastActive: '2026-06-28' },
];

export const rfqRequests = [
  { id: 'RFQ-1042', name: 'Ahmed Al Mansoori', company: 'Al Mansoori Group', country: 'UAE', category: 'Scaffolding & Formworks', date: '2026-07-16', status: 'new' },
  { id: 'RFQ-1041', name: 'Rajesh Kumar', company: 'BuildTech Constructors', country: 'India', category: 'Safety Products', date: '2026-07-15', status: 'in-review' },
  { id: 'RFQ-1040', name: 'David Williams', company: 'ProBuild Industries', country: 'UK', category: 'Scaffolding & Formworks', date: '2026-07-14', status: 'quoted' },
  { id: 'RFQ-1039', name: 'Carlos Mendez', company: 'Mendez Construcciones', country: 'Mexico', category: 'Livestock Housing Solutions', date: '2026-07-12', status: 'closed' },
  { id: 'RFQ-1038', name: 'Fatima Noor', company: 'Gulf Structures', country: 'Qatar', category: 'Wood Connectors / Garden Hardware', date: '2026-07-11', status: 'new' },
];

export const contactMsgs = [
  { id: 1, name: 'Liam O’Brien', email: 'liam@obrienbuild.ie', subject: 'Bulk order inquiry — Cuplock', date: '2026-07-16', status: 'unread' },
  { id: 2, name: 'Wei Chen', email: 'wei.chen@sinobuild.cn', subject: 'Distributor partnership', date: '2026-07-15', status: 'unread' },
  { id: 3, name: 'Sara Kowalski', email: 'sara.k@polbud.pl', subject: 'Formwork technical specs', date: '2026-07-13', status: 'read' },
  { id: 4, name: 'Omar Haddad', email: 'omar@haddadco.jo', subject: 'Export documentation query', date: '2026-07-10', status: 'replied' },
];

export const applications = [
  { id: 1, name: 'Neha Verma', role: 'Production Engineer', experience: '4 yrs', location: 'Ludhiana', date: '2026-07-15', status: 'new' },
  { id: 2, name: 'Rohit Singh', role: 'Export Sales Executive', experience: '6 yrs', location: 'Remote', date: '2026-07-14', status: 'shortlisted' },
  { id: 3, name: 'Ananya Iyer', role: 'QA Inspector', experience: '3 yrs', location: 'Ludhiana', date: '2026-07-12', status: 'interview' },
  { id: 4, name: 'Karan Patel', role: 'CNC Operator', experience: '5 yrs', location: 'Ludhiana', date: '2026-07-09', status: 'rejected' },
];

/** Dashboard KPI tiles — later a single GET /api/dashboard/summary. */
export const dashboardStats = [
  { id: 'rfq', label: 'Open RFQ Requests', value: 12, delta: '+3 this week', icon: 'FileText', tone: 'primary' },
  { id: 'contacts', label: 'Unread Messages', value: 8, delta: '+2 today', icon: 'Mail', tone: 'gold' },
  { id: 'applications', label: 'New Applications', value: 5, delta: '+1 today', icon: 'Briefcase', tone: 'emerald' },
  { id: 'products', label: 'Catalogue Products', value: 355, delta: '3 categories', icon: 'Package', tone: 'navy' },
];

/** Recent-activity feed for the dashboard. */
export const recentActivity = [
  { id: 1, text: 'New RFQ RFQ-1042 from Al Mansoori Group (UAE)', time: '2h ago', type: 'rfq' },
  { id: 2, text: 'Contact message from Wei Chen — Distributor partnership', time: '5h ago', type: 'contact' },
  { id: 3, text: 'Job application: Neha Verma — Production Engineer', time: '1d ago', type: 'application' },
  { id: 4, text: 'RFQ RFQ-1040 marked as Quoted', time: '2d ago', type: 'rfq' },
];
