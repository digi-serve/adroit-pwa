import { createStore } from "framework7";
import Api from "/js/api.js";
import fetchJson from "/js/fetch.js";

function parse(records, state) {
  let theseRecords = JSON.parse(JSON.stringify(records));
  let translated;
  if (theseRecords.forEach) {
    let records = [];
    theseRecords.forEach((record) => {
      records.push(parse(record, state));
    });
    theseRecords = records;
  } else if (typeof theseRecords == "object") {
    for (var propt in theseRecords) {
      if (
        propt.indexOf("__relation") > -1 ||
        (propt != "translations" &&
          theseRecords[propt] != null &&
          theseRecords[propt].forEach)
      ) {
        if (theseRecords[propt] != null) {
          theseRecords[propt] = parse(theseRecords[propt], state);
        }
      } else if (propt == "translations") {
        theseRecords = translate(theseRecords, state);
      }
    }
  }
  // console.log(theseRecords);
  return theseRecords;
}

function translate(record, state) {
  if (!record?.translations) return record;
  let translated;

  record.translations.forEach((trans) => {
    if (trans.language_code == state.locale) {
      let translatedRecord = {
        ...record,
        ...trans,
      };
      translated = translatedRecord;
    }
  });
  return translated;
}

const store = createStore({
  state: {
    activities: [],
    activityImages: [],
    activityImagesPrevious: [],
    approvals: [],
    approvalCount: 0,
    approvalsLoading: true,
    csrftoken: "",
    currentStatus: {},
    daysLeft: 0,
    denial: "<div class='preloader' style='margin: 0 auto;'></div>",
    fcfLocations: [],
    fcfVolunteers: [],
    fullYearLoaded: false,
    hasLocations: false,
    isApprover: false,
    imagesLoading: true,
    gotUser: false,
    prevImagesLoading: false,
    locations: [],
    myProjects: [],
    percentageComplete: 0,
    photoCombineProgress: 0,
    photoProgress: 0,
    ReportingPeriodStatus: {
      LOADING: {
        threshold: null,
        color: "rgb(19 46 97)",
        label: "loading",
        icon: "downloading",
      },
      AHEAD: {
        threshold: 2,
        color: "#4caf50",
        label: "ahead",
        icon: "sentiment_very_satisfied",
      },
      ONTRACK: {
        threshold: -1,
        color: "#07bb8f",
        label: "on track",
        icon: "sentiment_satisfied",
      },
      BEHIND: {
        threshold: -3,
        color: "#ff6633",
        label: "behind",
        icon: "sentiment_dissatisfied",
      },
      WARNING: {
        threshold: -5,
        color: "#cc3333",
        label: "warning",
        icon: "sentiment_very_dissatisfied",
      },
    },
    teamMembers: [],
    teamObjectives: [],
    teams: [],
    totalApproved: 0,
    totalNew: 0,
    user: { "Full Name": "" },
    username: "",
    version: "",
    switcheroo: false,
    hasSwitcheroo: false,
    locale: "en",
    siteUserId: "",
  },
  getters: {
    activities({ state }) {
      return state.activities;
    },
    activityImages({ state }) {
      return state.activityImages;
    },
    activityImagesPrevious({ state }) {
      return state.activityImagesPrevious;
    },
    approvalCount({ state }) {
      return state.approvalCount;
    },
    approvalsLoading({ state }) {
      return state.approvalsLoading;
    },
    approvals({ state }) {
      return state.approvals;
    },
    csrfToken({ state }) {
      return state.csrftoken;
    },
    currentStatus({ state }) {
      return state.currentStatus;
    },
    daysLeft({ state }) {
      return state.daysLeft;
    },
    denial({ state }) {
      return state.denial;
    },
    fcfLocations({ state }) {
      return state.fcfLocations;
    },
    fcfVolunteers({ state }) {
      return state.fcfVolunteers;
    },
    fullYearLoaded({ state }) {
      return state.fullYearLoaded;
    },
    hasLocations({ state }) {
      return state.hasLocations;
    },
    imagesLoading({ state }) {
      return state.imagesLoading;
    },
    locale({ state }) {
      return state.locale;
    },
    gotUser({ state }) {
      return state.gotUser;
    },
    isApprover({ state }) {
      return state.isApprover;
    },
    prevImagesLoading({ state }) {
      return state.prevImagesLoading;
    },
    myLocations({ state }) {
      return state.locations;
    },
    myTeams({ state }) {
      return state.teams;
    },
    myTeamMembers({ state }) {
      return state.teamMembers;
    },
    myProjects({ state }) {
      return state.myProjects;
    },
    percentageComplete({ state }) {
      return state.percentageComplete;
    },
    photoCombineProgress({ state }) {
      return state.photoCombineProgress;
    },
    photoProgress({ state }) {
      return state.photoProgress;
    },
    switcheroo({ state }) {
      return state.switcheroo;
    },
    hasSwitcheroo({ state }) {
      return state.hasSwitcheroo;
    },
    teamObjectives({ state }) {
      return state.teamObjectives;
    },
    totalApproved({ state }) {
      return state.totalApproved;
    },
    totalNew({ state }) {
      return state.totalNew;
    },
    user({ state }) {
      return state.user;
    },
    username({ state }) {
      return state.username;
    },
    version({ state }) {
      return state.version;
    },
    siteUserId({ state }) {
      return state.siteUserId;
    },
  },
  actions: {
    addCsrfToken({ state }, token) {
      localStorage.setItem("csrftoken", token);
      state.csrftoken = token;
    },
    addLocation({ state }, location) {
      let locations = state.locations;
      locations.unshift(location);
      localStorage.setItem("locations", JSON.stringify(locations));
      state.locations = locations;
    },
    deleteLocation({ state }, location) {
      let locations = state.locations;
      const index = locations.indexOf(location);
      if (index > -1) {
        locations.splice(index, 1);
      }
      localStorage.setItem("locations", JSON.stringify(locations));
      state.locations = locations;
    },
    fetchApprovals({ state }, done) {
      // let query = `?date[>=]=${queryDate}&status[!]=archived&sort=date DESC`;
      fetchJson(
        `${
          Api.urls.getApprovals.url
        }&skipPack=true&sort=[{"key":"589ca09c-9fc3-4433-8247-e8f99ab2b542","dir":"desc"}]&where=
          ${JSON.stringify(Api.urls.getApprovals.where)}`,
        { method: "GET" }
      )
        .then((result) => {
          // let peeps = state.teamMembers;
          // let myTeamsApprovals = [];
          // let myTeam = [];
          // state.teamMembers.forEach((person) => {
          //   myTeam.push(person.display_name);
          // });
          // result.json.forEach((item) => {
          //   if (myTeam.includes(item.objectData.relatedInfo.viewData.user.displayName) && ["new", "updated"].includes(item.objectData.form.data.status)) {
          //     myTeamsApprovals.push(item);
          //   }
          // });
          result.json.data.data.forEach((item) => {
            // make sure we are working with just the date so calculate any timezone offset first
            let minutesOffset = new Date().getTimezoneOffset();
            let shiftHours = new Date(
              new Date(item["Date of Activity"]).getTime() +
                minutesOffset * 60000
            );

            item["Date of Activity"] = shiftHours.toISOString();
          });
          state.approvals = result.json.data.data;
          state.approvalCount = result.json.data.data.length;
          state.approvalsLoading = false;
          state.isApprover = true;
          if (done) {
            done();
          }
        })
        .catch((err) => {
          if (err?.code == "E_NOTPERMITTED") {
            state.isApprover = false;
          }
        });
    },
    pruneApprovals({ state }, id) {
      let newSet = [];
      state.approvals.forEach((item) => {
        if (item.id != id) {
          newSet.push(item);
        }
      });
      state.approvalCount = newSet.length;
      state.approvals = newSet;
    },
    fetchImages({ state }, done) {
      if (!navigator.onLine) {
        done();
        let toastWithButton = app.f7.toast
          .create({
            icon: '<i class="material-icons">wifi_off</i>',
            text: "No connection",
            position: "center",
            closeTimeout: 3000,
          })
          .open();
        return false;
      }
      let totalApproved = 0;
      let totalNew = 0;
      let today = new Date();
      let targetImageCount = 12;

      const currentMonth = today.getMonth(today);
      const currentYear = today.getFullYear(today);
      const period = currentMonth;
      const start = new Date(currentYear, period, 1);
      const end = new Date(currentYear, period + 1, 1);
      let groupedByMonths = [];

      const daysElapsed = Math.ceil(
        today.getTime() / (1000 * 3600 * 24) -
          Math.ceil(start.getTime()) / (1000 * 3600 * 24)
      );
      const startToEnd = Math.ceil(
        end.getTime() / (1000 * 3600 * 24) -
          Math.ceil(start.getTime()) / (1000 * 3600 * 24)
      );
      state.daysLeft = Math.ceil(
        end.getTime() / (1000 * 3600 * 24) -
          Math.ceil(today.getTime()) / (1000 * 3600 * 24)
      );
      const proRataTargetImageCount = Math.floor(
        targetImageCount * (daysElapsed / startToEnd)
      );

      let threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 2);
      threeMonthsAgo.setDate(1);

      // get activity images in last three months
      var month = "" + (threeMonthsAgo.getMonth() + 1),
        day = "" + threeMonthsAgo.getDate(),
        year = threeMonthsAgo.getFullYear();

      if (month.length < 2) month = "0" + month;
      if (day.length < 2) day = "0" + day;

      let queryDate = [year, month, day].join("/");

      // get activity images in last three months
      var todayMonth = "" + (today.getMonth() + 1),
        todayDay = "" + today.getDate(),
        todayYear = today.getFullYear();

      if (month.length < 2) month = "0" + month;
      if (day.length < 2) day = "0" + day;

      let queryToday = [todayYear, todayMonth, todayDay].join("/");

      let datesRule = [
        {
          key: "589ca09c-9fc3-4433-8247-e8f99ab2b542",
          rule: "greater_or_equal",
          value: queryDate,
        },
        {
          key: "589ca09c-9fc3-4433-8247-e8f99ab2b542",
          rule: "less_or_equal",
          value: queryToday,
        },
      ];

      let wheres = { ...Api.urls.myActivityImages.where };

      wheres.rules = wheres.rules.concat(datesRule);

      fetchJson(
        `${
          Api.urls.myActivityImages.url
        }&skipPack=true&sort=[{"key":"589ca09c-9fc3-4433-8247-e8f99ab2b542","dir":"desc"}]&where=
          ${JSON.stringify(wheres)}`,
        { method: "GET" }
      )
        .then((result) => {
          let data = parse(result.json.data.data, state);
          state.percentageComplete = (100 * daysElapsed) / startToEnd;
          let monthSlot = 0;

          data.forEach((item, i) => {
            // make sure we are working with just the date so calculate any timezone offset first
            let minutesOffset = new Date().getTimezoneOffset();
            let shiftHours = new Date(
              new Date(item["Date of Activity"]).getTime() +
                minutesOffset * 60000
            );

            item["Date of Activity"] = shiftHours.toISOString();

            let itemDate = new Date(item["Date of Activity"]);
            let itemMonth = itemDate.toLocaleString(state.locale, {
              month: "short",
            });
            let itemMonthLong = itemDate.toLocaleString(state.locale, {
              month: "long",
            });
            let itemMonthIndex = itemDate.toLocaleString(state.locale, {
              month: "2-digit",
            });
            let itemYear = itemDate.toLocaleString(state.locale, {
              year: "numeric",
            });
            if (!groupedByMonths[monthSlot]) {
              groupedByMonths[monthSlot] = {
                label: itemMonth + " " + itemYear,
                long: itemMonthLong,
                year: itemYear,
                firstDate: itemYear + "-" + itemMonthIndex + "-01",
                new: 0,
                approved: 0,
                reportDates: [], // we need to count how many approved photos are on separate dates
                items: [],
              };
              groupedByMonths[monthSlot].items.push(item);
            } else {
              if (
                groupedByMonths[monthSlot].label ==
                itemMonth + " " + itemYear
              ) {
                groupedByMonths[monthSlot].items.push(item);
              } else {
                monthSlot++;
                groupedByMonths[monthSlot] = {
                  label: itemMonth + " " + itemYear,
                  long: itemMonthLong,
                  year: itemYear,
                  firstDate: itemYear + "-" + itemMonthIndex + "-01",
                  new: 0,
                  approved: 0,
                  reportDates: [], // we need to count how many approved photos are on separate dates
                  items: [],
                };
                groupedByMonths[monthSlot].items.push(item);
              }
            }
            let itemMonthNum = new Date(item["Date of Activity"]).getMonth();
            if (itemMonthNum == currentMonth) {
              if (item.Status == "Approved" || item.Status == "Ready") {
                totalApproved++;
              } else if (item.Status == "New" || item.Status == "Updated") {
                totalNew++;
              }
              // state.photoCombineProgress =
              //   ((totalApproved + totalNew) / targetImageCount) * 100;
              // if (state.photoCombineProgress > 100) {
              //   state.photoCombineProgress = 100;
              // }
              // state.photoProgress = (totalApproved / targetImageCount) * 100;
              // if (state.photoProgress > 100) {
              //   state.photoProgress = 100;
              // }
            }

            if (item.Status == "Approved" || item.Status == "Ready") {
              groupedByMonths[monthSlot].approved++;
              if (
                groupedByMonths[monthSlot].reportDates.includes(
                  itemDate.toDateString().replace(/\s/g, "")
                ) == false
              ) {
                groupedByMonths[monthSlot].reportDates.push(
                  itemDate.toDateString().replace(/\s/g, "")
                );
              }
            } else if (item.Status == "New" || item.Status == "Updated") {
              groupedByMonths[monthSlot].new++;
            }
          });
          state.photoCombineProgress =
            ((totalApproved + totalNew) / targetImageCount) * 100;
          if (state.photoCombineProgress > 100) {
            state.photoCombineProgress = 100;
          }
          state.photoProgress = (totalApproved / targetImageCount) * 100;
          if (state.photoProgress > 100) {
            state.photoProgress = 100;
          }
          state.totalApproved = totalApproved;
          state.totalNew = totalNew;
          state.activityImages = groupedByMonths;
          const diff = totalApproved - proRataTargetImageCount;

          if (diff >= state.ReportingPeriodStatus.AHEAD.threshold) {
            state.currentStatus = state.ReportingPeriodStatus.AHEAD;
          }
          if (
            diff < state.ReportingPeriodStatus.AHEAD.threshold &&
            diff >= state.ReportingPeriodStatus.ONTRACK.threshold
          ) {
            state.currentStatus = state.ReportingPeriodStatus.ONTRACK;
          }
          if (
            diff < state.ReportingPeriodStatus.ONTRACK.threshold &&
            diff >= state.ReportingPeriodStatus.BEHIND.threshold
          ) {
            state.currentStatus = state.ReportingPeriodStatus.BEHIND;
          }
          if (diff < state.ReportingPeriodStatus.BEHIND.threshold) {
            state.currentStatus = state.ReportingPeriodStatus.WARNING;
          }
          state.imagesLoading = false;
          if (done) {
            done();
          }
        })
        .catch((err) => {
          // console.error("fetchJson failed");
        });
    },
    fetchPreviousYearsImages({ state }, done) {
      state.prevImagesLoading = true;
      if (!navigator.onLine) {
        done();
        let toastWithButton = app.f7.toast
          .create({
            icon: '<i class="material-icons">wifi_off</i>',
            text: "No connection",
            position: "center",
            closeTimeout: 3000,
          })
          .open();
        return false;
      }

      let groupedByMonthsPrevious = [];

      let threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 2);
      threeMonthsAgo.setDate(0);

      console.log(threeMonthsAgo);

      // get activity images in last three months
      var month = "" + (threeMonthsAgo.getMonth() + 1),
        day = "" + threeMonthsAgo.getDate(),
        year = threeMonthsAgo.getFullYear();

      if (month.length < 2) month = "0" + month;
      if (day.length < 2) day = "0" + day;

      let queryDate = [year, month, day].join("/");

      let oneYearAgo = new Date();
      oneYearAgo.setYear(oneYearAgo.getFullYear() - 1);
      oneYearAgo.setDate(1);

      // get activity images in last three months
      var month2 = "" + (oneYearAgo.getMonth() + 1),
        day2 = "" + oneYearAgo.getDate(),
        year2 = oneYearAgo.getFullYear();

      if (month2.length < 2) month2 = "0" + month2;
      if (day2.length < 2) day2 = "0" + day2;

      let queryDate2 = [year2, month2, day2].join("/");

      // get activity images in this reporting period
      let datesRule1 = {
        key: "589ca09c-9fc3-4433-8247-e8f99ab2b542",
        rule: "greater_or_equal",
        value: queryDate2,
      };
      let datesRule2 = {
        key: "589ca09c-9fc3-4433-8247-e8f99ab2b542",
        rule: "less",
        value: queryDate,
      };
      let wheres = { ...Api.urls.myActivityImages.where };

      wheres.rules = wheres.rules.concat(datesRule1);
      wheres.rules = wheres.rules.concat(datesRule2);

      console.log("queryDate: ", queryDate);
      console.log("queryDate2: ", queryDate2);

      fetchJson(
        `${
          Api.urls.myActivityImages.url
        }&skipPack=true&sort=[{"key":"589ca09c-9fc3-4433-8247-e8f99ab2b542","dir":"desc"}]&where=
          ${JSON.stringify(wheres)}`,
        { method: "GET" }
      )
        .then((result) => {
          let data = parse(result.json.data.data, state);

          let monthSlot = 0;
          data.forEach((item, i) => {
            // make sure we are working with just the date so calculate any timezone offset first
            let minutesOffset = new Date().getTimezoneOffset();
            let shiftHours = new Date(
              new Date(item["Date of Activity"]).getTime() +
                minutesOffset * 60000
            );

            item["Date of Activity"] = shiftHours.toISOString();

            let itemDate = new Date(item["Date of Activity"]);
            let itemMonth = itemDate.toLocaleString(state.locale, {
              month: "short",
            });
            let itemMonthLong = itemDate.toLocaleString(state.locale, {
              month: "long",
            });
            let itemMonthIndex = itemDate.toLocaleString(state.locale, {
              month: "2-digit",
            });
            let itemYear = itemDate.toLocaleString(state.locale, {
              year: "numeric",
            });
            if (!groupedByMonthsPrevious[monthSlot]) {
              groupedByMonthsPrevious[monthSlot] = {
                label: itemMonth + " " + itemYear,
                long: itemMonthLong,
                year: itemYear,
                firstDate: itemYear + "-" + itemMonthIndex + "-01",
                new: 0,
                approved: 0,
                reportDates: [], // we need to count how many approved photos are on separate dates
                items: [],
              };
              groupedByMonthsPrevious[monthSlot].items.push(item);
            } else {
              if (
                groupedByMonthsPrevious[monthSlot].label ==
                itemMonth + " " + itemYear
              ) {
                groupedByMonthsPrevious[monthSlot].items.push(item);
              } else {
                monthSlot++;
                groupedByMonthsPrevious[monthSlot] = {
                  label: itemMonth + " " + itemYear,
                  long: itemMonthLong,
                  year: itemYear,
                  firstDate: itemYear + "-" + itemMonthIndex + "-01",
                  new: 0,
                  approved: 0,
                  reportDates: [], // we need to count how many approved photos are on separate dates
                  items: [],
                };
                groupedByMonthsPrevious[monthSlot].items.push(item);
              }
            }
            if (item.Status == "Approved" || item.Status == "Ready") {
              groupedByMonthsPrevious[monthSlot].approved++;
              if (
                groupedByMonthsPrevious[monthSlot].reportDates.includes(
                  itemDate.toDateString().replace(/\s/g, "")
                ) == false
              ) {
                groupedByMonthsPrevious[monthSlot].reportDates.push(
                  itemDate.toDateString().replace(/\s/g, "")
                );
              }
            } else if (item.Status == "New" || item.Status == "Updated") {
              groupedByMonthsPrevious[monthSlot].new++;
            }
          });
          state.activityImagesPrevious = groupedByMonthsPrevious;
          state.prevImagesLoading = false;
          state.fullYearLoaded = true;
          if (done) {
            done();
          }
        })
        .catch((err) => {
          // console.error("fetchJson failed");
        });
    },
    getActivities({ state }) {
      fetchJson(
        `${Api.urls.myActivities.url}?skipPack=true&populate=${JSON.stringify([
          "HR  AP Caption508",
        ])}&where=${JSON.stringify(
          Api.urls.myActivities.where
        )}&sort=${JSON.stringify([
          { key: "ac85d950-afe1-427f-9dd1-68a1fadccf87", dir: "asc" },
        ])}`,
        {
          method: "GET",
        }
      )
        .then((res) => {
          // map translations
          let activities = [];
          res.json.data.data.forEach((activity) => {
            activity.translations.forEach((trans) => {
              if (trans.language_code == state.locale) {
                activity = {
                  ...activity,
                  ...trans,
                };
              }
            });
            activities.push(activity);
          });
          state.activities = activities;
        })
        .catch(function (err) {
          app.f7.loginScreen.open("#my-login-screen");
        });
    },
    getDenial({ state }, activityId) {
      fetchJson(`${Api.urls.getDenial(activityId)}`, { method: "GET" })
        .then((result) => {
          let warningIcon = "<i class='large-icon material-icons'>warning</i>";
          state.denial = warningIcon + result.json.data;
        })
        .catch((e) => {
          // console.log(e);
        });
    },
    getFCFLocations({ state }) {
      fetchJson(
        `${Api.urls.locations.url}?skipPack=true&where=${JSON.stringify(
          Api.urls.locations.where
        )}&sort=${JSON.stringify([
          { key: "c7b28b81-749d-4549-967a-e350771d092a", dir: "asc" },
        ])}`
      )
        .then((result) => {
          state.fcfLocations = result.json.data.data;
        })
        .catch((e) => {
          // console.log(e);
        });
    },
    getLocations({ state }) {
      fetchJson(
        `${Api.urls.myLocations.url}?skipPack=true&where=${JSON.stringify(
          Api.urls.myLocations.where
        )}&sort=${JSON.stringify([
          { key: "c7b28b81-749d-4549-967a-e350771d092a", dir: "asc" },
        ])}`
      )
        .then((result) => {
          state.hasLocations = true;
          state.locations = result.json.data.data;
        })
        .catch((e) => {
          // console.log(e);
        });
    },
    getTeamMembers({ state }) {
      fetchJson(
        `${Api.urls.myTeamMembers.url}?skipPack=true&populate=${JSON.stringify([
          "Owner User",
        ])}&where=${JSON.stringify(
          Api.urls.myTeamMembers.where
        )}&sort=${JSON.stringify(Api.urls.myTeamMembers.sort)}`,
        {
          method: "GET",
        }
      )
        .then((res) => {
          let myTeamLookUp = [];
          res.json.data.data.forEach((volunteer) => {
            myTeamLookUp.push(volunteer.id);
          });
          state.teamMembers = res.json.data.data;
          fetchJson(
            `${
              Api.urls.fcfVolunteers.url
            }?skipPack=true&populate=${JSON.stringify([
              "Owner User",
            ])}&where=${JSON.stringify(
              Api.urls.fcfVolunteers.where
            )}&sort=${JSON.stringify(Api.urls.fcfVolunteers.sort)}`,
            {
              method: "GET",
            }
          )
            .then((res) => {
              let otherVolunteers = [];
              res.json.data.data.forEach((volunteer) => {
                if (myTeamLookUp.indexOf(volunteer.id) == -1) {
                  otherVolunteers.push(volunteer);
                }
              });
              state.fcfVolunteers = otherVolunteers;
            })
            .catch(function (err) {
              app.f7.loginScreen.open("#my-login-screen");
            });
        })
        .catch(function (err) {
          app.f7.loginScreen.open("#my-login-screen");
        });
    },
    getMyProjects({ state }) {
      if (!state?.user?.uuid) return false;
      fetchJson(
        `${Api.urls.myProjects.url}?skipPack=true&where=${JSON.stringify(
          Api.urls.myProjects.where
        )}`,
        { method: "GET" }
      )
        .then((result) => {
          state.myProjects = parse(result.json.data.data, state);
          console.log(state.myProjects);
        })
        .catch((e) => {
          console.log(e);
        });
    },
    getTeams({ state }) {
      if (!state?.user?.uuid) return false;

      fetchJson(
        `${
          Api.urls.myAssignments(state.user.uuid).url
        }?skipPack=true&where=${JSON.stringify(
          Api.urls.myAssignments(state.user.uuid).where
        )}`,
        { method: "GET" }
      )
        .then((result) => {
          // build wheres
          let wheres = {
            glue: "or",
            rules: [],
          };
          result.json.data.data.forEach((res) => {
            wheres.rules.push(Api.urls.myTeams(res["Project Team Name"]).where);
          });
          fetchJson(
            `${
              Api.urls.myTeams(state.user.uuid).url
            }?skipPack=true&where=${JSON.stringify(wheres)}`,
            { method: "GET" }
          )
            .then((result) => {
              state.teams = result.json.data.data;
              // build wheres
              let wheres = {
                glue: "or",
                rules: [],
              };
              state.teams.forEach((res) => {
                wheres.rules.push(Api.urls.myTeams(res.uuid).where);
              });

              fetchJson(
                `${
                  Api.urls.myAssignments(state.user.uuid).url
                }?skipPack=true&where=${JSON.stringify(
                  Api.urls.myAssignments(state.user.uuid).where
                )}`,
                { method: "GET" }
              )
                .then((result) => {
                  // build wheres
                  let wheres = {
                    glue: "or",
                    rules: [],
                  };
                  result.json.data.data.forEach((res) => {
                    wheres.rules.push(
                      Api.urls.assignments(res["Project Team Name"]).where
                    );
                  });
                  fetchJson(
                    `${
                      Api.urls.assignments().url
                    }?skipPack=true&where=${JSON.stringify(wheres)}`,
                    { method: "GET" }
                  )
                    .then((result) => {
                      // build wheres
                      let wheres = {
                        glue: "or",
                        rules: [],
                      };
                      result.json.data.data.forEach((res) => {
                        wheres.rules.push(
                          Api.urls.myProjectsWithMembers(res["Person"]).where
                        );
                      });
                      fetchJson(
                        `${
                          Api.urls.myProjectsWithMembers().url
                        }?skipPack=true&where=${JSON.stringify(wheres)}`,
                        { method: "GET" }
                      )
                        .then((result) => {
                          // debugger;
                          let members = result.json.data.data.filter(
                            (person) => person.Status == "Active"
                          );
                          state.teamMembers = members;
                        })
                        .catch((e) => {
                          // console.log(e);
                        });
                    })
                    .catch((e) => {
                      // console.log(e);
                    });
                })
                .catch((e) => {
                  // console.log(e);
                });
            })
            .catch((e) => {
              // console.log(e);
            });
        })
        .catch((e) => {
          // console.log(e);
        });
    },
    getTeamObjectives({ state }, teamId) {
      fetchJson(`${Api.urls.teamObjectives(teamId)}`, { method: "GET" })
        .then((result) => {
          state.teamObjectives = result.json.data;
        })
        .catch((e) => {
          // console.log(e);
        });
    },
    getToken({ state }) {
      let csrftoken = localStorage.getItem("csrftoken");
      state.csrftoken = csrftoken;
    },
    getUser({ state }) {
      fetchJson(
        `${Api.urls.whoami.url}?skipPack=true&where=${JSON.stringify(
          Api.urls.whoami.where
        )}`,
        {
          method: "GET",
        }
      )
        .then((res) => {
          // debugger;
          // console.log("you are logged in already");
          state.user = res.json.data.data[0];
          state.gotUser = true;
        })
        .catch(function (err) {
          app.f7.loginScreen.open("#my-login-screen");
          state.gotUser = false;
        });
    },
    getUsername({ state }) {
      let username = localStorage.getItem("username");
      if (username == null) {
        username = "";
      }
      state.username = username;
    },
    getLanguage({ state }) {
      let locale = localStorage.getItem("locale");
      if (locale == null) {
        locale = "en";
      }
      state.locale = locale;
    },
    getSiteUserId({ state }) {
      let siteUserId = localStorage.getItem("siteuserid");
      if (siteUserId == null) {
        siteUserId = "";
      }
      state.siteUserId = siteUserId;
    },
    getVersion({ state }) {
      // state.version = state.version;
    },
    hasLocations({ state }) {
      if (state.locations.length) {
        state.hasLocations = true;
      } else {
        state.hasLocations = false;
      }
    },
    resetDenial({ state }, activityId) {
      state.denial = "<div class='preloader' style='margin: 0 auto;'></div>";
    },
    setUser({ state }, user) {
      state.user = user;
    },
    setUsername({ state }, username) {
      localStorage.setItem("username", username);
      state.username = username;
    },
    setVersion({ state }, version) {
      state.version = version;
    },
    setLanguage({ state }, language) {
      localStorage.setItem("locale", language);
      state.locale = language;
    },
    setSiteUserId({ state }, uuid) {
      localStorage.setItem("siteuserid", uuid);
      state.siteUserId = uuid;
    },
    switcheroo({ state }, user) {
      fetchJson(`${Api.urls.switcheroo(user).url}`, {
        method: "POST",
      })
        .then((result) => {
          state.switcheroo = true;
          window.location.reload(true);
        })
        .catch((e) => {
          // console.log(e);
          fetchJson(`${Api.urls.switcheroo("").url}`, {
            method: "DELETE",
          })
            .then((result) => {
              state.switcheroo = false;
              window.location.reload(true);
            })
            .catch((e) => {
              console.log(e);
            });
        });
    },
    isSwitcheroo({ state }) {
      fetchJson(`/config`, {
        method: "GET",
      })
        .then((result) => {
          let switcherooRoleID = "320ef94a-73b5-476e-9db4-c08130c64bb8";
          let hasSwitcheroo = false;
          if (result.json.data.user) {
            hasSwitcheroo = result.json.data.user.roles.some(
              (roles) => roles.uuid === switcherooRoleID
            );
          }
          state.hasSwitcheroo = hasSwitcheroo;
          state.switcheroo = result.json.data?.userReal?.uuid ? true : false;
        })
        .catch((e) => {
          console.log(e);
        });
    },
    deleteSwitcheroo({ state }) {
      fetchJson(`${Api.urls.switcheroo("").url}`, {
        method: "DELETE",
      })
        .then((result) => {
          state.switcheroo = false;
          window.location.reload(true);
        })
        .catch((e) => {
          console.log(e);
        });
    },
    updateActivities({ state, dispatch }, { minId }) {
      fetchJson(
        `${Api.urls.myTeams.url}?skipPack=true&where=${JSON.stringify(
          Api.urls.myTeams.where
        )}`,
        { method: "GET" }
      )
        .then((result) => {
          state.teams = result.json.data[0].teams;
          dispatch("getActivities", { minId: minId });
        })
        .catch((e) => {
          // console.log(e);
        });
    },
  },
});
export default store;
