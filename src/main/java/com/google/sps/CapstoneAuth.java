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

    public static final long TEST_ROOM_ID = 1;
    private static final String ALLOWED_USERS = "allowed_users";

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
        keyFactory = datastore.newKeyFactory().setKind(
            DatastoreManager.KIND_CHATROOM);
    }

    public static synchronized String getUserId(String idToken) {
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

    public static synchronized boolean isUserAuthenticated(String idToken) {
        if (currentInstance == null) {
            currentInstance = new CapstoneAuth();
        }

        try {
            FirebaseToken decodedToken =
                FirebaseAuth.getInstance().verifyIdToken(idToken);
            String uid = decodedToken.getUid();

            //TODO(lopezalexander) remove on deploy
            String userMail =
                FirebaseAuth.getInstance().getUser(uid).getEmail();
            DatastoreManager.getInstance().createTestRoom("Test Room", uid,
                userMail);

            return (uid != null);
        } catch (FirebaseAuthException e) {
            e.printStackTrace();
        }
        return false;
    }
}
