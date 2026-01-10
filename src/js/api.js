const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://apps.fcfthailand.org"
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
    switcheroo: (user) => {
      return {
        url: `/auth/switcheroo/${user}`,
      };
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
    myTeamMembers: {
      url: "/app_builder/model/82df020c-695d-4360-8112-567a2f664569",
      where: {
        glue: "and",
        rules: [
          {
            key: "c95e2352-9289-4187-aec3-3c41660aba5e",
            rule: "in_query",
            value: "966d11df-18ca-4b88-84ff-634f64dd92ab",
          },
          {
            key: "2197bd50-80f9-470f-9010-48b5ab73da89",
            rule: "equals",
            value: "Active",
          },
          {
            key: "74329030-8405-4876-8a55-ba6fbf5384b2",
            rule: "equals",
            value: "Volunteer",
          },
        ],
      },
      sort: [{ key: "ae590415-64e1-43f5-bba4-ff0827866d96", dir: "asc" }],
    },
    fcfVolunteers: {
      url: "/app_builder/model/82df020c-695d-4360-8112-567a2f664569",
      where: {
        glue: "and",
        rules: [
          {
            key: "2197bd50-80f9-470f-9010-48b5ab73da89",
            rule: "equals",
            value: "Active",
          },
          {
            key: "74329030-8405-4876-8a55-ba6fbf5384b2",
            rule: "equals",
            value: "Volunteer",
          },
        ],
      },
      sort: [{ key: "ae590415-64e1-43f5-bba4-ff0827866d96", dir: "asc" }],
    },
    myProjects: {
      url: "/app_builder/model/55530a46-3b77-4b22-8221-bf52a68c6cbc",
      where: {
        glue: "and",
        rules: [
          {
            key: "this_object",
            rule: "in_query",
            value: "4bb0ecb5-e326-49b1-bb44-25c63dccf01d",
          },
        ],
      },
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
            glue: "or",
            rules: [
              {
                key: "User",
                rule: "is_current_user",
                value: "",
              },
              {
                key: "cb896557-033b-4a7c-b6d8-744bb0c422f3",
                rule: "in_query",
                value: "4bb0ecb5-e326-49b1-bb44-25c63dccf01d",
              },
            ],
          },
        ],
      },
    },
    getApprovals: {
      url: "/app_builder/model/4d6af935-ccb5-454e-9aab-ab4793beaf14?populate=true",
      where: {
        glue: "and",
        rules: [
          {
            key: "cb896557-033b-4a7c-b6d8-744bb0c422f3",
            rule: "in_query",
            value: "54aaec34-60b6-48a8-a4b3-8b9e97473517",
          },
          {
            glue: "or",
            rules: [
              {
                key: "bd44b6eb-3427-4a20-a1c7-a9a9faee5957",
                rule: "equals",
                value: "New",
              },
              {
                key: "bd44b6eb-3427-4a20-a1c7-a9a9faee5957",
                rule: "equals",
                value: "Updated",
              },
            ],
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
    captions: (activityId) => {
      return {
        url: "/app_builder/model/275d172a-3091-405b-a447-e49b7751b58c?populate=true&skipPack=true",
        where: {
          glue: "and",
          rules: [
            {
              key: "8a5ecc3a-9b78-41c5-8024-896d82d9e226",
              rule: "equals",
              value: activityId,
            },
          ],
        },
      };
    },
    activityImageUpload:
      "/file/upload/4d6af935-ccb5-454e-9aab-ab4793beaf14/5161a8e5-69b2-4841-ae20-68ef66b58936/1",
    createActivityImage:
      "/app_builder/model/4d6af935-ccb5-454e-9aab-ab4793beaf14",
    updateActivityImage: (activityImageId) =>
      `/app_builder/model/4d6af935-ccb5-454e-9aab-ab4793beaf14/${activityImageId}`,
    updateProfilePhoto: (userId) =>
      `/app_builder/model/82df020c-695d-4360-8112-567a2f664569/${userId}`,
    createLocation: "/app_builder/model/b4c969f8-31e1-4993-9e34-2370068449be",
    locations: {
      url: "/app_builder/model/b4c969f8-31e1-4993-9e34-2370068449be",
      where: {
        glue: "and",
        rules: [
          {
            key: "Creator",
            rule: "equals",
            value: "admin",
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
    teamObjectives: (teamId) =>
      `/fcf_activities/teamobjectives?team=${teamId}&skpPack=true`,
    createActivity: "/app_builder/model/3ad8d8ad-c06a-46b5-bd7d-c643818a864d",
    getDenial: (activityImageId) =>
      `/fcf_activities/getdenial?id=${activityImageId}&skipPack=true`,
    version: "/pwa/version.txt",
    profilePhoto: "/data/db80e601-2da2-4026-b32e-36580f3c9318/file_processor/",
    forgotPassword: "/auth/login/reset",
    // myTeams: '/fcf_activities/mobile/myteams',
    // listUserTeams: '/fcf_activities/userteam/find',
    // teamActivities: teamId => `/fcfactivities/teamactivities?team=${teamId}`
    // activityImages: activityId => `/fcf_activities/activityimage?activity=${activityId}`,
    // teamMembers: teamId => `/fcf_activities/teammembers?teamID=${teamId}`,
  },

  absoluteUrl: (relativeUrl) => `${BASE_URL}${relativeUrl}`,
};

export default Api;
