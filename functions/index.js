const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const {google} = require("googleapis");

admin.initializeApp();

const oauth2Client = new google.auth.OAuth2(
    "404706889743-jklsnfr3ndeirtktv2d62rb0l" +
    "ff8v2hh.apps.googleusercontent.com",
    "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",
    "https://developers.google.com/oauthplayground",
);

oauth2Client.setCredentials({
  refresh_token: "1//04WOQoKNch9uBCgYIARAAGAQSNw" +
  "F-L9IrY6EHNuD23-9NWrCfAw4vNqai7pktLUKDZvGqD8" +
  "3KkhpkHeBOeyXV_InotBhblXxdI3o",
});

// const refreshAccessToken = async () => {
//   try {
//     console.log("Attempting to refresh access token...");
//     const {token} = await oauth2Client.getAccessToken();
//     console.log("Refreshed token:", token);
//     return token;
//   } catch (error) {
//     console.error("Error refreshing access token", error);
//     throw new Error("Failed to refresh access token");
//   }
// };

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: "ecothreads1234@gmail.com",
    clientId: "404706889743-jklsnfr3ndeirtktv2d62rb0l" +
    "ff8v2hh.apps.googleusercontent.com",
    clientSecret: "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",
    refreshToken: "1//04WOQoKNch9uBCgYIARAAGAQSNw" +
    "F-L9IrY6EHNuD23-9NWrCfAw4vNqai7pktLUKDZvGqD8" +
    "3KkhpkHeBOeyXV_InotBhblXxdI3o",
    accessToken: "ya29.a0AfB_byDMGiYrJLxbGMQt" +
    "JVdpU_RNFksNp0MNM4lPDOeb79C7dwhQVpUhO7vznflmQ9a" +
    "CctbrtpblgBsePlWEBGG4Sy_YPoRHbHjYTIFUmOwxZkl8rGY" +
    "85WRqVE0-X7zZD1MuuBiTYRGfFQBJf075t5SCPsYnY1bXb9" +
    "O2aCgYKAbESARASFQHGX2MiE7EAQjQi3CyG0dwlkDwIdw0171",
  },
});

// transporter.set("oauth2_provision_cb", (user, renew, callback) => {
//   refreshAccessToken().then((newToken) => {
//     console.log(newToken);
//     return callback(null, newToken);
//   }).catch((error) => {
//     console.log(error);
//     return callback(error, null);
//   });
// });

exports.sendEmailConfirmation = functions.firestore
    .document("events/{eventId}")
    .onUpdate(async (change, context) => {
      console.log("Function triggered with change: ", change);
      const eventData = change.after.data();
      const previousEventData = change.before.data();
      const newRegistrations =
      (eventData.registered instanceof Array ? eventData.registered : [])
          .filter((uid) =>
            !(previousEventData.registered instanceof Array) ||
            !previousEventData.registered.includes(uid));

      for (const uid of newRegistrations) {
        const userRef = admin.firestore().collection("accounts").doc(uid);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
          const user = userDoc.data();
          const mailOptions = {
            from: "ecothreads1234@gmail.com",
            to: user.email,
            subject: `Registration for ${eventData.eventName}`,
            text: `You have been registered for ${eventData.eventName}`,
            html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Event Registration Confirmation</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                    }
                    .container {
                        max-width: 600px;
                        margin: 20px auto;
                        padding: 20px;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                        background: #ffffff;
                    }
                    .header {
                        background: #f4f4f4;
                        padding: 10px;
                        text-align: center;
                        border-radius: 5px 5px 0 0;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>Event Registration Confirmation</h2>
                    </div>
                    <p>Dear ${user.name},</p>
                    <p>We are excited to confirm your registration for
                    <strong>${eventData.eventName}</strong>!</p>
                    <p>Here are the details of the event:</p>
                    <ul>
                        <li>Date: ${eventData.eventStartDate} -
                         ${eventData.eventEndDate}</li>
                        <li>Location: ${eventData.eventVenue}</li>
                    </ul>
                    <p>Please arrive at least 15 minutes early to 
                    complete the check-in process. Bring this email 
                    confirmation with you, either printed or on your
                     mobile device.</p>
                    <p>We look forward to seeing you there!</p>
                    <p>Best regards,</p>
                    <p>EcoThreads</p>
                </div>
            </body>
            </html>
        `,
            // auth: {
            //   user: "ecothreads1234@gmail.com",
            //   accessToken: await refreshAccessToken(),
            // },
          };
          console.log("About to send email...");
          try {
            const result = await transporter.sendMail(mailOptions);
            console.log("Email sent", result);
          } catch (error) {
            console.error("Error sending mail:", error);
          }
        }
      }
    });

exports.storePointsUpdate = functions.firestore
    .document("leaderboards/{leaderboardId}/Users/{userId}")
    .onUpdate(async (change, context) => {
      const {leaderboardId, userId} = context.params;

      const newData = change.after.data();
      const previousData = change.before.data();

      if (newData.points !== previousData.points) {
        const pointsHistoryRef = change.after.ref.collection("pointsHistory");

        try {
          await pointsHistoryRef.add({
            points: newData.points,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
          });
          console.log(`Points history updated for ` +
            `user ${userId} in leaderboard ${leaderboardId}`);
        } catch (error) {
          console.error("Error updating points history:", error);
        }
      }
    });
