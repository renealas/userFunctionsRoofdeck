/* eslint-disable max-len */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const randomstring = require("randomstring");

admin.initializeApp({
  storageBucket: "realstatestb-ad581.appspot.com",
});

// Funcion que crea usuarios basada en su provider.

exports.newUserSignup = functions.auth.user().onCreate((user) => {
  const provid = user.providerData[0].providerId;
  switch (provid) {
    case "facebook.com": {
      let username;
      const tokens = user.displayName.split(" ");
      const nameLength = tokens.length;
      if (nameLength > 1) {
        username = tokens[0] + randomstring.generate(12) + tokens[1];
      } else {
        username = tokens[0] + randomstring.generate(17);
      }
      return admin.firestore().collection("users").doc(user.uid).set({
        "username": username,
        "email": user.email,
        "image_url": user.photoURL,
        "name": user.displayName,
        "phone": 0,
        "listings": [],
        "token": "n/a",
        "verified": false,
        "onlineStatus": false,
        "webAccess": false,
      });
    }
    case "google.com": {
      let username;
      const tokens = user.displayName.split(" ");
      const nameLength = tokens.length;

      if (nameLength > 1) {
        username = tokens[0] + randomstring.generate(12) + tokens[1];
      } else {
        username = tokens[0] + randomstring.generate(17);
      }
      return admin.firestore().collection("users").doc(user.uid).set({
        "username": username,
        "email": user.email,
        "image_url": user.photoURL,
        "name": user.displayName,
        "phone": 0,
        "listings": [],
        "token": "n/a",
        "verified": false,
        "onlineStatus": false,
        "webAccess": false,
      });
    }
    // Se elimina la funcion de Apple, ya que para hacer la actualizacion
    // de la informacion no se cuenta con el nombre asi que esta si se hara
    // desde el telefono

    // case "apple.com": {
    //   return admin.firestore().collection("users").doc(user.uid).set({
    //     "username": null,
    //     "email": user.email,
    //     "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/647px-Apple_logo_black.svg.png",
    //     "name": null,
    //   });
    // }
    case "password": {
      return admin.firestore().collection("users").doc(user.uid).set({
        "username": null,
        "email": user.email,
        "image_url": null,
        "name": null,
        "phone": 0,
      });
    }
    default: {
      return;
    }
  }
});

// Funcion que borra la info del Usuario cuando es borrado de Firebase.
exports.userDeleted = functions.auth.user().onDelete((user) => {
  const doc = admin.firestore().collection("users").doc(user.uid);
  return doc.delete();
});

// Funcion que la imagen del usuario cuando es borrado de Firebase.
exports.userImageDeleted = functions.auth.user().onDelete((user) => {
  const defaultBucket = admin.storage().bucket();
  const img = defaultBucket.file("user_images/" + user.uid + ".jpg");
  return img.delete();
});

// Function que elimina imagenes de un Listing cuando es borrado de Firebase.
exports.listingImagesDelete = functions.firestore.document("listings/{listingId}").onDelete(async (snapshot, context) => {
  const listingId = snapshot.id;

  const bucket = admin.storage().bucket(); // [PROJECT_ID].appspot.com is default bucket

  return await bucket.deleteFiles({
    prefix: "ListingImages/" + listingId,
  }, function(err) {
    if (err) {
      console.log(`Delete Images of Listing Error: ${err}`);
    } else {
      console.log(`All the Firebase Storage files in ListingImages/${listingId}/ have been deleted`);
    }
  });
});
