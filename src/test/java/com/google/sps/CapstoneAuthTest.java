package com.google.sps;

import java.io.IOException;


import org.junit.Test;
import org.junit.Before;
import org.junit.runner.RunWith;
import static org.junit.Assert.*;

import static org.mockito.Mockito.*;

import org.powermock.api.mockito.PowerMockito;
import org.powermock.modules.junit4.PowerMockRunner;
import org.powermock.core.classloader.annotations.PrepareForTest;

import com.google.cloud.datastore.Key;

import com.google.sps.CapstoneAuth;
import static com.google.sps.ChatWebSocket.*;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.auth.FirebaseAuthException;


@PrepareForTest({CapstoneAuth.class, UserRecord.class, FirebaseAuth.class,
    FirebaseToken.class})
@RunWith(PowerMockRunner.class)
public class CapstoneAuthTest {

    public static final String TEST_ID_TOKEN = "1234testtoken";
    public static final String TEST_UID = "testuid";
    public static final String TEST_FALSE_UID = "testfalseuid";
    public static final String TEST_EMAIL = "test@email.com";

    private CapstoneAuth capstoneAuth;

    private FirebaseToken mockToken;
    private FirebaseAuth mockFirebase;
    private UserRecord mockUser; 

    @Before
    public void setUp() throws NoSuchMethodException, InstantiationException, IllegalAccessException, FirebaseAuthException {

        mockFirebase = mock(FirebaseAuth.class);
        PowerMockito.mockStatic(FirebaseAuth.class);

        mockUser = mock(UserRecord.class);
        PowerMockito.mockStatic(UserRecord.class);

        when(FirebaseAuth.getInstance()).thenReturn(mockFirebase);

        when(mockFirebase.getUser(TEST_UID)).thenReturn(mockUser);

        mockToken = mock(FirebaseToken.class);
        PowerMockito.mockStatic(FirebaseToken.class);
     
        when(mockFirebase.verifyIdToken(TEST_UID)).thenReturn(mockToken);
        when(mockToken.getUid()).thenReturn(TEST_ID_TOKEN);

        capstoneAuth = (CapstoneAuth) CapstoneAuth.getInstance();

    }

    @Test
    public void testGetInstance_returnsValidInstance() throws IOException {
        assertSame(capstoneAuth.getInstance(), capstoneAuth);
    }

    @Test
    public void testGetUserEmail_returnsValidEmail() throws IOException {
        when(mockUser.getEmail()).thenReturn(TEST_EMAIL);

        assertEquals(capstoneAuth.getUserEmail(TEST_UID), TEST_EMAIL);
    }


    @Test(expected = NullPointerException.class)
    public void testGetUserEmail_throwsNullPointerForFalseID() throws IOException {
        when(mockUser.getEmail()).thenReturn(TEST_EMAIL);

        capstoneAuth.getUserEmail(TEST_FALSE_UID);
    } 

    @Test
    public void testIsUserAuth_returnsTrue() throws IOException, FirebaseAuthException {

       mockToken = mock(FirebaseToken.class);
       PowerMockito.mockStatic(FirebaseToken.class);
    
       when(mockFirebase.verifyIdToken(TEST_UID)).thenReturn(mockToken);
       when(mockToken.getUid()).thenReturn(TEST_ID_TOKEN);

       assertTrue(capstoneAuth.isUserAuthenticated(TEST_UID));
    }

    @Test(expected = NullPointerException.class)
    public void testIsUserAuth_throwsNullPointerForFalseID() throws IOException, FirebaseAuthException {

        mockToken = mock(FirebaseToken.class);
        PowerMockito.mockStatic(FirebaseToken.class);
     
        when(mockFirebase.verifyIdToken(TEST_UID)).thenReturn(mockToken);
        when(mockToken.getUid()).thenReturn(TEST_ID_TOKEN);

        capstoneAuth.isUserAuthenticated(TEST_FALSE_UID);
    }

    @Test
    public void testGetUserID_returnsUserID() throws IOException, FirebaseAuthException {

        mockToken = mock(FirebaseToken.class);
        PowerMockito.mockStatic(FirebaseToken.class);
     
        when(mockFirebase.verifyIdToken(TEST_UID)).thenReturn(mockToken);
        when(mockToken.getUid()).thenReturn(TEST_ID_TOKEN);

        assertEquals(capstoneAuth.getUserId(TEST_UID), TEST_ID_TOKEN);
    }

    @Test(expected = NullPointerException.class)
    public void testGetUserID_throwsNullPointerForFalseID() throws IOException, FirebaseAuthException {

        mockToken = mock(FirebaseToken.class);
        PowerMockito.mockStatic(FirebaseToken.class);
     
        when(mockFirebase.verifyIdToken(TEST_UID)).thenReturn(mockToken);
        when(mockToken.getUid()).thenReturn(TEST_ID_TOKEN);

        capstoneAuth.getUserId(TEST_FALSE_UID);
    }
}