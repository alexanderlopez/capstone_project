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
public class ChatWebSocketTest {

    public static final String TEST_ID_TOKEN = "1234testtoken";
    public static final String TEST_UID = "testuid";
    public static final String TEST_USER_NAME = "testname";
    public static final String TEST_MESSAGE = "Hello World!";
    public static final String TEST_TITLE = "TESTTITLE";
    public static final String TEST_BODY = "Test Body";
    public static final String TEST_THREAD = "testing";
    public static final String TEST_COLOR = "red";

    private DatastoreManager mockManager;
    private Session testSession;
    private WebSocketHandler mockHandler;

    @Before
    public void setUp() {
        mockManager = mock(DatastoreManager.class);
        when(mockManager.isUserAllowedChatroom(TEST_UID, 1)).thenReturn(true);
        when(mockManager.getUserName(TEST_UID)).thenReturn(TEST_USER_NAME);

        mockHandler = mock(WebSocketHandler.class);

        testSession = mock(Session.class);

        PowerMockito.mockStatic(DatastoreManager.class);
        when(DatastoreManager.getInstance()).thenReturn(mockManager);

        PowerMockito.mockStatic(WebSocketHandler.class);
        when(WebSocketHandler.getInstance()).thenReturn(mockHandler);
    }

    @Test
    public void checkOnOpen_addsSession() throws IOException {
        Map<String, String> pathParam =
            Collections.singletonMap(SOCKET_PARAMETER_ROOM, "1");
        when(testSession.getPathParameters())
            .thenReturn(pathParam);

        Map<String, List<String>> requestParam
            = Collections.singletonMap(SOCKET_PARAMETER_ID,
                Arrays.asList(TEST_ID_TOKEN));
        when(testSession.getRequestParameterMap()).thenReturn(requestParam);

        PowerMockito.mockStatic(CapstoneAuth.class);
        when(CapstoneAuth.isUserAuthenticated(TEST_ID_TOKEN)).thenReturn(true);
        when(CapstoneAuth.getUserId(TEST_ID_TOKEN)).thenReturn(TEST_UID);

        ChatWebSocket instance = new ChatWebSocket();
        instance.onOpen(testSession);

        verify(mockHandler, times(1)).addSession(1, testSession);
        assertEquals(1, instance.getRoomId());
        assertEquals(true, instance.getAuthenticated());
        assertEquals(TEST_UID, instance.getUID());
    }

    @Test
    public void checkOnTextMessageChat_jsonObjectBroadcastedCorrect()
            throws IOException, InterruptedException {
        // Arrange
        RemoteEndpoint.Basic basicEndpoint = mock(RemoteEndpoint.Basic.class);
        when(testSession.getBasicRemote()).thenReturn(basicEndpoint);

        when(mockHandler.getRoomList(1)).thenReturn(
            Arrays.asList(testSession));

        JSONObject jsonData = new JSONObject();
        jsonData.put(JSON_TYPE, MESSAGE_SEND);
        jsonData.put(JSON_MESSAGE, TEST_MESSAGE);
        jsonData.put(JSON_THREAD, TEST_THREAD);

        // Act
        ChatWebSocket instance = new ChatWebSocket(1, true, TEST_UID);
        instance.onTextMessage(testSession, jsonData.toString());

        // Assert
        JSONObject expectedBroadcast = new JSONObject();
        expectedBroadcast.put(JSON_TYPE, MESSAGE_RECEIVE);
        expectedBroadcast.put(JSON_MESSAGE, TEST_MESSAGE);
        expectedBroadcast.put(JSON_USER_ID, TEST_UID);
        expectedBroadcast.put(JSON_USER_NAME, TEST_USER_NAME);
        expectedBroadcast.put(JSON_THREAD, TEST_THREAD);

        ArgumentCaptor<String> stringArgument =
            ArgumentCaptor.forClass(String.class);

        verify(basicEndpoint, times(1)).sendText(stringArgument.capture());
        assertEquals(true, expectedBroadcast.similar(
            new JSONObject(stringArgument.getValue())));

        ArgumentCaptor<JSONObject> jsonArgument =
            ArgumentCaptor.forClass(JSONObject.class);

        Thread.sleep(100);

        verify(mockManager, times(1)).addMessage(eq(1L),
            jsonArgument.capture());
        assertEquals(true, expectedBroadcast.similar(
            jsonArgument.getValue()));
    }

