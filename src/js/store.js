import { createStore } from "framework7";
import Api from "/js/api.js";
import fetchJson from "/js/fetch.js";

const store = createStore({
  state: {
    activities: [],
    csrftoken: "",
    currentStatus: {},
    denial: "<div class='preloader' style='margin: 0 auto;'></div>",
    fcfLocations: [],
    hasLocations: false,
    locations: [],
    teamMembers: [],
    teams: [],
    totalApproved: 0,
    daysLeft: 0,
    totalNew: 0,
    imagesLoading: true,
    photoProgress: 0,
    photoCombineProgress: 0,
    percentageComplete: 0,
    activityImages: [],
    teamObjectives: [],
    user: { display_name: "" },
    ReportingPeriodStatus: {
      LOADING: {
        threshold: null,
        color: "#044366",
        label: "loading",
        icon: "downloading"
      },
      AHEAD: {
        threshold: 2,
        color: "#009933",
        label: "ahead",
        icon: "sentiment_very_satisfied"
      },
      ONTRACK: {
        threshold: -1,
        color: "#07bb8f",
        label: "on track",
        icon: "sentiment_satisfied"
      },
      BEHIND: {
        threshold: -3,
        color: "#ff6633",
        label: "behind",
        icon: "sentiment_dissatisfied"
      },
      WARNING: {
        threshold: -5,
        color: "#cc3333",
        label: "warning",
        icon: "sentiment_very_dissatisfied"
      }
    }
  },
  getters: {
    activities({ state }) {
      return state.activities;
    },
    activityImages({ state }) {
      return state.activityImages;
    },
    currentStatus({ state }) {
      return state.currentStatus;
    },
    denial({ state }) {
      return state.denial;
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
    fcfLocations({ state }) {
      return state.fcfLocations;
    },
    csrfToken({ state }) {
      return state.csrftoken;
    },
    hasLocations({ state }) {
      return state.hasLocations;
    },
    daysLeft({ state }) {
      return state.daysLeft;
    },
    imagesLoading({ state }) {
      return state.imagesLoading;
    },
    photoProgress({ state }) {
      return state.photoProgress;
    },
    photoCombineProgress({ state }) {
      return state.photoCombineProgress;
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
    percentageComplete({ state }) {
      return state.percentageComplete;
    },
    user({ state }) {
      return state.user;
    }
  },
  actions: {
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
    resetDenial({ state }, activityId) {
      state.denial = "<div class='preloader' style='margin: 0 auto;'></div>";
    },
    getDenial({ state }, activityId) {
      fetchJson(`${Api.urls.getDenial(activityId)}`, { method: "GET" }).then(
        result => {
          let warningIcon = "<i class='large-icon material-icons'>warning</i>";
          state.denial = warningIcon + result.json.data;
        }
      );
    },
    getFCFLocations({ state }) {
      fetchJson(`${Api.urls.locations}`, { method: "GET" }).then(result => {
        state.fcfLocations = result.json.data;
      });
    },
    getTeams({ state }) {
      fetchJson(`${Api.urls.myProjects}`, { method: "GET" }).then(result => {
        state.teams = result.json.data[0].teams;
      });
    },
    getTeamMembers({ state }) {
      fetchJson(`${Api.urls.myProjectsWithMembers}`, { method: "GET" }).then(
        result => {
          state.teamMembers = result.json.data.members;
        }
      );
    },
    getTeamObjectives({ state }, teamId) {
      fetchJson(`${Api.urls.teamObjectives(teamId)}`, { method: "GET" }).then(
        result => {
          state.teamObjectives = result.json.data;
        }
      );
    },
    getActivities({ state }, { minId }) {
      let currentActivities = [];
      let today = new Date();
      let allActivities = state.teams.filter(
        team => team.IDMinistry == minId
      )[0].activities;
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
    getUser({ state }) {
      fetchJson(Api.urls.whoami, { method: "GET" })
        .then(res => {
          state.user = res.json.data;
        })
        .catch(function(err) {
          app.f7.loginScreen.open("#my-login-screen");
        });
    },
    updateActivities({ state, dispatch }, { minId }) {
      fetchJson(`${Api.urls.myProjects}`, { method: "GET" }).then(result => {
        state.teams = result.json.data[0].teams;
        dispatch("getActivities", { minId: minId });
      });
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
    hasLocations({ state }) {
      if (state.locations.length) {
        state.hasLocations = true;
      } else {
        state.hasLocations = false;
      }
    },
    getToken({ state }) {
      let csrftoken = localStorage.getItem("csrftoken");
      state.csrftoken = csrftoken;
    },
    addCsrfToken({ state }, token) {
      localStorage.setItem("csrftoken", token);
      state.csrftoken = token;
    },
    fetchImages({ state }, done) {
      if (!navigator.onLine) {
        done();
        let toastWithButton = app.f7.toast
          .create({
            icon: '<i class="material-icons">wifi_off</i>',
            text: "No connection",
            position: "center",
            closeTimeout: 3000
          })
          .open();
        return false;
      }
      let totalApproved = 0;
      let totalNew = 0;
      let today = new Date();
      let targetImageCount = 16;

      const currentMonth = today.getMonth(today);
      const currentYear = today.getFullYear(today);
      const period = Math.floor(currentMonth / 4);
      const start = new Date(currentYear, period * 4, 1);
      const end = new Date(currentYear, period * 4 + 4, 1);

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

      // get activity images in this reporting period
      var d = new Date(start),
        month = "" + (d.getMonth() + 1),
        day = "" + d.getDate(),
        year = d.getFullYear();

      if (month.length < 2) month = "0" + month;
      if (day.length < 2) day = "0" + day;

      let queryDate = [year, month, day].join("/");

      let query = `?date[>=]=${queryDate}&sort=date DESC`;
      fetchJson(`${Api.urls.myActivityImages}${query}`, { method: "GET" })
        .then(result => {
          state.activityImages = result.json.data;
          state.percentageComplete = (100 * daysElapsed) / startToEnd;
          state.activityImages.forEach((item, i) => {
            if (item.status == "approved" || item.status == "ready") {
              totalApproved++;
            } else if (item.status == "new") {
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
          state.imagesLoading = false;
          if (done) {
            done();
          }
        })
        .catch(err => {
          console.error("fetchJson failed");
        });
    }
  }
});
export default store;