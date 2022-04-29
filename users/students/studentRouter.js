// Handles all admin/students routes
// used in ADMIN.JS

const express = require("express");
const studentRouter = express.Router();
const path = require("path");

// CONFIG
const admin = require("../../admin/config");

// MODELS for mongoose
const { User, Student, StudentCONFIG, tools } = require("../userModel");
const { Tuition } = require("../tuition/tuitionModel");
const chart = require("../../admin/adminProfileCharts");

// @Middleware
function ifCanRead(req, res, next) {
  // check Admin's Auth - if can READ
  const adminId = req.session.userId;
  if (!admin.checkAdminsAuth(adminId, "read")) {
    return res.render(
      path.join(global.__basedir + "/static/general-pages/NEA/NEA.ejs"),
      { auth: "read" }
    );
  } else {
    next();
  }
}
function ifCanWrite(req, res, next) {
  // check Admin's Auth - if can WRITE
  const adminId = req.session.userId;
  if (!admin.checkAdminsAuth(adminId, "write")) {
    return res.render(
      path.join(global.__basedir + "/static/general-pages/NEA/NEA.ejs"),
      { auth: "write" }
    );
  } else {
    next();
  }
}
function ifCanReadOrInstructor(req, res, next) {
  // check Admin's Auth - if INSTRUCTOR
  const adminId = req.session.userId;

  if (admin.checkAdminsAuth(adminId, "read")) { return next() }
  if (admin.checkAdminsAuth(adminId, "instructor")) { return next() }

  return res.render(
    path.join(global.__basedir + "/static/general-pages/NEA/NEA.ejs"),
    { auth: "read or instructor" }
  );
}


// @Students ROUTES
// tool to get students for INs
async function getStudentsForINs(date, location) {
  const filter = location === admin.LOCATION.All ? {} : { location }
  filter.status = "unblock"
  filter.graduate = "no"
  try {
    const students = await Student
    .find(filter)
    .select("key fullName TTT clocks location user")
    .populate({ path: "scoring", select: "scoringsInCab scoringsOutCab scoringsBacking scoringsCity" })
    .sort("location")    //  .sort({ location: 1, key: 1 })

    let inStudents = []
    const today = tools.getDatePrefix(date).toString()

    students.forEach((student) => {
      let todayClocks = student.clocks.filter((clock) => {
        return clock.key == today
      })
      if (todayClocks.length) {
        student.clocks = todayClocks
        inStudents.push(student)
      }
    })
    return inStudents
  } catch (e) {
    console.log(`Error on getting students fot INs list: ${e.message}`)
    return []
  }
}


// INs route is a root one
studentRouter.get("/", ifCanReadOrInstructor, async (req, res) => {
  const adminProfile = admin.findAdminById(req.session.userId)
  const inStudents = await getStudentsForINs(new Date(), adminProfile.location)
  res.render(path.join(__dirname + "/INs.ejs"), { inStudents, today: true })
})


// INs route for not today's date
studentRouter.post("/", ifCanReadOrInstructor, async (req, res) => {
  const { clockedAsOf } = req.body;
  if (!clockedAsOf) {
    // date to retrieve not passed, just redirecting to ordinary GET INs
    return res.status(400).redirect("/admin/student");
  }

  const date = `${clockedAsOf}T00:00:00-08:00`;
  const adminProfile = admin.findAdminById(req.session.userId);
  const inStudents = await getStudentsForINs(
    new Date(date),
    adminProfile.location
  );
  const today =
    tools.getDatePrefix(new Date(date)).toString() ===
    tools.getDatePrefix(new Date()).toString();

  res.render(path.join(__dirname + "/INs.ejs"), { inStudents, today, date });
});

// Student List populate constants
const studentPopulated = "key TTT created status location";
const studentListPopulate = [
  { path: "user", select: "payments",
    populate: [
      { path: "dataCollection", select: "firstName lastName middleName" },
      { path: "agreement", select: "program class transmission visiting tuitionCost regisrFee supplyFee otherFee payment thirdPartyList schoolSignRep" },
    ]
  },
  { path: "tuition", select: "isAllowed avLessonsRate" },
  { path: "scoring", select: "isAllowed scoringsInCab scoringsOutCab scoringsBacking scoringsCity" },
];

