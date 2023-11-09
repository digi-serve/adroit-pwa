import { createStore } from "framework7";
import Api from "/js/api.js";
import fetchJson from "/js/fetch.js";

function parse(records) {
  let theseRecords = JSON.parse(JSON.stringify(records));
  let translated;
  if (theseRecords.forEach) {
    let records = [];
    theseRecords.forEach((record) => {
      records.push(parse(record));
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
        theseRecords[propt] = parse(theseRecords[propt]);
      } else if (propt == "translations") {
        theseRecords = translate(theseRecords);
      }
    }
  }
  console.log(theseRecords);
  return theseRecords;
}

function translate(record) {
  if (!record?.translations) return record;
  let translated;

  record.translations.forEach((trans) => {
    if (trans.language_code == "en") {
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
    csrftoken: "",
    currentStatus: {},
    daysLeft: 0,
    denial: "<div class='preloader' style='margin: 0 auto;'></div>",
    fcfLocations: [],
    hasLocations: false,
    imagesLoading: true,
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
    user: { "Full Name": "" },
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

      let query = `&date[>=]=${queryDate}&status[!]=Archived&sort=Date of Activity DESC`;
      fetchJson(
        `${Api.urls.myActivityImages.url}&where=${JSON.stringify(
          Api.urls.myActivityImages.where
        )}`,
        { method: "GET" }
      )
        .then((result) => {
          let data = parse(result.json.data.data);
          state.activityImages = data;
          state.percentageComplete = (100 * daysElapsed) / startToEnd;
          state.activityImages.forEach((item, i) => {
            if (item.Status == "Approved" || item.Status == "Ready") {
              totalApproved++;
            } else if (item.Status == "New" || item.Status == "Updated") {
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
        .catch((err) => {
          // console.error("fetchJson failed");
        });
    },
    getActivities({ state }) {
      fetchJson(
        `${Api.urls.myActivities.url}?where=${JSON.stringify(
          Api.urls.myActivities.where
        )}`,
        {
          method: "GET",
        }
      )
        .then((res) => {
          // map translations
          let activities = [];
          res.json.data.data.forEach((activity) => {
            activity.translations.forEach((trans) => {
              if (trans.language_code == "en") {
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
      // let currentActivities = [];
      // let today = new Date();
      // let allActivities = state.teams.filter(
      //   (team) => team.IDMinistry == minId
      // )[0].activities;
      // allActivities.forEach((item, i) => {
      //   let dateStart = new Date(item.date_start);
      //   let dateEnd = new Date(item.date_end);
      //   if (dateStart <= today) {
      //     if (dateEnd >= today || item.date_end == null) {
      //       currentActivities.push(item);
      //     }
      //   }
      // });
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
          state.fcfLocations = result.json.data.data;
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
      if (!state?.user?.uuid) return false;

      fetchJson(
        `${Api.urls.myAssignments(state.user.uuid).url}?where=${JSON.stringify(
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
            `${Api.urls.myTeams(state.user.uuid).url}?where=${JSON.stringify(
              wheres
            )}`,
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
                }?where=${JSON.stringify(
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
                    `${Api.urls.assignments().url}?where=${JSON.stringify(
                      wheres
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
                          Api.urls.myProjectsWithMembers(res["Person"]).where
                        );
                      });
                      fetchJson(
                        `${
                          Api.urls.myProjectsWithMembers().url
                        }?where=${JSON.stringify(wheres)}`,
                        { method: "GET" }
                      )
                        .then((result) => {
                          state.teamMembers = result.json.data.data;
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
    // getTeamMembers({ state }) {
    //   if (!state?.teams) return false;

    //   fetchJson(`${Api.urls.myProjectsWithMembers}`, { method: "GET" })
    //     .then((result) => {
    //       let membersIds = [];
    //       result.json.data.projects.forEach((project) => {
    //         membersIds = membersIds.concat(project.memberIDs);
    //       });
    //       let uniqueMemberIds = [...new Set(membersIds)];
    //       let members = [];
    //       result.json.data.members.forEach((member) => {
    //         if (uniqueMemberIds.includes(member.IDPerson)) {
    //           members.push(member);
    //         }
    //       });
    //       state.teamMembers = members;
    //       // state.teamMembers = result.json.data.members;
    //     })
    //     .catch((e) => {
    //       // console.log(e);
    //     });
    // },
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
        `${Api.urls.whoami.url}?where=${JSON.stringify(Api.urls.whoami.where)}`,
        {
          method: "GET",
        }
      )
        .then((res) => {
          console.log("you are logged in already");
          state.user = res.json.data.data[0];
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
    setUser({ state }, user) {
      state.user = user;
    },
    setUsername({ state }, username) {
      localStorage.setItem("username", username);
      state.username = username;
    },
    updateActivities({ state, dispatch }, { minId }) {
      fetchJson(
        `${Api.urls.myTeams.url}?where=${JSON.stringify(
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
