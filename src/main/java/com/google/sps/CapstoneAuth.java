package com.google.sps;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Arrays;

import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.KeyFactory;

import com.google.auth.oauth2.GoogleCredentials;

public final class CapstoneAuth {

    private static CapstoneAuth currentInstance;
    private DatastoreService datastoreService;

    private CapstoneAuth() {
        try {
            InputStream credentialInputStream = getClass().getResourceAsStream(
                "/chap-2020-capstone-firebase-adminsdk-93l38-698b686069.json");

            FirebaseOptions options = new FirebaseOptions.Builder()
                .setCredentials(
                    GoogleCredentials.fromStream(credentialInputStream))
                .setDatabaseUrl("https://chap-2020-capstone.firebaseio.com/")
                .build();

            FirebaseApp.initializeApp(options);

            datastoreService = DatastoreServiceFactory.getDatastoreService();

            addTestChatroom();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    // To remove method on deploy
    private void addTestChatroom() {
        Entity chatRoom = new Entity("CHAT_ROOM","1234goroom");
        datastoreService.put(chatRoom);
    }

    // To remove method on deploy
    private void addUserToTestChatroom(String uid) {
        try {
            Entity testRoom = datastoreService.get(
                KeyFactory.createKey("CHAT_ROOM", "1234goroom"));

            if (!testRoom.hasProperty("allowed_users")) {
                testRoom.setProperty("allowed_users", Arrays.asList(uid));
                datastoreService.put(testRoom);

                return;
            }

            List<String> allowedUsers =
                (List<String>) testRoom.getProperty("allowed_users");
            allowedUsers.add(uid);
            testRoom.setProperty("allowed_users", allowedUsers);
            datastoreService.put(testRoom);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static String getUserId(String idToken) {
        if (currentInstance == null) {
            currentInstance = new CapstoneAuth();
        }

        try {
            FirebaseToken decodedToken =
                FirebaseAuth.getInstance().verifyIdToken(idToken);

            return decodedToken.getUid();
        } catch (FirebaseAuthException e) {
            e.printStackTrace();
        }

        return null;
    }

    public static boolean isUserAuthenticated(String idToken) {
        if (currentInstance == null) {
            currentInstance = new CapstoneAuth();
        }

        try {
            FirebaseToken decodedToken =
                FirebaseAuth.getInstance().verifyIdToken(idToken);
            String uid = decodedToken.getUid();

            currentInstance.addUserToTestChatroom(uid);

            return (uid != null);
        } catch (FirebaseAuthException e) {
            e.printStackTrace();
        }
        return false;
    }

    public static boolean isUserChatroomAuthenticated(String chatRoom,
            String idToken) {
        if (currentInstance == null) {
            currentInstance = new CapstoneAuth();
        }

        try {
            FirebaseToken decodedToken =
                FirebaseAuth.getInstance().verifyIdToken(idToken);
            String uid = decodedToken.getUid();

            Entity roomEntity = currentInstance.datastoreService.get(
                KeyFactory.createKey("CHAT_ROOM",chatRoom));

            List<String> allowedRoomUID =
                (List<String>) roomEntity.getProperty("allowed_users");

            return allowedRoomUID.contains(uid);
        } catch (Exception e) {
            e.printStackTrace();
        }

        return false;
    }
}