// @GET admin/student/list
studentRouter.get("/list", ifCanReadOrInstructor, async (req, res) => {
  // get admin
  const adminProfile = admin.findAdminById(req.session.userId);
  // filter to find Students due to LOCATION: All - can see All, else - only assigned to location + UNSET
  const defaulLocationFilter =
    adminProfile.location === admin.LOCATION.All
      ? {}
      : { location: [adminProfile.location, admin.LOCATION.Unset] };
  // location can be passed in a query
  const requestedLocation = req.query.location;
  let requestedLocationFilter = {}; // All as default
  if (requestedLocation) {
    if (requestedLocation != admin.LOCATION.All) {
      // if not All, then specify
      requestedLocationFilter = { location: requestedLocation };
    }
  }
  // 'shownLocation' is a parament to set locations selected property to what was realy shown
  const shownLocation = requestedLocation
    ? requestedLocation
    : adminProfile.location;
  //    adding location to a filter
  const filter = requestedLocation
    ? requestedLocationFilter
    : defaulLocationFilter;
  // adding enrollment status to a filter
  filter.graduate = req.query.graduate || "no";
  // DB query
  const students = await Student.find(filter)
    .select(studentPopulated)
    .populate(studentListPopulate);
  res.render(path.join(__dirname + "/student-list.ejs"), {
    students,
    adminProfile,
    shownLocation,
    locations: admin.LOCATION,
    shownEnrollmentStatus: req.query.graduate || "no",
    enrollmentStatuses: tools.enrollmentStatusesArray,
  });
});


// for showing a shorter Student List variants, for exapmle when click on admin-profile-chart-columns
// or when clicking on graduates charts column
studentRouter.get("/shortlist", ifCanReadOrInstructor, async (req, res) => {
  const year = req.query.year;
  const month = req.query.month;
  const location = req.query.location;
  const graduate = req.query.graduate;
  if (year && month && location) {
    // TOOL: leading zero
    function leadingZero(n) { return n < 10 ? `0${n}` : `${n}` }
    // calculating period for request
    const n1 = chart.monthNames.indexOf(month) + 1;
    const n2 = (n1 + 1) % 12;
    // receiving start-year and end-year
    const startYear = parseInt(year);
    const endYear = startYear + Math.trunc((n1 + 1) / 12);
    // receiving start-date and end-date
    const startDate = `${startYear}-${leadingZero(n1)}-01T00:00:00Z`;
    const endDate = `${endYear}-${leadingZero(n2)}-01T00:00:00Z`;
    // defining admin and searching Students
    const adminProfile = admin.findAdminById(req.session.userId);
    const isLocation = 
      adminProfile.location === admin.LOCATION.All ||
      location === admin.LOCATION.Unset ||
      location === adminProfile.location
    if (isLocation) {
      const filter = { location }
      // add graduate to a filter if was passed
      if (graduate) {
        filter.enrollmentStatusUpdate = { $gte: startDate, $lte: endDate }
        filter.graduate = graduate
      } else {
        filter.created = { $gte: startDate, $lte: endDate }
      }
      // get students with filter
      const students = await Student
        .find(filter)
        .select(studentPopulated)
        .populate(studentListPopulate);
      // form object to pass into engine
      const passedLocals = {
        students,
        adminProfile,
        shownLocation: location,
        locations: admin.LOCATION,
      }
      // add graduate if needed. If NOT should be not passed to engine at all
      if (graduate) {
        passedLocals.shownEnrollmentStatus = graduate
        passedLocals.enrollmentStatuses = tools.enrollmentStatusesArray
      }
      return res.render(path.join(__dirname + "/student-list.ejs"), passedLocals);
    }
  }
  res.redirect("/admin/profile");
});


