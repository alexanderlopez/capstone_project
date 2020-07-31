package com.google.sps;

import java.io.IOException;

import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.auth.FirebaseAuthException;

import com.google.auth.oauth2.GoogleCredentials;

public final class CapstoneAuth {

    private static CapstoneAuth currentInstance;

    private CapstoneAuth() {
        try {
            FirebaseOptions options = new FirebaseOptions.Builder()
                .setCredentials(GoogleCredentials.getApplicationDefault())
                .setDatabaseUrl("https://chap-2020-capstone.firebaseio.com/")
                .build();

            FirebaseApp.initializeApp(options);
        } catch (IOException e) {
            System.out.println("EPIC FAIL MAN");
        }
    }

    public static String isUserAuthenticated(String idToken) {
        if (currentInstance == null) {
            currentInstance = new CapstoneAuth();
        }

        try {
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String uid = decodedToken.getUid();
            return uid;
        } catch (FirebaseAuthException e) {
            e.printStackTrace(System.out);
        }
        return null;
    }
}
