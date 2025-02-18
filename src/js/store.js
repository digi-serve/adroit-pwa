import { createStore } from "framework7";
import Api from "/js/api.js";
import fetchJson from "/js/fetch.js";

const store = createStore({
  state: {
    activities: [],
    activityImages: [],
    activityImagesPrevious: [],
    csrftoken: "",
    currentStatus: {},
    daysLeft: 0,
    denial: "<div class='preloader' style='margin: 0 auto;'></div>",
    fcfLocations: [],
    hasLocations: false,
    imagesLoading: true,
    prevImagesLoading: true,
    prevImagesLoaded: false,
    locations: [],
    percentageComplete: 0,
    photoCombineProgress: 0,
    photoProgress: 0,
    ReportingPeriodStatus: {
      LOADING: {
        threshold: null,
        color: "#044366",
        label: "loading",
        icon: "downloading",
      },
      AHEAD: {
        threshold: 2,
        color: "#009933",
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
    user: { display_name: "" },
    username: "",
    version: "",
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
    hasLocations({ state }) {
      return state.hasLocations;
    },
    imagesLoading({ state }) {
      return state.imagesLoading;
    },
    prevImagesLoading({ state }) {
      return state.prevImagesLoading;
    },
    prevImagesLoaded({ state }) {
      return state.prevImagesLoaded;
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
    percentageComplete({ state }) {
      return state.percentageComplete;
    },
    photoCombineProgress({ state }) {
      return state.photoCombineProgress;
    },
    photoProgress({ state }) {
      return state.photoProgress;
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
    reorderLocations({ state }, indexes) {
      let locations = state.locations;
      let itemMoved = locations[indexes.from];
      locations.splice(indexes.from, 1);
      locations.splice(indexes.to, 0, itemMoved);
      // debugger;
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

      // // get activity images in this reporting period
      // var d = new Date(start),
      //   month = "" + (d.getMonth() + 1),
      //   day = "" + d.getDate(),
      //   year = d.getFullYear();

      // if (month.length < 2) month = "0" + month;
      // if (day.length < 2) day = "0" + day;

      // let queryDate = [year, month, day].join("/");

      let groupedByMonths = [];

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

      let query = `?date[>=]=${queryDate}&status[!]=archived&sort=date DESC`;
      fetchJson(`${Api.urls.myActivityImages}${query}`, { method: "GET" })
        .then((result) => {
          state.activityImages = result.json.data;
          state.percentageComplete = (100 * daysElapsed) / startToEnd;
          state.activityImages.forEach((item, i) => {
            let itemMonth = new Date(item.date).getMonth();
            if (itemMonth == currentMonth) {
              if (item.status == "approved" || item.status == "ready") {
                totalApproved++;
              } else if (item.status == "new" || item.status == "updated") {
                totalNew++;
              }
              state.photoCombineProgress =
                ((totalApproved + totalNew) / targetImageCount) * 100;
              if (state.photoCombineProgress > 100) {
                state.photoCombineProgress = 100;
              }
              state.photoProgress = (totalApproved / targetImageCount) * 100;
              if (state.photoProgress > 100) {
                state.photoProgress = 100;
              }              
            }            

          });
          state.totalApproved = totalApproved;
          state.totalNew = totalNew;

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
          let monthSlot = 0;
          state.activityImages.forEach((item, i) => {
            let itemDate = new Date(item.date);
            let itemMonth = itemDate.toLocaleString("default", {
              month: "short",
            });
            let itemMonthLong = itemDate.toLocaleString("default", {
              month: "long",
            });
            let itemMonthIndex = itemDate.toLocaleString("default", {
              month: "2-digit",
            });
            let itemYear = itemDate.toLocaleString("default", {
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
            if (item.status == "approved" || item.status == "ready") {
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
            } else if (item.status == "new" || item.status == "updated") {
              groupedByMonths[monthSlot].new++;
            }
          });
          state.activityImages = groupedByMonths;

          state.imagesLoading = false;
          if (done) {
            done();
          }
        })
        .catch((err) => {
          // console.error("fetchJson failed");
        });
    },
    fetchPreviousQuarterImages({ state }, done) {
      // state.prevImagesLoading = true;
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
      // let totalApproved = 0;
      // let totalNew = 0;
      // let today = new Date();
      // let targetImageCount = 16;

      // let currentMonth = today.getMonth(today);
      // let currentYear = today.getFullYear(today);
      // let period = Math.floor(currentMonth / 4);

      // if (period == 0) {
      //   period = 3;
      //   currentYear = currentYear - 1;
      // } else {
      //   period = period - 1;
      // }

      // const start = new Date(currentYear, period * 4, 1);
      // const end = new Date(currentYear, period * 4 + 4, 1);

      // console.log("start; ", start);
      // console.log("end; ", end);

      // const daysElapsed = Math.ceil(
      //   today.getTime() / (1000 * 3600 * 24) -
      //     Math.ceil(start.getTime()) / (1000 * 3600 * 24)
      // );
      // const startToEnd = Math.ceil(
      //   end.getTime() / (1000 * 3600 * 24) -
      //     Math.ceil(start.getTime()) / (1000 * 3600 * 24)
      // );
      // state.daysLeft = Math.ceil(
      //   end.getTime() / (1000 * 3600 * 24) -
      //     Math.ceil(today.getTime()) / (1000 * 3600 * 24)
      // );
      // const proRataTargetImageCount = Math.floor(
      //   targetImageCount * (daysElapsed / startToEnd)
      // );

      // get activity images in this reporting period
      // var d = new Date(start),
      //   month = "" + (d.getMonth() + 1),
      //   day = "" + d.getDate(),
      //   year = d.getFullYear();

      // if (month.length < 2) month = "0" + month;
      // if (day.length < 2) day = "0" + day;

      // let queryDate = [year, month, day].join("/");

      // var d2 = new Date(end),
      //   month2 = "" + (d2.getMonth() + 1),
      //   day2 = "" + d2.getDate(),
      //   year2 = d2.getFullYear();

      // if (month2.length < 2) month2 = "0" + month2;
      // if (day2.length < 2) day2 = "0" + day2;

      // let queryDate2 = [year2, month2, day2].join("/");


      // console.log("queryDate: ", queryDate);
      // console.log("queryDate2: ", queryDate2);

      let groupedByMonthsPrevious = [];

      let threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 2);
      threeMonthsAgo.setDate(1);

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
      // let datesRule1 = {
      //   key: "589ca09c-9fc3-4433-8247-e8f99ab2b542",
      //   rule: "greater_or_equal",
      //   value: queryDate2,
      // };
      // let datesRule2 = {
      //   key: "589ca09c-9fc3-4433-8247-e8f99ab2b542",
      //   rule: "less",
      //   value: queryDate,
      // };
      // let wheres = { ...Api.urls.myActivityImages.where };

      // wheres.rules = wheres.rules.concat(datesRule1);
      // wheres.rules = wheres.rules.concat(datesRule2);

      console.log("queryDate: ", queryDate);
      console.log("queryDate2: ", queryDate2);


      let query = `?date[>=]=${queryDate2}&date[<]=${queryDate}&status[!]=archived&sort=date DESC`;
      fetchJson(`${Api.urls.myActivityImages}${query}`, { method: "GET" })
        .then((result) => {
          // state.activityImagesPrevious = result.json.data;
          console.log(result.json.data);

          let monthSlot = 0;
          result.json.data.forEach((item, i) => {
            let itemDate = new Date(item.date);
            let itemMonth = itemDate.toLocaleString("default", {
              month: "short",
            });
            let itemMonthLong = itemDate.toLocaleString("default", {
              month: "long",
            });
            let itemMonthIndex = itemDate.toLocaleString("default", {
              month: "2-digit",
            });
            let itemYear = itemDate.toLocaleString("default", {
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
            if (item.status == "approved" || item.status == "ready") {
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
            } else if (item.status == "new" || item.status == "updated") {
              groupedByMonthsPrevious[monthSlot].new++;
            }
          });
          state.activityImagesPrevious = groupedByMonthsPrevious;
          // state.percentageComplete = (100 * daysElapsed) / startToEnd;
          // state.activityImages.forEach((item, i) => {
          //   if (item.status == "approved" || item.status == "ready") {
          //     totalApproved++;
          //   } else if (item.status == "new" || item.status == "updated") {
          //     totalNew++;
          //   }
          //   state.photoCombineProgress =
          //     ((totalApproved + totalNew) / targetImageCount) * 100;
          //   if (state.photoCombineProgress > 100) {
          //     state.photoCombineProgress = 100;
          //   }
          //   state.photoProgress = (totalApproved / targetImageCount) * 100;
          //   if (state.photoProgress > 100) {
          //     state.photoProgress = 100;
          //   }
          // });
          // state.totalApproved = totalApproved;
          // state.totalNew = totalNew;

          // const diff = totalApproved - proRataTargetImageCount;

          // if (diff >= state.ReportingPeriodStatus.AHEAD.threshold) {
          //   state.currentStatus = state.ReportingPeriodStatus.AHEAD;
          // }
          // if (
          //   diff < state.ReportingPeriodStatus.AHEAD.threshold &&
          //   diff >= state.ReportingPeriodStatus.ONTRACK.threshold
          // ) {
          //   state.currentStatus = state.ReportingPeriodStatus.ONTRACK;
          // }
          // if (
          //   diff < state.ReportingPeriodStatus.ONTRACK.threshold &&
          //   diff >= state.ReportingPeriodStatus.BEHIND.threshold
          // ) {
          //   state.currentStatus = state.ReportingPeriodStatus.BEHIND;
          // }
          // if (diff < state.ReportingPeriodStatus.BEHIND.threshold) {
          //   state.currentStatus = state.ReportingPeriodStatus.WARNING;
          // }
          state.prevImagesLoading = false;
          state.prevImagesLoaded = true;
          console.log("state.prevImagesLoaded");
          console.log(state.prevImagesLoaded);
          if (done) {
            done();
          }
        })
        .catch((err) => {
          // console.error("fetchJson failed");
        });
    },
    getActivities({ state }, { minId }) {
      if (typeof minId == "string") {
        minId = parseInt(minId);
      }
      let currentActivities = [];
      let today = new Date();
      let ministry = state.teams.filter(
        (team) => team.IDMinistry == minId
      )[0];
      let allActivities = ministry?.activities || [];
      allActivities.forEach((item, i) => {
        let dateStart = new Date(item.date_start);
        let dateEnd = new Date(item.date_end);
        if (dateStart <= today) {
          if (dateEnd >= today || item.date_end == null) {
            currentActivities.push(item);
          }
        }
      });
      state.activities = currentActivities;
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
      fetchJson(`${Api.urls.locations}`, { method: "GET" })
        .then((result) => {
          state.fcfLocations = result.json.data;
        })
        .catch((e) => {
          // console.log(e);
        });
    },
    getLocations({ state }) {
      let locations = localStorage.getItem("locations");
      if (locations == null) {
        locations = [];
      } else {
        state.hasLocations = true;
        locations = JSON.parse(locations);
      }
      state.locations = locations;
    },
    getTeams({ state }) {
      fetchJson(`${Api.urls.myProjects}`, { method: "GET" })
        .then((result) => {
          let teams = [];
          result.json.data.forEach((project) => {
            teams = teams.concat(project.teams);
          });
          state.teams = teams;
        })
        .catch((e) => {
          // console.log(e);
        });
    },
    getTeamMembers({ state }) {
      fetchJson(`${Api.urls.myProjectsWithMembers}`, { method: "GET" })
        .then((result) => {
          let membersIds = [];
          result.json.data.projects.forEach((project) => {
            membersIds = membersIds.concat(project.memberIDs);
          });
          let uniqueMemberIds = [...new Set(membersIds)];
          let members = [];
          result.json.data.members.forEach((member) => {
            if (uniqueMemberIds.includes(member.IDPerson)) {
              members.push(member);
            }
          });
          state.teamMembers = members;
          // state.teamMembers = result.json.data.members;
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
      fetchJson(Api.urls.whoami, { method: "GET" })
        .then((res) => {
          state.user = res.json.data;
        })
        .catch(function (err) {
          app.f7.loginScreen.open("#my-login-screen");
        });
    },
    getUsername({ state }) {
      let username = localStorage.getItem("username");
      if (username == null) {
        username = "";
      }
      state.username = username;
    },
    getVersion({ state }) {
      state.version = app.f7.version;
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
    setUsername({ state }, username) {
      localStorage.setItem("username", username);
      state.username = username;
    },
    updateActivities({ state, dispatch }, { minId }) {
      fetchJson(`${Api.urls.myProjects}`, { method: "GET" })
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
