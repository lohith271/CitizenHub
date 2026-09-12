require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Campaign = require('./models/Campaign');
const Task = require('./models/Task');
const Donation = require('./models/Donation');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/citizenhub';
    await mongoose.connect(mongoUri);
    console.log('[Seed]: Connected to MongoDB...');

    // Clear existing data
    await User.deleteMany({});
    await Campaign.deleteMany({});
    await Task.deleteMany({});
    await Donation.deleteMany({});
    console.log('[Seed]: Cleared existing database records.');

    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('password123', salt);

    // 1. Create Genesis Super Admin
    const admin = await User.create({
      name: 'Pooja Sharma (Super Admin)',
      email: 'admin@citizenhub.org',
      password: defaultPassword,
      role: 'admin',
      status: 'active',
      city: 'Bengaluru',
      state: 'Karnataka',
      skills: ['Campaign Strategy', 'Legal/RTI'],
      badges: ['Genesis Founder'],
    });

    // 2. Create Verified Active Campaigner
    const campaigner1 = await User.create({
      name: 'Arjun Verma (Campaign Lead)',
      email: 'arjun@jhatkaa.org',
      password: defaultPassword,
      role: 'campaigner',
      status: 'active',
      organization: 'Jhatkaa.org Core Team',
      organizationBio: 'Mobilizing citizens for environmental and civic justice across India.',
      city: 'Delhi',
      state: 'Delhi',
      skills: ['Field Organizing', 'Press & Media'],
      badges: ['Lead Organizer'],
    });

    // 3. Create a Pending Campaigner Application (For live judge demo!)
    await User.create({
      name: 'Neha Deshmukh (Applicant)',
      email: 'neha@cleanrivers.org',
      password: defaultPassword,
      role: 'campaigner',
      status: 'pending_approval',
      organization: 'Clean Rivers Collective Pune',
      organizationBio: 'Youth-led initiative mapping industrial sewage discharge in the Mula-Mutha river basin.',
      city: 'Pune',
      state: 'Maharashtra',
      skills: ['Water Quality Testing', 'Community Advocacy'],
    });

    // 4. Create Realistic Active Volunteers
    const volunteersData = [
      {
        name: 'Rohan Mehta',
        email: 'rohan.designer@gmail.com',
        city: 'Mumbai',
        state: 'Maharashtra',
        skills: ['Graphic Design', 'Social Media'],
        causes: ['Air Pollution', 'Forest & Wildlife'],
        badges: ['Visual Storyteller', 'Action Champion'],
        reliabilityScore: 100,
        status: 'active',
      },
      {
        name: 'Ananya Iyer',
        email: 'ananya.legal@gmail.com',
        city: 'Bengaluru',
        state: 'Karnataka',
        skills: ['Legal/RTI', 'Policy Research'],
        causes: ['Civic Rights & Justice', 'Women Safety & Equality'],
        badges: ['RTI Expert', 'Action Champion'],
        reliabilityScore: 98,
        status: 'active',
      },
      {
        name: 'Kavita Nair',
        email: 'kavita.video@gmail.com',
        city: 'Chennai',
        state: 'Tamil Nadu',
        skills: ['Video Editing', 'Content Writing'],
        causes: ['Climate Action', 'Water & Sanitation'],
        badges: ['Community Member'],
        reliabilityScore: 95,
        status: 'active',
      },
      {
        name: 'Vikram Singh',
        email: 'vikram.field@gmail.com',
        city: 'Delhi',
        state: 'Delhi',
        skills: ['Field Mobilization', 'Translation'],
        causes: ['Air Pollution', 'Civic Rights & Justice'],
        badges: ['Ground Mobilizer'],
        reliabilityScore: 90,
        status: 'active',
      },
      {
        name: 'Priyanka Das',
        email: 'priyanka.tech@gmail.com',
        city: 'Kolkata',
        state: 'West Bengal',
        skills: ['Tech/Data', 'Graphic Design'],
        causes: ['Forest & Wildlife', 'Climate Action'],
        badges: ['Data Warrior'],
        reliabilityScore: 96,
        status: 'active',
      },
    ];

    const createdVolunteers = [];
    for (const vol of volunteersData) {
      const u = await User.create({
        ...vol,
        password: defaultPassword,
        role: 'citizen',
      });
      createdVolunteers.push(u);
    }

    console.log(`[Seed]: Created ${createdVolunteers.length + 3} users (1 Admin, 1 Active Campaigner, 1 Pending Campaigner, ${createdVolunteers.length} Citizens).`);

    // 5. Create Campaigns with Modular Blocks
    const c1 = await Campaign.create({
      title: 'Clean Air Delhi: Hold Heavy Polluters Accountable',
      summary: 'Delhi air reaches hazardous AQI 450+. Mobilizing citizens to mandate industrial air scrubbers.',
      description:
        'Every winter, millions breathe toxic air causing acute respiratory illness. We are taking legal, social, and field action to force regulatory bodies and high-emission industries to install certified scrubbers and stop stubble burning through farmer subsidy drives.',
      category: 'Air Pollution',
      location: 'Delhi',
      bannerImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
      targetSignatures: 25000,
      signaturesCount: 18450,
      targetAmount: 200000,
      raisedAmount: 142500,
      currency: 'INR',
      organizer: campaigner1._id,
      modularBlocks: {
        hasPetition: true,
        hasTasks: true,
        hasDonation: true,
        hasEvent: false,
      },
      signers: [
        { user: createdVolunteers[0]._id, name: createdVolunteers[0].name, city: 'Mumbai' },
        { user: createdVolunteers[1]._id, name: createdVolunteers[1].name, city: 'Bengaluru' },
      ],
    });

    const c2 = await Campaign.create({
      title: 'Save Hasdeo Arand: Stop Illegal Deforestation',
      summary: 'Protect 1,70,000 hectares of pristine tribal forest and elephant corridor in Chhattisgarh.',
      description:
        'Hasdeo Arand is known as the lungs of Central India. Unchecked coal block allocations threaten indigenous communities and dense biodiversity. We need RTI filings, campaign posters, and localized translation drives.',
      category: 'Forest & Wildlife',
      location: 'Chhattisgarh',
      bannerImage: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
      targetSignatures: 50000,
      signaturesCount: 38900,
      targetAmount: 300000,
      raisedAmount: 215000,
      currency: 'INR',
      organizer: campaigner1._id,
      modularBlocks: {
        hasPetition: true,
        hasTasks: true,
        hasDonation: true,
        hasEvent: true,
      },
      eventDetails: {
        eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        venue: 'Solidarity March, Jantar Mantar & Online Livestream',
        rsvpCount: 420,
      },
    });

    const c3 = await Campaign.create({
      title: 'Safe Walk Bengaluru: Light Up Dark Spots',
      summary: 'Audit non-functional streetlights and broken footpaths to ensure women safety at night.',
      description:
        'Over 40% of secondary roads in outer Bengaluru lack adequate public lighting. We are mobilizing citizens to map unlit streets using smartphone audits and submit a unified civic petition to BBMP.',
      category: 'Women Safety & Equality',
      location: 'Bengaluru',
      bannerImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
      targetSignatures: 10000,
      signaturesCount: 6200,
      targetAmount: 50000,
      raisedAmount: 32000,
      currency: 'INR',
      organizer: admin._id,
      modularBlocks: {
        hasPetition: true,
        hasTasks: true,
        hasDonation: true,
        hasEvent: true,
      },
    });

    console.log('[Seed]: Created 3 active campaigns.');

    // 6. Create Tasks in different workflow states
    await Task.create([
      {
        campaignId: c1._id,
        title: 'Design 3 High-Impact Instagram Carousels on Delhi AQI',
        description: 'Create informative graphic slides explaining PM2.5 levels, vulnerable groups, and demand points for our petition.',
        requiredSkills: ['Graphic Design', 'Social Media'],
        city: 'Remote',
        urgency: 'high',
        deadlineHours: 48,
        status: 'available',
      },
      {
        campaignId: c1._id,
        title: 'Draft RTI Application on CPCB Air Sensor Calibration',
        description: 'Prepare an RTI template querying the maintenance log and downtime of government air quality monitors in NCR.',
        requiredSkills: ['Legal/RTI', 'Policy Research'],
        city: 'Delhi',
        urgency: 'high',
        deadlineHours: 72,
        status: 'in_progress',
        assignedTo: createdVolunteers[1]._id,
        assignedAt: new Date(),
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      },
      {
        campaignId: c2._id,
        title: 'Translate Hasdeo Factsheet from English to Hindi & Chhattisgarhi',
        description: 'Translate our 2-page brief on forest clearance laws so local gram sabhas can distribute it freely.',
        requiredSkills: ['Translation', 'Content Writing'],
        city: 'Remote',
        urgency: 'medium',
        deadlineHours: 48,
        status: 'under_review',
        assignedTo: createdVolunteers[3]._id,
        assignedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        proofSubmission: {
          submissionUrl: 'https://docs.google.com/document/d/mock-hasdeo-hindi-translation',
          notes: 'Completed full Hindi translation with verified legal terms.',
          submittedAt: new Date(),
        },
      },
      {
        campaignId: c2._id,
        title: 'Produce 60-Second Explainer Reel on Elephant Corridor Mining',
        description: 'Edit drone footage and infographics into an engaging 9:16 vertical video for Instagram and WhatsApp status.',
        requiredSkills: ['Video Editing'],
        city: 'Remote',
        urgency: 'urgent',
        deadlineHours: 36,
        status: 'completed',
        assignedTo: createdVolunteers[2]._id,
        assignedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        reviewedBy: campaigner1._id,
        reviewedAt: new Date(),
        reviewFeedback: 'Superb quality video! Published on our official handles.',
        proofSubmission: {
          submissionUrl: 'https://drive.google.com/file/d/mock-reel-video.mp4',
          notes: 'Final HD render with subtitles in English and Hindi.',
          submittedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        },
      },
      {
        campaignId: c3._id,
        title: 'Field Audit: Map 15 Unlit Dark Stretches in Koramangala & HSR',
        description: 'Take geolocated photos of broken streetlights after 8:00 PM and log them into our community spreadsheet.',
        requiredSkills: ['Field Mobilization', 'Tech/Data'],
        city: 'Bengaluru',
        urgency: 'medium',
        deadlineHours: 72,
        status: 'available',
      },
    ]);

    // 7. Create Sample INR Donations
    await Donation.create([
      {
        campaignId: c1._id,
        donorName: 'Rahul Sen',
        donorEmail: 'rahul.sen@example.com',
        amount: 1500,
        currency: 'INR',
        paymentId: 'pay_mock_delhi_101',
        status: 'successful',
      },
      {
        campaignId: c1._id,
        donorName: 'Meera Krishnan',
        donorEmail: 'meera.k@example.com',
        amount: 2500,
        currency: 'INR',
        paymentId: 'pay_mock_delhi_102',
        status: 'successful',
      },
      {
        campaignId: c2._id,
        donorName: 'Anonymous Citizen',
        donorEmail: 'anon@citizenhub.org',
        amount: 5000,
        currency: 'INR',
        paymentId: 'pay_mock_hasdeo_201',
        status: 'successful',
      },
    ]);

    console.log('[Seed Success]: Database ready for high-impact hackathon demo!');
    console.log('\n================ DEMO CREDENTIALS ================');
    console.log('1. SUPER ADMIN: admin@citizenhub.org / password123');
    console.log('2. ACTIVE CAMPAIGNER: arjun@jhatkaa.org / password123');
    console.log('3. PENDING CAMPAIGNER: neha@cleanrivers.org / password123 (Waiting for Admin approval)');
    console.log('4. CITIZEN/VOLUNTEER: rohan.designer@gmail.com / password123');
    console.log('===================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