    @Test
    public void checkOnTextMessageMap_jsonObjectBroadcastedCorrect()
            throws IOException, InterruptedException {
        // Arrange
        RemoteEndpoint.Basic basicEndpoint = mock(RemoteEndpoint.Basic.class);
        when(testSession.getBasicRemote()).thenReturn(basicEndpoint);

        Key markerKey = PowerMockito.mock(Key.class);
        when(markerKey.getId()).thenReturn(10L);
        when(mockManager.newMarkerKey(1)).thenReturn(markerKey);

        when(mockHandler.getRoomList(1)).thenReturn(
            Arrays.asList(testSession));

        JSONObject jsonData = new JSONObject();
        jsonData.put(JSON_TYPE, MAP_SEND);
        jsonData.put(JSON_TITLE, TEST_TITLE);
        jsonData.put(JSON_BODY, TEST_BODY);
        jsonData.put(JSON_LATITUDE, 1.5);
        jsonData.put(JSON_LONGITUDE, -2.5);
        jsonData.put(JSON_COLOR, TEST_COLOR);

        // Act
        ChatWebSocket instance = new ChatWebSocket(1, true, TEST_UID);
        instance.onTextMessage(testSession, jsonData.toString());

        // Assert
        JSONObject expectedBroadcast = new JSONObject();
        expectedBroadcast.put(JSON_ID, 10);
        expectedBroadcast.put(JSON_TYPE, MAP_RECEIVE);
        expectedBroadcast.put(JSON_TITLE, TEST_TITLE);
        expectedBroadcast.put(JSON_BODY, TEST_BODY);
        expectedBroadcast.put(JSON_LATITUDE, 1.5);
        expectedBroadcast.put(JSON_LONGITUDE, -2.5);
        expectedBroadcast.put(JSON_COLOR, TEST_COLOR);

        ArgumentCaptor<String> stringArgument =
            ArgumentCaptor.forClass(String.class);

        verify(basicEndpoint, times(1)).sendText(stringArgument.capture());

        expectedBroadcast = new JSONObject(expectedBroadcast.toString());

        String jsonString = stringArgument.getValue();
        assertEquals(true, expectedBroadcast.similar(
            new JSONObject(jsonString)));

        ArgumentCaptor<JSONObject> jsonArgument =
            ArgumentCaptor.forClass(JSONObject.class);

        Thread.sleep(100);

        verify(mockManager, times(1)).addMarker(any(Key.class),
            jsonArgument.capture());

        JSONObject broadcast = jsonArgument.getValue();
        expectedBroadcast = new JSONObject(expectedBroadcast.toString());
        broadcast = new JSONObject(broadcast.toString());

        assertEquals(true, expectedBroadcast.similar(broadcast));
    }

    @Test
    public void checkOnTextMessageDelete_jsonObjectBroadcastedCorrect()
            throws IOException {
        // Arrange
        RemoteEndpoint.Basic basicEndpoint = mock(RemoteEndpoint.Basic.class);
        when(testSession.getBasicRemote()).thenReturn(basicEndpoint);

        when(mockHandler.getRoomList(1)).thenReturn(Arrays.asList(testSession));

        JSONObject jsonData = new JSONObject();
        jsonData.put(JSON_TYPE, MAP_DELETE);
        jsonData.put(JSON_ID, 10L);

        // Act
        ChatWebSocket instance = new ChatWebSocket(1, true, TEST_UID);
        instance.onTextMessage(testSession, jsonData.toString());

        // Assert
        verify(mockManager, times(1)).deleteMarker(1L, 10L);

        ArgumentCaptor<String> stringArgument
             = ArgumentCaptor.forClass(String.class);

        verify(basicEndpoint, times(1)).sendText(stringArgument.capture());
        JSONObject broadcast = new JSONObject(stringArgument.getValue());
        JSONObject expectedBroadcast = new JSONObject(jsonData.toString());

        assertEquals(true, broadcast.similar(expectedBroadcast));
    }
}
