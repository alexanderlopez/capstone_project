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
import com.google.cloud.datastore.Datastore;
import com.google.cloud.datastore.DatastoreOptions;
import com.google.cloud.datastore.Entity;
import com.google.cloud.datastore.KeyFactory;
import com.google.cloud.datastore.ListValue;
import com.google.cloud.datastore.StringValue;
import com.google.cloud.datastore.Value;

import com.google.auth.oauth2.GoogleCredentials;

public final class CapstoneAuth {

    private static CapstoneAuth currentInstance;

    private final Datastore datastore;
    private final KeyFactory keyFactory;

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
        } catch (IOException e) {
            e.printStackTrace();
        }

        datastore = DatastoreOptions.getDefaultInstance().getService();
        keyFactory = datastore.newKeyFactory().setKind("CHAT_ROOM");

        addTestChatroom();
    }

    // To remove method on deploy
    private void addTestChatroom() {
        Entity chatRoom = Entity.newBuilder(keyFactory.newKey("1234goroom"))
                                .build();
        datastore.put(chatRoom);
    }

    // To remove method on deploy
    private void addUserToTestChatroom(String uid) {
        try {
            Entity testRoom = datastore.get(keyFactory.newKey("1234goroom"));

            if (!testRoom.getNames().contains("allowed_users")) {
                testRoom = Entity.newBuilder(testRoom)
                                 .set("allowed_users",
                                    ListValue.of(Arrays.asList(
                                        StringValue.of(uid))))
                                 .build();

                datastore.put(testRoom);
                return;
            }

            List<Value<String>> allowedUsers =
                testRoom.getList("allowed_users");

            ListValue addAllowedUser = ListValue.newBuilder()
                                                .set(allowedUsers)
                                                .addValue(uid)
                                                .build();

            testRoom = Entity.newBuilder(testRoom)
                             .set("allowed_users", addAllowedUser)
                             .build();
            datastore.put(testRoom);

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

            Entity roomEntity = currentInstance.datastore.get(
                currentInstance.keyFactory.newKey(chatRoom));

            List<Value<String>> allowedRoomUID =
                roomEntity.getList("allowed_users");

            return allowedRoomUID.contains(StringValue.of(uid));
        } catch (Exception e) {
            e.printStackTrace();
        }

        return false;
    }
}