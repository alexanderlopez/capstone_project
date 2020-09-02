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

    private CapstoneAuth obj;

    private FirebaseToken mockToken;
    private FirebaseAuth mockFirebase;
    private UserRecord mockUser; 

    @Before
    public void setUp() throws NoSuchMethodException, InstantiationException, IllegalAccessException, FirebaseAuthException {

        mockFirebase = mock(FirebaseAuth.class);
        PowerMockito.mockStatic(FirebaseAuth.class);

        mockUser = mock(UserRecord.class);
        PowerMockito.mockStatic(UserRecord.class);

        mockToken = mock(FirebaseToken.class);
        PowerMockito.mockStatic(FirebaseToken.class);

        when(FirebaseAuth.getInstance()).thenReturn(mockFirebase);

        when(mockFirebase.getUser(TEST_UID)).thenReturn(mockUser);
        when(mockUser.getEmail()).thenReturn(TEST_EMAIL);

        when(mockFirebase.verifyIdToken(TEST_UID)).thenReturn(mockToken);
        when(mockToken.getUid()).thenReturn(TEST_ID_TOKEN);

        obj = (CapstoneAuth) CapstoneAuth.getInstance();

    }

    @Test
    public void testGetInstance_returnsValidInstance() throws IOException {
        assertEquals(obj.getInstance(), obj);
    }

    @Test
    public void testGetUserId_returnsValidId() throws IOException {
        assertEquals(obj.getUserEmail(TEST_UID), TEST_EMAIL);
    }


    @Test(expected = NullPointerException.class)
    public void testGetUserId_throwsNullPointerForFalseID() throws IOException {
        obj.getUserEmail(TEST_FALSE_UID);
    } 

    @Test
    public void testIsUserAuth_returnsTrue() throws IOException {
       assertTrue(obj.isUserAuthenticated(TEST_UID));
    }

    @Test(expected = NullPointerException.class)
    public void testIsUserAuth_throwsNullPointerForFalseID() throws IOException {
       obj.isUserAuthenticated(TEST_FALSE_UID);
    }

    @Test
    public void testGetUserID_returnsUserID() throws IOException {
        assertEquals(obj.getUserId(TEST_UID), TEST_ID_TOKEN);
    }

    @Test(expected = NullPointerException.class)
    public void testGetUserID_throwsNullPointerForFalseID() throws IOException {
        obj.getUserId(TEST_FALSE_UID);
    }
}