// @POST admin/student/new/id
studentRouter.post("/new/:id", ifCanWrite, async (req, res) => {
  const userId = req.params.id; // receiving user _id from posting form
  try {
    const user = await User.findById(userId).populate({ path: "dataCollection", select: "firstName lastName" })     // finds a user with given _id
    if (!user) { return res.status(404).send(`Cannot find user with id: ${userId}`) }

    // Only 1 student can be assigned to 1 user, let's check maybe there is already Student with given user._id
    const existingStudent = await Student.findOne({ user: userId })
    if (existingStudent) { return res.status(500).send(`This user is a student alredy, key is ${existingStudent.key}`) }

    // working with Student-List cofigurations - receiving
    const studentConfigurations = await StudentCONFIG.findOne({ configType: "student-list" })
    studentConfigurations.lastStudentKey += 1
    const lastStudentKey = studentConfigurations.lastStudentKey
    await studentConfigurations.save()

    // defining admin and searching Students
    const adminProfile = admin.findAdminById(req.session.userId)

    // creating a new Student
    const student = await new Student({
      key: lastStudentKey, email: user.email,
      user: userId, fullName: `${user.dataCollection.firstName.trim()} ${user.dataCollection.lastName.trim()}`,
      location: adminProfile.location === admin.LOCATION.All ? admin.LOCATION.Unset : adminProfile.location   // assigning a location if not 'All'
    }).save()

    // saving backlink in a User model on new Student
    user.student = student._id
    await user.save();
    // creating new Tuition record for this Student
    const tuition = await new Tuition({
      key: lastStudentKey,
      email: user.email,
      student_id_string: student._id,
    }).save();
    // saving ref in Student for its lessons
    student.tuition = tuition._id;
    await student.save();
  } catch (e) {
    return res.status(500).send(`Issue when saving a new sudent: ${e.message}`);
  }

  res.status(200).redirect("/admin/user-area"); // ok, redirecting to users area
});


// Updates Location
studentRouter.post("/update-location", ifCanWrite, async (req, res) => {
  const { userId, studentId, location } = req.body;
  if (!userId || !studentId || !location) {
    return res
      .status(404)
      .send(`Location updating isssue: ${userId}, ${studentId}, ${location}`);
  }
  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).send(`Cannot find student with ID: ${studentId}`);
    }
    if (student.location != location) {
      student.location = location;
      await student.save();
    }
    res.redirect(`/admin/user/${userId}?activatetab=4`);
  } catch (e) {
    return res.status(500).send(`Location updating isssue: ${e.message}`);
  }
});

// Updates Learning Center Access
studentRouter.get("/allow-tuition/:id", ifCanWrite, async (req, res) => {
  // Allows tuition for an existing Student
  // auth is good
  const studentId = req.params.id; // receiving student _id from client-side
  const student = await Student.findById(studentId).select([
    "key",
    "email",
    "user",
    "tuition",
  ]);

  if (studentId && student) {
    try {
      let tuition = await Tuition.findOne({ student_id_string: studentId });
      // doing the next NOT depending if student has a tuition record already or not. Because records can be not mutually referred
      // double check if there is not tuition record for this student
      if (tuition) {
        //  if there is a tuition record for this student
        student.tuition = tuition._id;
      } else {
        //  if there is NO tuition record for this student
        // creating new Tuition record for this Student
        tuition = await new Tuition({
          key: student.key,
          email: student.email,
          student_id_string: student._id,
        }).save();
        // saving ref in Student for its lessons
        student.tuition = tuition._id;
      }
      await student.save();
      return res
        .status(200)
        .redirect(`/admin/user/${student.user}?activatetab=4`);
    } catch (e) {
      return res.status(500).send(`Server issue: ${e.message}`);
    }
  }
  return res.status(400).send(`Cannot find Student with id: ${studentId}`);
});

