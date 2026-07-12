export const workspace = {
  name: "Namahmi Labs Pvt. Ltd.",
  role: "Owner"
};

export const metrics = {
  leadsGenerated: 0,
  contacted: 0,
  notContacted: 0,
  followUps: 0,
  disconnected: 0,
  quoteSent: 0,
  exports: 0
};

export const agents = ["Amit", "Priya", "Kabir", "Rhea"];

export const leadStatuses = ["Not Contacted", "Contacted", "Disconnected", "Call Back Request", "Quote Sent", "Converted", "Not Interested"];

const countryCodes = [
  "AF", "AX", "AL", "DZ", "AS", "AD", "AO", "AI", "AQ", "AG", "AR", "AM", "AW", "AU", "AT", "AZ", "BS", "BH", "BD", "BB",
  "BY", "BE", "BZ", "BJ", "BM", "BT", "BO", "BQ", "BA", "BW", "BV", "BR", "IO", "BN", "BG", "BF", "BI", "CV", "KH", "CM",
  "CA", "KY", "CF", "TD", "CL", "CN", "CX", "CC", "CO", "KM", "CG", "CD", "CK", "CR", "CI", "HR", "CU", "CW", "CY", "CZ",
  "DK", "DJ", "DM", "DO", "EC", "EG", "SV", "GQ", "ER", "EE", "SZ", "ET", "FK", "FO", "FJ", "FI", "FR", "GF", "PF", "TF",
  "GA", "GM", "GE", "DE", "GH", "GI", "GR", "GL", "GD", "GP", "GU", "GT", "GG", "GN", "GW", "GY", "HT", "HM", "VA", "HN",
  "HK", "HU", "IS", "IN", "ID", "IR", "IQ", "IE", "IM", "IL", "IT", "JM", "JP", "JE", "JO", "KZ", "KE", "KI", "KP", "KR",
  "KW", "KG", "LA", "LV", "LB", "LS", "LR", "LY", "LI", "LT", "LU", "MO", "MG", "MW", "MY", "MV", "ML", "MT", "MH", "MQ",
  "MR", "MU", "YT", "MX", "FM", "MD", "MC", "MN", "ME", "MS", "MA", "MZ", "MM", "NA", "NR", "NP", "NL", "NC", "NZ", "NI",
  "NE", "NG", "NU", "NF", "MK", "MP", "NO", "OM", "PK", "PW", "PS", "PA", "PG", "PY", "PE", "PH", "PN", "PL", "PT", "PR",
  "QA", "RE", "RO", "RU", "RW", "BL", "SH", "KN", "LC", "MF", "PM", "VC", "WS", "SM", "ST", "SA", "SN", "RS", "SC", "SL",
  "SG", "SX", "SK", "SI", "SB", "SO", "ZA", "GS", "SS", "ES", "LK", "SD", "SR", "SJ", "SE", "CH", "SY", "TW", "TJ", "TZ",
  "TH", "TL", "TG", "TK", "TO", "TT", "TN", "TR", "TM", "TC", "TV", "UG", "UA", "AE", "GB", "US", "UM", "UY", "UZ", "VU",
  "VE", "VN", "VG", "VI", "WF", "EH", "YE", "ZM", "ZW"
];

const countryNames = new Intl.DisplayNames(["en"], { type: "region" });

export const countries = countryCodes
  .map((code) => countryNames.of(code) ?? code)
  .sort((a, b) => a.localeCompare(b));

