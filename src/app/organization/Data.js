const sampleUser = {
    name: "Evoke",
    university: "Chandigarh Group Of Colleges",
    bio: "Aspiring B.Tech CSE Graduate | Proficient Java Programmer | MERN Stack Developer | Quick Learner with Strong Communication Skills, Ready to Build and Innovate",
    location: "India",
    email: "shekhar.kashyap@example.com",
    phone: "+91 9876543210",
    profileImage: "/About.jpeg",
    coverImage: "/Profile.webp",
    upcomingEvents: [
        {
            title: "Codeathon 2023",
            date: "March 25, 2025",
            organizer: "Tech University",
            location: "Virtual Event"
        },
        {
            title: "Hackathon Summit",
            date: "April 15, 2025",
            organizer: "InnovateTech",
            location: "Bangalore"
        }
    ],
    events: [
        {
            title: "National Hackathon 2023",
            position: [
                "Nishant", "Shekhar", "Shivam", "Tushar", "Atish", "Anshu", "Pinki", "Sunita",
                "Rohit", "Kavya", "Sandeep", "Tanya", "Manish", "Swati", "Deepak", "Neha",
                "Amit", "Priya", "Ananya", "Vikas", "Sameer", "Raj", "Ankit", "Meera",
                "Vivek", "Ritu", "Pooja", "Arjun", "Simran", "Yash", "Aditya", "Sonia",
                "Varun", "Isha", "Rahul", "Sneha", "Gaurav", "Payal", "Vinay", "Rakesh"
            ],
            date: "November 2023",
            participants: 40,
            team: [
            {
                "shivam": "Backend Dev"
            },
            {
                "Tushar": "Frontend Dev"
            },
            {
                "shivam": "Backend Dev"
            },
            {
                "Tushar": "Frontend Dev"
            }
        ]
        },
        {
            title: "AI & ML Summit 2024",
            position: [
                "Amit", "Priya", "Ananya", "Vikas", "Sameer", "Raj", "Ankit", "Meera",
                "Rohit", "Kavya", "Sandeep", "Tanya", "Manish", "Swati", "Deepak", "Neha",
                "Nishant", "Shekhar", "Shivam", "Tushar", "Atish", "Anshu", "Pinki", "Sunita",
                "Varun", "Isha", "Rahul", "Sneha", "Gaurav", "Payal", "Vinay", "Rakesh",
                "Vivek", "Ritu", "Pooja", "Arjun", "Simran", "Yash", "Aditya", "Sonia"
            ],
            date: "March 2024",
            participants: 40,
            team: [{
                "shivam": "Backend Dev"
            },
            {
                "Tushar": "Frontend Dev"
            }]
        },
        {
            title: "Cyber Security Workshop",
            position: [
                "Rahul", "Sneha", "Gaurav", "Payal", "Vinay", "Rakesh", "Varun", "Isha",
                "Vivek", "Ritu", "Pooja", "Arjun", "Simran", "Yash", "Aditya", "Sonia",
                "Nishant", "Shekhar", "Shivam", "Tushar", "Atish", "Anshu", "Pinki", "Sunita",
                "Rohit", "Kavya", "Sandeep", "Tanya", "Manish", "Swati", "Deepak", "Neha",
                "Amit", "Priya", "Ananya", "Vikas", "Sameer", "Raj", "Ankit", "Meera"
            ],
            date: "June 2024",
            participants: 40,
            team: [{
                "shivam": "Backend Dev"
            },
            {
                "Tushar": "Frontend Dev"
            }]
        },
        {
            title: "Blockchain & Web3 Conference",
            position: [
                "Nishant", "Shekhar", "Shivam", "Tushar", "Atish", "Anshu", "Pinki", "Sunita",
                "Amit", "Priya", "Ananya", "Vikas", "Sameer", "Raj", "Ankit", "Meera",
                "Rahul", "Sneha", "Gaurav", "Payal", "Vinay", "Rakesh", "Varun", "Isha",
                "Vivek", "Ritu", "Pooja", "Arjun", "Simran", "Yash", "Aditya", "Sonia",
                "Rohit", "Kavya", "Sandeep", "Tanya", "Manish", "Swati", "Deepak", "Neha"
            ],
            date: "September 2024",
            participants: 40,
            team: [{
                "shivam": "Backend Dev"
            },
            {
                "Tushar": "Frontend Dev"
            }]
        }
    ]
    ,
    education: [
        {
            institution: "Chandigarh Group Of Colleges",
            degree: "B.Tech in Computer Science",
            duration: "2020 - 2024",
            gpa: "8.9/10"
        }
    ],
    experience: [
        {
            company: "Tech Solutions Inc.",
            role: "Software Developer Intern",
            duration: "May 2023 - August 2023",
            description: "Developed and maintained web applications using MERN stack."
        }
    ],
    activities: {
        thisMonth: 45,
        lastMonth: 38,
        thisYear: 280,
        // More detailed contribution data for heatmap (7x7 grid for last 49 days)
        contributionData: [
            // Each array represents a week, each number represents activity count for a day
            [1, 3, 4, 2, 1, 0, 0],  // Week 1
            [2, 3, 6, 1, 2, 0, 1],  // Week 2
            [0, 1, 2, 3, 5, 2, 0],  // Week 3
            [3, 4, 1, 2, 0, 3, 2],  // Week 4
            [5, 2, 3, 4, 2, 1, 0],  // Week 5
            [0, 3, 7, 4, 2, 0, 1],  // Week 6
            [2, 3, 1, 2, 4, 3, 1],  // Week 7
        ],
        streakDays: 5,
        longestStreak: 12,
        // Monthly data for the bar chart
        contributions: [7, 5, 10, 8, 12, 9, 15, 8, 6, 11, 9, 13]
    },
    teams: [
        {
            name: "Technical",
            head: "Shekhar Kashyap",
            members: [{ "Nishant": "Manger" }, { "Atish": "Backend dev" }, { "Anshu": "frontend dev" }, { "Shivam": "Looker" }]
        },
        {
            name: "Design",
            head: "Rahul Verma",
            members: [{ "Nishant": "Manger" }, { "Atish": "Backend dev" }, { "Anshu": "frontend dev" }, { "Shivam": "Looker" }]
        },
        {
            name: "Marketing",
            head: "Anjali Sharma",
            members: [{ "Nishant": "Manger" }, { "Atish": "Backend dev" }, { "Anshu": "frontend dev" }, { "Shivam": "Looker" }]
        },
        {
            name: "Operations",
            head: "Amit Tiwari",
            members: [{ "Nishant": "Manger" }, { "Atish": "Backend dev" }, { "Anshu": "frontend dev" }, { "Shivam": "Looker" }]
        }
    ],
    socialLinks: {
        github: "https://github.com/shekhar-kashyap",
        linkedin: "https://linkedin.com/in/shekhar-kashyap",
        twitter: "https://twitter.com/shekhar_kashyap"
    }
}


export default sampleUser;