studentRouter.get(
  "/change-tuition-access/:id",
  ifCanWrite,
  async (req, res) => {
    // Forbids tuition for an existing Student
    // auth is good
    const studentId = req.params.id; // receiving student _id from client-side
    const action = req.query.action;
    const student = await Student.findById(studentId).select([
      "user",
      "tuition",
    ]);

    if (student) {
      if (student.tuition) {
        const tuition = await Tuition.findById(student.tuition).select(
          "isAllowed"
        );
        if (tuition) {
          if (action === "enable") {
            tuition.isAllowed = true;
          }
          if (action === "disable") {
            tuition.isAllowed = false;
          }
          if (action === "enable" || action === "disable") {
            try {
              await tuition.save();
              return res
                .status(200)
                .redirect(`/admin/user/${student.user}?activatetab=4`);
            } catch (e) {
              return res
                .status(500)
                .send(`Cannot save tuition record: ${e.message}`);
            }
          }
        }
        return res.status(404).end();
      }
    }
    return res.status(400).send(`Cannot find Student with id: ${studentId}`);
  }
);

// @POST admin/student/print-bulk-qr
studentRouter.post("/print-bulk-qr", ifCanRead, (req, res) => {
  // BULK QRs printing
  let { qrsToPrint, qrsNamesToPrint, qrsKeysToPrint, qrsClassesToPrint } =
    req.body;

  if (!Array.isArray(qrsToPrint)) {
    qrsToPrint = [qrsToPrint];
    qrsNamesToPrint = [qrsNamesToPrint];
    qrsKeysToPrint = [qrsKeysToPrint];
    qrsClassesToPrint = [qrsClassesToPrint];
  }

  res.render(path.join(__dirname + "/qr_bulk-print.ejs"), {
    qrsToPrint,
    qrsNamesToPrint,
    qrsKeysToPrint,
    qrsClassesToPrint,
  });
});

// bringing skills test location names and color schemes for initial tests and retests
const skillsTestLocations = require("./skills-test-config");

// @GET admin/student/skills-test
// ?TTT=100
studentRouter.get("/skills-test", ifCanRead, async (req, res) => {
  const minTTT = req.query.TTT || 100;
  try {
    const students = await Student
      .where("TTT").gte(parseFloat(minTTT))
      .where("status").equals("unblock")
      .where("graduate").equals("no")   //  this prevents graduates to be shown in skills-test
      .select("key TTT created location skillsTest")
      .populate([
        {
          path: "user",
          populate: {
            path: "dataCollection",
            select: "firstName lastName middleName DOB phone",
          },
        },
        {
          path: "user",
          populate: {
            path: "application",
            select: "vehicle-license",
          },
        },
        {
          path: "user",
          select: "balance payments",
          populate: {
            path: "agreement",
            select: "class transmission tuitionCost regisrFee supplyFee otherFee",
          },
        },
        { path: "tuition", select: "avLessonsRate" },
        {
          path: "scoring",
          select: "scoringsInCab scoringsOutCab scoringsBacking scoringsCity",
        },
      ])
      .sort({ location: 1, TTT: -1 });
    res.status(200).render(path.join(__dirname + "/skills-test.ejs"), {
      students,
      minTTT,
      skillsTestLocations,
    });
  } catch (e) {
    res.status(500).send(`Server issue: ${e.message}`);
  }
});

// @PUT Updates data about skills test inside Student
studentRouter.put("/skills-test", ifCanWrite, async (req, res) => {
  try {
    const skillsData = req.body;
    if (!skillsData || !skillsData.students) {
      res.status(404).end();
    }
    skillsData.students.map(async (student) => {
      if (student && student.studentId) {
        let grad = await Student.findById(student.studentId);
        grad.skillsTest.push({
          testLocation: skillsData.testLocation,
          testType: student.testType,
          vehicleType: student.vehicleType,
          endorsements: student.endorsements,
          brakes: student.brakes,
          strf: student.strf,
          scheduledDate: student.scheduledDate,
        });
        await grad.save();
      }
    });
    res.status(200).end();
  } catch (e) {
    res.status(500).send(`Server issue: ${e.message}`);
  }
});

// @DEL Deletes a specific skills test inside Student record
// skills test _id should be passed in body
studentRouter.delete("/skills-test/:id", ifCanWrite, async (req, res) => {
  try {
    const dataStr = req.params.id;
    if (dataStr) {
      params = dataStr.split("&"); // params[0] - student._id; params[1] - test._id`
      if (params.length === 2) {
        const student = await Student.findById(params[0]);
        if (student.skillsTest) {
          student.skillsTest = student.skillsTest.filter(
            (test) => test._id != params[1]
          );
          await student.save();
          return res.status(200).json({ newTests: student.skillsTest });
        }
      }
    }
    return res.status(400).send("Wrong parametrs sent");
  } catch (e) {
    res.status(500).send(`Server issue: ${e.message}`);
  }
})


