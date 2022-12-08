const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://adroit.fcfthailand.org"
    : "http://localhost:8010/proxy";

const Api = {
  urls: {
    base: BASE_URL,
    csrfToken: "/csrfToken",
    login: "/site/login",
    logout: "/site/logout",
    whoami: "/fcf_activities/activityreport/whoami",
    myProjects: "/fcf_activities/mobile/myprojects",
    myProjectsWithMembers: "/fcf_activities/mobile/myprojectmembers",
    myActivityImages: `/fcf_activities/mobile/myactivityimages`,
    activityImageUpload: "/fcf_activities/activityimageupload",
    createActivityImage: "/fcf_activities/activityimage/create",
    updateActivityImage: activityImageId =>
      `/fcf_activities/activityimage/update/${activityImageId}`,
    locations: "/fcf_core/fcflocation",
    teamObjectives: teamId => `/fcf_activities/teamobjectives?team=${teamId}`,
    createActivity: "/fcfactivities/teamactivities",
    getDenial: activityImageId =>
      `/fcf_activities/getdenial?id=${activityImageId}`,
    version: "/pwa/version.txt"
    // myTeams: '/fcf_activities/mobile/myteams',
    // listUserTeams: '/fcf_activities/userteam/find',
    // teamActivities: teamId => `/fcfactivities/teamactivities?team=${teamId}`
    // activityImages: activityId => `/fcf_activities/activityimage?activity=${activityId}`,
    // teamMembers: teamId => `/fcf_activities/teammembers?teamID=${teamId}`,
  },

  absoluteUrl: relativeUrl => `${BASE_URL}${relativeUrl}`
};

export default Api;
