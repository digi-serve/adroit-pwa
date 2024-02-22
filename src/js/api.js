const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://adroit.fcfthailand.org"
    : "http://localhost:8010/proxy";

const Api = {
  urls: {
    base: BASE_URL,
    csrfToken: "/csrfToken",
    login: "/auth/login",
    logout: "/auth/logout",
    whoami: {
      url: "/app_builder/model/82df020c-695d-4360-8112-567a2f664569",
      where: {
        glue: "and",
        rules: [
          {
            key: "Owner User",
            rule: "is_current_user",
            value: "",
          },
        ],
      },
    },
    assignments: (teamId) => {
      return {
        url: "/app_builder/model/24079188-f87b-4970-82fe-293b9e7b7f4d",
        where: {
          glue: "and",
          rules: [
            {
              key: "Project Team Name",
              rule: "equals",
              value: teamId,
            },
          ],
        },
      };
    },
    myAssignments: (personId) => {
      return {
        url: "/app_builder/model/24079188-f87b-4970-82fe-293b9e7b7f4d",
        where: {
          glue: "and",
          rules: [
            {
              key: "Person",
              rule: "equals",
              value: personId,
            },
          ],
        },
      };
    },
    myTeams: (teamId) => {
      return {
        url: "/app_builder/model/ef994422-1eb4-44a7-9b24-520c83d2275f",
        where: {
          glue: "and",
          rules: [
            {
              key: "uuid",
              rule: "equals",
              value: teamId,
            },
          ],
        },
      };
    },
    myProjectsWithMembers: (profileId) => {
      return {
        url: "/app_builder/model/82df020c-695d-4360-8112-567a2f664569",
        where: {
          glue: "and",
          rules: [
            {
              key: "uuid",
              rule: "equals",
              value: profileId,
            },
          ],
        },
      };
    },
    myActivityImages: {
      url: "/app_builder/model/4d6af935-ccb5-454e-9aab-ab4793beaf14?populate=true",
      where: {
        glue: "and",
        rules: [
          {
            key: "bd44b6eb-3427-4a20-a1c7-a9a9faee5957",
            rule: "not_equal",
            value: "Archived",
          },
          {
            key: "User",
            rule: "is_current_user",
            value: "",
          },
        ],
      },
    },
    myActivities: {
      url: "/app_builder/model/3ad8d8ad-c06a-46b5-bd7d-c643818a864d",
      where: {
        glue: "and",
        rules: [
          {
            key: "ea21dea0-4b16-4c01-b9a8-2fa6758fa36a",
            rule: "in_query",
            value: "966d11df-18ca-4b88-84ff-634f64dd92ab",
          },
        ],
      },
    },
    activityImageUpload:
      "/file/upload/4d6af935-ccb5-454e-9aab-ab4793beaf14/5161a8e5-69b2-4841-ae20-68ef66b58936/1",
    createActivityImage:
      "/app_builder/model/4d6af935-ccb5-454e-9aab-ab4793beaf14",
    updateActivityImage: (activityImageId) =>
      `/app_builder/model/4d6af935-ccb5-454e-9aab-ab4793beaf14/${activityImageId}`,
    createLocation: "/app_builder/model/b4c969f8-31e1-4993-9e34-2370068449be",
    locations: {
      url: "/app_builder/model/b4c969f8-31e1-4993-9e34-2370068449be",
      where: {
        glue: "and",
        rules: [
          {
            key: "Creator",
            rule: "is_null",
            value: "",
          },
        ],
      },
    },
    myLocations: {
      url: "/app_builder/model/b4c969f8-31e1-4993-9e34-2370068449be",
      where: {
        glue: "and",
        rules: [
          {
            key: "Creator",
            rule: "is_current_user",
            value: "",
          },
        ],
      },
    },
    teamObjectives: (teamId) => `/fcf_activities/teamobjectives?team=${teamId}`,
    createActivity: "/fcfactivities/teamactivities",
    getDenial: (activityImageId) =>
      `/fcf_activities/getdenial?id=${activityImageId}`,
    version: "/pwa/version.txt",
    profilePhoto: "/data/db80e601-2da2-4026-b32e-36580f3c9318/file_processor/",
    // myTeams: '/fcf_activities/mobile/myteams',
    // listUserTeams: '/fcf_activities/userteam/find',
    // teamActivities: teamId => `/fcfactivities/teamactivities?team=${teamId}`
    // activityImages: activityId => `/fcf_activities/activityimage?activity=${activityId}`,
    // teamMembers: teamId => `/fcf_activities/teammembers?teamID=${teamId}`,
  },

  absoluteUrl: (relativeUrl) => `${BASE_URL}${relativeUrl}`,
};

export default Api;
