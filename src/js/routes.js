import HomePage from "../pages/home.f7";
import HelpPage from "../pages/help.f7";
import FeedbackPage from "../pages/feedback.f7";
import FormPage from "../pages/form.f7";
import ActivityImagePage from "../pages/activity-image.f7";
import LocationsPage from "../pages/locations.f7";
import AddActivityPage from "../pages/add-activity.f7";

import DynamicRoutePage from "../pages/dynamic-route.f7";
import RequestAndLoad from "../pages/request-and-load.f7";
import NotFoundPage from "../pages/404.f7";

var routes = [
  {
    path: "/",
    component: HomePage
  },
  {
    path: "/help/",
    component: HelpPage
  },
  {
    path: "/feedback/",
    component: FeedbackPage
  },
  {
    path: "/form/",
    component: FormPage
  },

  {
    path: "/dynamic-route/blog/:blogId/post/:postId/",
    component: DynamicRoutePage
  },
  {
    path: "/activity-image/add/",
    component: ActivityImagePage
  },
  {
    path: "/activity-image/edit/",
    component: ActivityImagePage
  },
  {
    path: "/locations/",
    component: LocationsPage
  },
  {
    path: "/add-activity/",
    component: AddActivityPage
  },
  {
    path: "/request-and-load/user/:userId/",
    async: function({ router, to, resolve }) {
      // App instance
      var app = router.app;

      // Show Preloader
      app.preloader.show();

      // User ID from request
      var userId = to.params.userId;

      // Simulate Ajax Request
      setTimeout(function() {
        // We got user data from request
        var user = {
          firstName: "Vladimir",
          lastName: "Kharlampidi",
          about: "Hello, i am creator of Framework7! Hope you like it!",
          links: [
            {
              title: "Framework7 Website",
              url: "http://framework7.io"
            },
            {
              title: "Framework7 Forum",
              url: "http://forum.framework7.io"
            }
          ]
        };
        // Hide Preloader
        app.preloader.hide();

        // Resolve route to load page
        resolve(
          {
            component: RequestAndLoad
          },
          {
            props: {
              user: user
            }
          }
        );
      }, 1000);
    }
  },
  {
    path: "(.*)",
    component: NotFoundPage
  }
];

export default routes;
