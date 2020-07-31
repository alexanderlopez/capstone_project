package com.google.sps;

import java.io.IOException;
import java.io.InputStream;

import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.appeengine.api.datastore.DatastoreServiceFactory;
import com.google.appenngine.api.datastore.DatastoreService;

import com.google.auth.oauth2.GoogleCredentials;

public final class CapstoneAuth {

    private static CapstoneAuth currentInstance;
    private DatastoreService datastoreService;

    private CapstoneAuth() {
        try {
            InputStream credentialInputStream = getClass().getResourceAsStream(
                "/chap-2020-capstone-firebase-adminsdk-93l38-698b686069.json");

            FirebaseOptions options = new FirebaseOptions.Builder()
                .setCredentials(GoogleCredentials.fromStream(credentialInputStream))
                .setDatabaseUrl("https://chap-2020-capstone.firebaseio.com/")
                .build();

            FirebaseApp.initializeApp(options);

            datastoreService = DatastoreServiceFactory.getDatastoreService();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static boolean isUserAuthenticated(String idToken) {
        if (currentInstance == null) {
            currentInstance = new CapstoneAuth();
        }

        try {
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String uid = decodedToken.getUid();

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
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String uid = decodedToken.getUid();

            
        } catch (FirebaseAuthException e) {
            e.printStackTrace();
        }
    }
}
