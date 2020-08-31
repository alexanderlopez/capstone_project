package com.google.sps;

import java.io.IOException;
import java.util.Map;
import java.util.Collections;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;

import javax.websocket.Session;
import javax.websocket.RemoteEndpoint;

import org.junit.Test;
import org.junit.Before;
import org.junit.runner.RunWith;
import static org.junit.Assert.assertEquals;

import org.json.JSONObject;

import org.mockito.ArgumentCaptor;
import static org.mockito.Mockito.*;

import org.powermock.api.mockito.PowerMockito;
import org.powermock.modules.junit4.PowerMockRunner;
import org.powermock.core.classloader.annotations.PrepareForTest;

import com.google.cloud.datastore.Key;

import com.google.sps.CapstoneAuth;
import com.google.sps.DatastoreManager;
import com.google.sps.ChatWebSocket;
import com.google.sps.WebSocketHandler;
import static com.google.sps.ChatWebSocket.*;

@PrepareForTest({CapstoneAuth.class, DatastoreManager.class,
    WebSocketHandler.class, Key.class})
@RunWith(PowerMockRunner.class)
public class CapstoneAuthTest {

    public static final String TEST_ID_TOKEN = "1234testtoken";
    public static final String TEST_UID = "testuid";
    public static final String TEST_USER_NAME = "testname";
    public static final String TEST_MESSAGE = "Hello World!";
    public static final String TEST_TITLE = "TESTTITLE";
    public static final String TEST_BODY = "Test Body";
    public static final String TEST_THREAD = "testing";
    public static final String TEST_COLOR = "red";

    private CapstoneAuth mockAuth;
    private Session testSession;
    private WebSocketHandler mockHandler;

    @Before
    public void setUp() {
        mockAuth = mock(CapstoneAuth.class);

        mockHandler = mock(WebSocketHandler.class);

        testSession = mock(Session.class);

        PowerMockito.mockStatic(DatastoreManager.class);
        when(DatastoreManager.getInstance()).thenReturn(mockManager);

        PowerMockito.mockStatic(WebSocketHandler.class);
        when(WebSocketHandler.getInstance()).thenReturn(mockHandler);
    }

    @Test
    public void testGetUserEmail_returnsValidEmail() throws IOException {    }

    @Test
    public void testGetUserId_returnsValidId() throws IOException 
    }

    @Test
    public void testIsUserAuth_returnsTrue() throws IOException {
    }

    @Test
    public void testGetUserEmail_returnsNullInvalidEmail() throws IOException {
    } 
}