export const geography: Record<string, Record<string, string[]>> = {
  India: {
    "Andaman and Nicobar Islands": ["Nicobar", "North and Middle Andaman", "South Andaman"],
    "Andhra Pradesh": ["Anantapur", "Chittoor", "Guntur", "Krishna", "Kurnool", "Nellore", "Visakhapatnam"],
    "Arunachal Pradesh": ["Itanagar Capital Complex", "Tawang", "West Kameng"],
    Assam: ["Dibrugarh", "Guwahati", "Jorhat", "Kamrup", "Silchar"],
    Bihar: ["Gaya", "Muzaffarpur", "Patna"],
    Chandigarh: ["Chandigarh"],
    Chhattisgarh: ["Bilaspur", "Durg", "Raipur"],
    Delhi: ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "South Delhi", "West Delhi"],
    Goa: ["North Goa", "South Goa"],
    Gujarat: ["Ahmedabad", "Rajkot", "Surat", "Vadodara"],
    Haryana: ["Faridabad", "Gurugram", "Hisar", "Panipat"],
    "Himachal Pradesh": ["Dharamshala", "Kangra", "Shimla", "Solan"],
    Jharkhand: ["Dhanbad", "Jamshedpur", "Ranchi"],
    Karnataka: ["Bengaluru Urban", "Dharwad", "Mangaluru", "Mysuru"],
    Kerala: ["Ernakulam", "Kochi", "Kozhikode", "Thiruvananthapuram"],
    "Madhya Pradesh": ["Bhopal", "Gwalior", "Indore", "Jabalpur"],
    Maharashtra: ["Mumbai", "Mumbai Suburban", "Nagpur", "Nashik", "Pune", "Thane"],
    Manipur: ["Imphal East", "Imphal West"],
    Meghalaya: ["East Khasi Hills", "Shillong"],
    Mizoram: ["Aizawl"],
    Nagaland: ["Dimapur", "Kohima"],
    Odisha: ["Bhubaneswar", "Cuttack", "Puri"],
    Puducherry: ["Karaikal", "Puducherry"],
    Punjab: ["Amritsar", "Jalandhar", "Ludhiana"],
    Rajasthan: ["Jaipur", "Jodhpur", "Kota", "Udaipur"],
    Sikkim: ["Gangtok"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"],
    Telangana: ["Hyderabad", "Medchal Malkajgiri", "Rangareddy", "Warangal"],
    Tripura: ["Agartala", "West Tripura"],
    "Uttar Pradesh": ["Agra", "Ghaziabad", "Kanpur Nagar", "Lucknow", "Noida", "Varanasi"],
    Uttarakhand: ["Dehradun", "Haridwar", "Nainital"],
    "West Bengal": ["Howrah", "Kolkata", "North 24 Parganas", "South 24 Parganas"]
  },
  "United States": {
    California: ["Los Angeles County", "Orange County", "San Diego County", "Santa Clara County"],
    Florida: ["Miami-Dade County", "Orange County", "Palm Beach County"],
    "New York": ["Kings County", "New York County", "Queens County"],
    Texas: ["Dallas County", "Harris County", "Travis County"]
  },
  "United Kingdom": {
    England: ["Greater London", "Greater Manchester", "West Midlands"],
    Scotland: ["Edinburgh", "Glasgow"],
    Wales: ["Cardiff", "Swansea"]
  },
  "United Arab Emirates": {
    Dubai: ["Dubai"],
    "Abu Dhabi": ["Abu Dhabi", "Al Ain"],
    Sharjah: ["Sharjah"]
  }
};

export const businessUnits = [
  "Clinics", "Hospitals", "Schools", "Colleges", "Restaurants", "Hotels", "Retail", "Manufacturing",
  "IT Companies", "Real Estate", "Law Firms", "CA Firms", "Construction", "Startups", "NGOs", "Pharmacies",
  "Dental Clinics", "Diagnostic Labs", "Gyms", "Salons", "Automobile Dealers", "Financial Advisors", "Travel Agencies",
  "Logistics", "Exporters", "Importers", "Architects", "Interior Designers", "Event Management", "Others"
];

export const businessResults = [
  {
    name: "Aarav Health Clinic",
    category: "Clinics",
    address: "Andheri East, Mumbai",
    district: "Mumbai",
    state: "Maharashtra",
    country: "India",
    contactPerson: "Front Desk",
    phone: "+91 98765 43210",
    email: "hello@aaravhealth.example",
    website: "https://aaravhealth.example",
    maps: "https://maps.google.com",
    rating: 4.7,
    reviewCount: 214,
    status: "Open",
    source: "Public web + map listing"
  },
  {
    name: "Northstar Learning School",
    category: "Schools",
    address: "Powai, Mumbai",
    district: "Mumbai",
    state: "Maharashtra",
    country: "India",
    contactPerson: "Admissions Office",
    phone: "+91 99887 76655",
    email: "admissions@northstar.example",
    website: "https://northstar.example",
    maps: "https://maps.google.com",
    rating: 4.5,
    reviewCount: 89,
    status: "Open",
    source: "Public website"
  }
];

export const activity = [
  { id: "1", action: "Business search completed", actor: "Namahmi operator", time: "12 minutes ago" },
  { id: "2", action: "CSV export generated", actor: "Namahmi operator", time: "1 hour ago" },
  { id: "3", action: "Agent follow-up report saved", actor: "Namahmi operator", time: "Yesterday" }
];

export const manualUsers = [
  { name: "Priya Shah", email: "priya@namahmi.example", mobile: "+91 90000 11111", username: "priya.admin", role: "Admin" },
  { name: "Kabir Mehta", email: "kabir@namahmi.example", mobile: "+91 90000 22222", username: "kabir.ops", role: "Operator" }
];

export const exports = [
  { id: "ex_1", name: "Mumbai clinics", type: "Business Search", rows: 248, destination: "CSV", status: "Completed" },
  { id: "ex_2", name: "Dubai clinics", type: "Business Search", rows: 72, destination: "Google Sheets", status: "Completed" }
];