// @GET skills-calendar
// ?year=2022&month=2
studentRouter.get("/skills-calendar", ifCanWrite, async (req, res) => {
  // backlink to skills-test (setting a minTTT like it was before)
  const minTTT = req.query.backtoTTT;
  // parsing query for year and month
  const date = new Date();
  // start date year and month
  let year = parseInt(req.query.year || date.getFullYear());
  year = year > 2000 ? year : date.getFullYear();
  const month = parseInt(req.query.month || date.getMonth() + 1);

  const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0)); //  00:00:00Z
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59)); //  day = 0 - last day of prev.month

  try {
    // select for NON-EMPTY arrays in record ONLY!!!
    const students = await Student
      .find({ skillsTest: {$exists: true, $ne: []} })
      .where("graduate").equals("no")     //  this prevents graduates to be shown in skills-calendar
      .select("key skillsTest graduate")
      .populate({ path: "user", select: "name" });
    // check selection was successful
    if (!students) {
      res.status(404).send("No students found");
    }
    // array of days (between start and end dates) will be passed to an engine
    // creating array of blank days - days without any appointments
    const days = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      // NOT including endDate
      days.push({ date: new Date(currentDate), students: [] });
      currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }
    // students is an array of ALL students with skill tests, but I need only those who are in this particular date frame
    const studentsKeys = [];
    const studentsInRange = [];
    // moving though students selection to get those, which are in [startDate - endDate] range
    students.map((student) => {
      student.skillsTest.map((test) => {
        if (test.scheduledDate >= startDate && test.scheduledDate <= endDate) {
          // if skills-test date is in range, then calc. position of element in array to update one
          let index = Math.trunc((test.scheduledDate - startDate) / 86400000); // (24*60*60*1000) = 86400000
          // updating a day record
          days[index].students.push({
            // general student data
            studentId: student._id,
            userId: student.user._id,
            key: student.key,
            name: student.user.name,
            // graduate
            graduate: student.graduate,
            // skills-test data
            testId: test._id,
            testLocation: test.testLocation,
            testDateTime: test.scheduledDate,
            testType: test.testType,
            vehicleType: test.vehicleType,
            endorsements: test.endorsements,
            brakes: test.brakes,
            strf: test.strf,
          });
          // adding this student to studentsKeys if not there yet
          if (!studentsKeys.includes(student.key)) {
            // to make it easier in ejs, passing students' data few arrays
            studentsKeys.push(student.key);
            studentsInRange.push({
              studentId: student._id,
              userId: student.user._id,
              name: student.user.name,
              short: getShortName(student.user.name),
              allSkillsTests: student.skillsTest,
            });
          }
        }
      }); //  skill-tests.map
    }); // students.map

    res.status(200).render(path.join(__dirname + "/skills-calendar.ejs"), {
      minTTT,
      days,
      studentsKeys,
      studentsInRange,
      skillsTestLocations,
    });
  } catch (e) {
    res.status(500).send(`Server issue: ${e.message}`);
  }
});

// tool - creating short names, like GA from Gen And
function getShortName(name) {
  const arr = name
    .replace(/[^a-z\s]/gi, "") // remove all spec.symbols and digits
    .toUpperCase() // upper case
    .split(" ") // to array
    .filter((el) => el); // delete all empty elements (when space at the end and etc.)

  if (!arr || !arr.length) {
    return;
  }

  if (arr.length === 1) {
    return arr[0][0];
  } else {
    return `${arr[0][0]}${arr[arr.length - 1][0]}`;
  }
}


// @GET wbdrs annual report
// ?year=2022
studentRouter.get("/wbdrs", ifCanRead, async (req, res) => {
  const reportYear = parseInt(req.query.year) || new Date().getFullYear();
  // reposrt has to be prepared since July 1st prev. year till June 30th of report year + all currently styding
  const startDate = `${reportYear - 1}-07-01T00:00:00-08:00`;
  const endDate = `${reportYear}-06-30T23:59:59-08:00`;
  // what to search
  const studentData = "location created enrollmentStatus enrollmentStatusUpdate graduate";
  const userDataPopulated = [
    {
      path: "user",
      select: "agreement",
      populate: {
        path: "agreement",
        select: "class",
      }
    },
    {
      path: "user",
      select: "dataCollection",
      populate: {
        path: "dataCollection",
        select: "-__v -created",
      },
    },
  ];

  try {
    const students = await Student.where("created")
      .gte(startDate)
      .lte(endDate)
      .populate(userDataPopulated)
      .select(studentData);

    return res.status(200).render(path.join(__dirname + "/wbdrs.ejs"), { 
        students, reportYear,
        startDate, endDate
    });
  } catch (e) {
    res.status(500).send(`Server issue: ${e.message}`);
  } 
});


// @GET expulsion
studentRouter.get("/expulsion", ifCanRead, async (req, res) => {
  try {
    const adminProfile = admin.findAdminById(req.session.userId);
    // filter to find Students due to LOCATION: All - can see All, else - only assigned to location + UNSET
    let filter = adminProfile.location === admin.LOCATION.All ? {} : { location: [adminProfile.location, admin.LOCATION.Unset] }
    filter.graduate = "no"

    const students = await Student.find(filter)
    .select('created key email TTT location clocks')
    .populate({
      path: "user", select: "lastSESS balance",
      populate: { path: "dataCollection", select: "firstName lastName phone -_id" }
    })

    if (!students) { res.status(404).send("No students found") }
 
    const today = new Date()
    const date1 = new Date(Date.UTC(today.getFullYear(), today.getMonth() - 2, 1, 0, 0, 0))
    const date2 = new Date(Date.UTC(today.getFullYear(), today.getMonth() - 1, 1, 0, 0, 0))
    const date3 = new Date(Date.UTC(today.getFullYear(), today.getMonth(), 1, 0, 0, 0))

    const activeStudents = []

    students.map(student => {
      let expulsionStudentInfo = {
        userId: student.user._id,
        // general data
        fullName: `${student.user.dataCollection.firstName} ${student.user.dataCollection.lastName}`,
        key: student.key,
        location: student.location,
        phone: student.user.dataCollection.phone,
        email: student.email,
        balance: student.user.balance,
        TTT: student.TTT,
        // general dates
        tuitionStartDate: student.created,
        lastVisitedDate: student.clocks.length ? student.clocks[student.clocks.length - 1].date : false,
        lastSessionDate: student.user.lastSESS,
        // clock's info
        totalClocks: student.clocks.length,
        month1Clocks: 0,
        month2Clocks: 0,
        month3Clocks: 0,
        // attendFlags
        month1attendFlag: student.created < date2,
        month2attendFlag: student.created < date3,
        month3attendFlag: student.created < today,
      }
      let dateKey = ""
      student.clocks.forEach(clock => {
        if (clock.date >= date1 && clock.date < date2 && clock.key != dateKey) {
          expulsionStudentInfo.month1Clocks += 1
          dateKey = clock.key     // to calculate days, but not clocks
        } else {
          if (clock.date >= date2 && clock.date < date3 && clock.key != dateKey) {
            expulsionStudentInfo.month2Clocks += 1
            dateKey = clock.key     // to calculate days, but not clocks
          } else {
            if (clock.date >= date3 && clock.date <= today && clock.key != dateKey) {
              expulsionStudentInfo.month3Clocks += 1
              dateKey = clock.key     // to calculate days, but not clocks
            }
          }
        }
      })
      activeStudents.push(expulsionStudentInfo)
    })

    return res.status(200).render(path.join(__dirname + "/expulsion.ejs"), { activeStudents, date1, date2, date3 })
  } catch (e) {
    res.status(500).send(`Server issue: ${e.message}`)
  } 
})


module.exports = studentRouter;
